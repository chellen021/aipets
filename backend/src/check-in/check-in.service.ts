import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { CheckIn, CheckInType, CheckInStatus } from './entities/check-in.entity';
import { UsersService } from '../users/users.service';
import {
  CheckInDto,
  CheckInResponseDto,
  CheckInResultDto,
  CheckInStatusDto,
  CheckInHistoryQueryDto,
  CheckInStatsDto,
  CheckInCalendarDto,
  CheckInLeaderboardDto,
  CheckInLeaderboardQueryDto,
  MakeUpCheckInDto,
  MakeUpCheckInResultDto,
} from './dto/check-in.dto';
import { PaginatedResponseDto } from '../common/dto/base-response.dto';

@Injectable()
export class CheckInService {
  private readonly logger = new Logger(CheckInService.name);

  constructor(
    @InjectRepository(CheckIn)
    private readonly checkInRepository: Repository<CheckIn>,
    private readonly usersService: UsersService,
  ) {}

  /**
   * 用户签到
   */
  async checkIn(
    userId: string,
    checkInDto: CheckInDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<CheckInResultDto> {
    // 检查用户是否存在
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 检查今天是否已经签到
    const todayCheckIn = await this.checkInRepository.findOne({
      where: {
        userId,
        checkInDate: today,
      },
    });

    if (todayCheckIn) {
      return {
        success: false,
        message: '今天已经签到过了',
        checkIn: this.toCheckInResponseDto(todayCheckIn),
        totalPointsEarned: 0,
        totalExperienceEarned: 0,
      };
    }

    // 计算连续签到天数
    const consecutiveDays = await this.calculateConsecutiveDays(userId, today);
    
    // 计算奖励
    const rewards = this.calculateRewards(consecutiveDays);
    const isBonusDay = consecutiveDays > 0 && consecutiveDays % 7 === 0;
    const multiplier = this.calculateMultiplier(consecutiveDays);
    
    const finalPoints = Math.round(rewards.points * multiplier);
    const finalExperience = Math.round(rewards.experience * multiplier);

    // 解析设备信息
    const deviceType = this.parseDeviceType(userAgent);

    // 创建签到记录
    const checkIn = this.checkInRepository.create({
      type: CheckInType.DAILY,
      status: CheckInStatus.COMPLETED,
      checkInDate: today,
      pointsEarned: finalPoints,
      experienceEarned: finalExperience,
      consecutiveDays,
      isBonusDay,
      multiplier,
      rewards: {
        points: finalPoints,
        experience: finalExperience,
        items: rewards.items,
        badges: rewards.badges,
      },
      ipAddress,
      userAgent,
      deviceType,
      notes: checkInDto.notes,
      userId,
    });

    const savedCheckIn = await this.checkInRepository.save(checkIn);

    // 给用户增加积分和经验
    await this.usersService.addPoints(userId, finalPoints);
    await this.usersService.addExperience(userId, finalExperience);

    // 检查是否创造新纪录
    const stats = await this.getUserCheckInStats(userId);
    const newConsecutiveRecord = consecutiveDays > stats.longestStreak;

    // 计算下次奖励日
    const nextBonusDay = 7 - (consecutiveDays % 7);

    // 检查解锁的成就
    const achievements = await this.checkAchievements(userId, consecutiveDays, stats.totalCheckIns);

    this.logger.log(`用户 ${userId} 签到成功，连续 ${consecutiveDays} 天，获得 ${finalPoints} 积分`);

    return {
      success: true,
      message: isBonusDay ? `连续签到 ${consecutiveDays} 天，获得奖励！` : '签到成功！',
      checkIn: this.toCheckInResponseDto(savedCheckIn),
      totalPointsEarned: finalPoints,
      totalExperienceEarned: finalExperience,
      newConsecutiveRecord,
      nextBonusDay: nextBonusDay === 7 ? 0 : nextBonusDay,
      achievements,
    };
  }

  /**
   * 获取用户签到状态
   */
  async getCheckInStatus(userId: string): Promise<CheckInStatusDto> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 检查今天是否已签到
    const todayCheckIn = await this.checkInRepository.findOne({
      where: {
        userId,
        checkInDate: today,
      },
    });

    const hasCheckedInToday = !!todayCheckIn;
    const canCheckIn = !hasCheckedInToday;

    // 获取统计信息
    const stats = await this.getUserCheckInStats(userId);
    
    // 计算预估奖励
    const nextConsecutiveDays = hasCheckedInToday ? stats.consecutiveDays : stats.consecutiveDays + 1;
    const estimatedRewards = this.calculateRewards(nextConsecutiveDays);
    const estimatedMultiplier = this.calculateMultiplier(nextConsecutiveDays);

    const nextBonusDay = hasCheckedInToday ? 
      (7 - (stats.consecutiveDays % 7)) : 
      (7 - (nextConsecutiveDays % 7));

    return {
      canCheckIn,
      hasCheckedInToday,
      todayCheckIn: todayCheckIn ? this.toCheckInResponseDto(todayCheckIn) : undefined,
      consecutiveDays: stats.consecutiveDays,
      totalCheckIns: stats.totalCheckIns,
      thisMonthCheckIns: stats.thisMonthCheckIns,
      longestStreak: stats.longestStreak,
      nextBonusDay: nextBonusDay === 7 ? 0 : nextBonusDay,
      estimatedRewards: {
        points: Math.round(estimatedRewards.points * estimatedMultiplier),
        experience: Math.round(estimatedRewards.experience * estimatedMultiplier),
        multiplier: estimatedMultiplier,
      },
    };
  }

  /**
   * 获取用户签到历史
   */
  async getCheckInHistory(
    userId: string,
    query: CheckInHistoryQueryDto,
  ): Promise<PaginatedResponseDto<CheckInResponseDto>> {
    const {
      page = 1,
      limit = 20,
      type,
      status,
      startDate,
      endDate,
      sortBy = 'checkInDate',
      sortOrder = 'DESC',
      bonusDaysOnly,
      thisMonthOnly,
    } = query;

    const queryBuilder = this.checkInRepository.createQueryBuilder('checkIn')
      .where('checkIn.userId = :userId', { userId });

    // 应用过滤条件
    if (type) {
      queryBuilder.andWhere('checkIn.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('checkIn.status = :status', { status });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('checkIn.checkInDate BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    if (bonusDaysOnly) {
      queryBuilder.andWhere('checkIn.isBonusDay = true');
    }

    if (thisMonthOnly) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      queryBuilder.andWhere('checkIn.checkInDate BETWEEN :startOfMonth AND :endOfMonth', {
        startOfMonth,
        endOfMonth,
      });
    }

    // 排序
    queryBuilder.orderBy(`checkIn.${sortBy}`, sortOrder);

    // 分页
    const [checkIns, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const checkInDtos = checkIns.map(checkIn => this.toCheckInResponseDto(checkIn));

    return {
      data: checkInDtos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * 获取用户签到统计
   */
  async getUserCheckInStats(userId: string): Promise<CheckInStatsDto> {
    const checkIns = await this.checkInRepository.find({
      where: { userId },
      order: { checkInDate: 'ASC' },
    });

    const totalCheckIns = checkIns.length;
    const totalPointsEarned = checkIns.reduce((sum, c) => sum + c.pointsEarned, 0);
    const totalExperienceEarned = checkIns.reduce((sum, c) => sum + c.experienceEarned, 0);
    const averagePointsPerDay = totalCheckIns > 0 ? Math.round(totalPointsEarned / totalCheckIns) : 0;
    const bonusDaysCount = checkIns.filter(c => c.isBonusDay).length;

    // 计算当前连续签到天数
    const consecutiveDays = await this.calculateConsecutiveDays(userId, new Date());
    
    // 计算最长连续签到天数
    const longestStreak = this.calculateLongestStreak(checkIns);

    // 本月签到统计
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthCheckIns = checkIns.filter(c => c.checkInDate >= startOfMonth).length;

    // 本周签到统计
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const thisWeekCheckIns = checkIns.filter(c => c.checkInDate >= startOfWeek).length;

    // 计算签到率（基于用户注册时间）
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('用户不存在');
    }
    const daysSinceRegistration = Math.floor(
      (now.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
    const checkInRate = Math.round((totalCheckIns / daysSinceRegistration) * 100);

    // 月度统计
    const monthlyStats = this.calculateMonthlyStats(checkIns);

    // 周模式统计
    const weeklyPattern = this.calculateWeeklyPattern(checkIns);

    return {
      totalCheckIns,
      consecutiveDays,
      longestStreak,
      totalPointsEarned,
      totalExperienceEarned,
      averagePointsPerDay,
      thisMonthCheckIns,
      thisWeekCheckIns,
      bonusDaysCount,
      checkInRate: Math.min(100, checkInRate),
      monthlyStats,
      weeklyPattern,
    };
  }

  /**
   * 获取签到日历
   */
  async getCheckInCalendar(userId: string, year: number, month: number): Promise<CheckInCalendarDto> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const checkIns = await this.checkInRepository.find({
      where: {
        userId,
        checkInDate: Between(startDate, endDate),
      },
      order: { checkInDate: 'ASC' },
    });

    const checkInMap = new Map<string, CheckIn>();
    checkIns.forEach(checkIn => {
      const dateKey = checkIn.checkInDate.toISOString().split('T')[0];
      checkInMap.set(dateKey, checkIn);
    });

    const today = new Date();
    const daysInMonth = endDate.getDate();
    const days: any[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateKey = date.toISOString().split('T')[0];
      const checkIn = checkInMap.get(dateKey);
      const isToday = date.toDateString() === today.toDateString();
      const isFuture = date > today;

      days.push({
        date: day,
        hasCheckIn: !!checkIn,
        checkIn: checkIn ? {
          id: checkIn.id,
          points: checkIn.pointsEarned,
          experience: checkIn.experienceEarned,
          consecutiveDays: checkIn.consecutiveDays,
          isBonusDay: checkIn.isBonusDay,
          status: checkIn.status,
        } : undefined,
        isToday,
        isFuture,
      });
    }

    // 月度统计
    const totalDays = daysInMonth;
    const checkInDays = checkIns.length;
    const missedDays = Math.max(0, Math.min(totalDays, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1) - checkInDays);
    const bonusDays = checkIns.filter(c => c.isBonusDay).length;
    const totalPoints = checkIns.reduce((sum, c) => sum + c.pointsEarned, 0);
    const totalExperience = checkIns.reduce((sum, c) => sum + c.experienceEarned, 0);
    const checkInRate = Math.round((checkInDays / Math.min(totalDays, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)) * 100);

    return {
      year,
      month,
      days,
      monthlyStats: {
        totalDays,
        checkInDays,
        missedDays,
        bonusDays,
        totalPoints,
        totalExperience,
        checkInRate: Math.min(100, checkInRate),
      },
    };
  }

  /**
   * 补签
   */
  async makeUpCheckIn(
    userId: string,
    makeUpDto: MakeUpCheckInDto,
  ): Promise<MakeUpCheckInResultDto> {
    const targetDate = new Date(makeUpDto.targetDate);
    targetDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 检查补签日期是否有效
    if (targetDate >= today) {
      throw new BadRequestException('不能补签今天或未来的日期');
    }

    // 检查是否已经签到过
    const existingCheckIn = await this.checkInRepository.findOne({
      where: {
        userId,
        checkInDate: targetDate,
      },
    });

    if (existingCheckIn) {
      throw new BadRequestException('该日期已经签到过了');
    }

    // 检查补签限制（只能补签最近7天）
    const daysDiff = Math.floor((today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 7) {
      throw new BadRequestException('只能补签最近7天的记录');
    }

    // 计算补签成本（需要消耗积分）
    const cost = {
      points: daysDiff * 10, // 每天10积分
    };

    // 检查用户积分是否足够
    const user = await this.usersService.findById(userId);
    if (!user || user.points < cost.points) {
      throw new BadRequestException('积分不足，无法补签');
    }

    // 扣除积分
    await this.usersService.addPoints(userId, -cost.points);

    // 计算连续签到天数（基于补签日期）
    const consecutiveDays = await this.calculateConsecutiveDays(userId, targetDate);
    
    // 计算奖励（补签奖励减半）
    const rewards = this.calculateRewards(consecutiveDays);
    const finalPoints = Math.round(rewards.points * 0.5);
    const finalExperience = Math.round(rewards.experience * 0.5);

    // 创建补签记录
    const checkIn = this.checkInRepository.create({
      type: CheckInType.DAILY,
      status: CheckInStatus.COMPLETED,
      checkInDate: targetDate,
      pointsEarned: finalPoints,
      experienceEarned: finalExperience,
      consecutiveDays,
      isBonusDay: false, // 补签不算奖励日
      multiplier: 0.5,
      rewards: {
        points: finalPoints,
        experience: finalExperience,
      },
      notes: `补签：${makeUpDto.reason || '用户补签'}`,
      userId,
    });

    const savedCheckIn = await this.checkInRepository.save(checkIn);

    // 给用户增加奖励
    await this.usersService.addPoints(userId, finalPoints);
    await this.usersService.addExperience(userId, finalExperience);

    this.logger.log(`用户 ${userId} 补签 ${targetDate.toISOString().split('T')[0]}，消耗 ${cost.points} 积分`);

    return {
      success: true,
      message: '补签成功',
      checkIn: this.toCheckInResponseDto(savedCheckIn),
      cost,
    };
  }

  /**
   * 计算连续签到天数
   */
  private async calculateConsecutiveDays(userId: string, currentDate: Date): Promise<number> {
    const checkDate = new Date(currentDate);
    checkDate.setHours(0, 0, 0, 0);
    
    let consecutiveDays = 1; // 包含当前签到
    let checkingDate = new Date(checkDate);
    
    while (true) {
      checkingDate.setDate(checkingDate.getDate() - 1);
      
      const checkIn = await this.checkInRepository.findOne({
        where: {
          userId,
          checkInDate: checkingDate,
        },
      });
      
      if (checkIn) {
        consecutiveDays++;
      } else {
        break;
      }
    }
    
    return consecutiveDays;
  }

  /**
   * 计算最长连续签到天数
   */
  private calculateLongestStreak(checkIns: CheckIn[]): number {
    if (checkIns.length === 0) return 0;
    
    let maxStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < checkIns.length; i++) {
      const prevDate = new Date(checkIns[i - 1].checkInDate);
      const currentDate = new Date(checkIns[i].checkInDate);
      
      const dayDiff = Math.floor(
        (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (dayDiff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    return maxStreak;
  }

  /**
   * 计算签到奖励
   */
  private calculateRewards(consecutiveDays: number): {
    points: number;
    experience: number;
    items?: string[];
    badges?: string[];
  } {
    let basePoints = 10;
    let baseExperience = 5;
    const items: string[] = [];
    const badges: string[] = [];
    
    // 连续签到奖励
    if (consecutiveDays >= 30) {
      basePoints += 20;
      baseExperience += 10;
      items.push('高级宠物食物');
    } else if (consecutiveDays >= 14) {
      basePoints += 15;
      baseExperience += 8;
      items.push('中级宠物食物');
    } else if (consecutiveDays >= 7) {
      basePoints += 10;
      baseExperience += 5;
      items.push('初级宠物食物');
      badges.push('一周签到达人');
    }
    
    return {
      points: basePoints,
      experience: baseExperience,
      items: items.length > 0 ? items : undefined,
      badges: badges.length > 0 ? badges : undefined,
    };
  }

  /**
   * 计算奖励倍数
   */
  private calculateMultiplier(consecutiveDays: number): number {
    if (consecutiveDays >= 30) return 3;
    if (consecutiveDays >= 14) return 2.5;
    if (consecutiveDays >= 7) return 2;
    if (consecutiveDays >= 3) return 1.5;
    return 1;
  }

  /**
   * 计算月度统计
   */
  private calculateMonthlyStats(checkIns: CheckIn[]): CheckInStatsDto['monthlyStats'] {
    const monthlyMap = new Map<string, { checkIns: number; points: number; experience: number; bonusDays: number }>();
    
    checkIns.forEach(checkIn => {
      const monthKey = `${checkIn.checkInDate.getFullYear()}-${String(checkIn.checkInDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { checkIns: 0, points: 0, experience: 0, bonusDays: 0 });
      }
      
      const stats = monthlyMap.get(monthKey)!;
      stats.checkIns++;
      stats.points += checkIn.pointsEarned;
      stats.experience += checkIn.experienceEarned;
      if (checkIn.isBonusDay) stats.bonusDays++;
    });
    
    return Array.from(monthlyMap.entries())
      .map(([month, stats]) => ({ month, ...stats }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * 计算周模式统计
   */
  private calculateWeeklyPattern(checkIns: CheckIn[]): CheckInStatsDto['weeklyPattern'] {
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weeklyCount = new Array(7).fill(0);
    
    checkIns.forEach(checkIn => {
      const dayOfWeek = checkIn.checkInDate.getDay();
      weeklyCount[dayOfWeek]++;
    });
    
    const totalCheckIns = checkIns.length;
    
    return weeklyCount.map((count, index) => ({
      dayOfWeek: index,
      dayName: dayNames[index],
      checkIns: count,
      rate: totalCheckIns > 0 ? Math.round((count / totalCheckIns) * 100) : 0,
    }));
  }

  /**
   * 检查成就
   */
  private async checkAchievements(userId: string, consecutiveDays: number, totalCheckIns: number): Promise<string[]> {
    const achievements: string[] = [];
    
    // 连续签到成就
    if (consecutiveDays === 7) achievements.push('连续签到一周');
    if (consecutiveDays === 30) achievements.push('连续签到一月');
    if (consecutiveDays === 100) achievements.push('连续签到百日');
    
    // 总签到成就
    if (totalCheckIns === 10) achievements.push('签到新手');
    if (totalCheckIns === 50) achievements.push('签到达人');
    if (totalCheckIns === 100) achievements.push('签到专家');
    if (totalCheckIns === 365) achievements.push('签到大师');
    
    return achievements;
  }

  /**
   * 解析设备类型
   */
  private parseDeviceType(userAgent?: string): string {
    if (!userAgent) return 'unknown';
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  /**
   * 转换为CheckInResponseDto
   */
  private toCheckInResponseDto(checkIn: CheckIn): CheckInResponseDto {
    return {
      id: checkIn.id,
      type: checkIn.type,
      status: checkIn.status,
      checkInDate: checkIn.checkInDate,
      pointsEarned: checkIn.pointsEarned,
      experienceEarned: checkIn.experienceEarned,
      consecutiveDays: checkIn.consecutiveDays,
      isBonusDay: checkIn.isBonusDay,
      multiplier: checkIn.multiplier,
      rewards: checkIn.rewards,
      rewardDescription: checkIn.getRewardDescription(),
      statusDescription: checkIn.getStatusDescription(),
      userId: checkIn.userId,
      createdAt: checkIn.createdAt,
    };
  }
}