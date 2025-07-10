import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CheckInService } from './check-in.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  CheckInDto,
  CheckInResultDto,
  CheckInStatusDto,
  CheckInHistoryQueryDto,
  CheckInStatsDto,
  CheckInCalendarDto,
  MakeUpCheckInDto,
  MakeUpCheckInResultDto,
} from './dto/check-in.dto';
import { PaginatedResponseDto } from '../common/dto/base-response.dto';
import { CheckInResponseDto } from './dto/check-in.dto';

@ApiTags('签到管理')
@Controller('check-in')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户签到' })
  @ApiResponse({
    status: 200,
    description: '签到成功',
    type: CheckInResultDto,
  })
  @ApiResponse({ status: 400, description: '今天已经签到过了' })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async checkIn(
    @Request() req: any,
    @Body(ValidationPipe) checkInDto: CheckInDto,
  ): Promise<CheckInResultDto> {
    const userId = req.user.id;
    const ipAddress = this.getClientIp(req);
    const userAgent = req.headers['user-agent'];

    return this.checkInService.checkIn(userId, checkInDto, ipAddress, userAgent);
  }

  @Get('status')
  @ApiOperation({ summary: '获取签到状态' })
  @ApiResponse({
    status: 200,
    description: '获取签到状态成功',
    type: CheckInStatusDto,
  })
  @ApiResponse({ status: 401, description: '未授权' })
  async getCheckInStatus(@Request() req: any): Promise<CheckInStatusDto> {
    const userId = req.user.id;
    return this.checkInService.getCheckInStatus(userId);
  }

  @Get('history')
  @ApiOperation({ summary: '获取签到历史' })
  @ApiResponse({
    status: 200,
    description: '获取签到历史成功',
    type: PaginatedResponseDto<CheckInResponseDto>,
  })
  @ApiResponse({ status: 401, description: '未授权' })
  async getCheckInHistory(
    @Request() req: any,
    @Query(ValidationPipe) query: CheckInHistoryQueryDto,
  ): Promise<PaginatedResponseDto<CheckInResponseDto>> {
    const userId = req.user.id;
    return this.checkInService.getCheckInHistory(userId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取签到统计' })
  @ApiResponse({
    status: 200,
    description: '获取签到统计成功',
    type: CheckInStatsDto,
  })
  @ApiResponse({ status: 401, description: '未授权' })
  async getCheckInStats(@Request() req: any): Promise<CheckInStatsDto> {
    const userId = req.user.id;
    return this.checkInService.getUserCheckInStats(userId);
  }

  @Get('calendar')
  @ApiOperation({ summary: '获取签到日历' })
  @ApiResponse({
    status: 200,
    description: '获取签到日历成功',
    type: CheckInCalendarDto,
  })
  @ApiResponse({ status: 401, description: '未授权' })
  @ApiResponse({ status: 400, description: '无效的年份或月份' })
  async getCheckInCalendar(
    @Request() req: any,
    @Query('year', ParseIntPipe) year: number,
    @Query('month', ParseIntPipe) month: number,
  ): Promise<CheckInCalendarDto> {
    const userId = req.user.id;
    
    // 验证年份和月份
    if (year < 2020 || year > 2030) {
      throw new Error('年份必须在2020-2030之间');
    }
    if (month < 1 || month > 12) {
      throw new Error('月份必须在1-12之间');
    }

    return this.checkInService.getCheckInCalendar(userId, year, month);
  }

  @Post('makeup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '补签' })
  @ApiResponse({
    status: 200,
    description: '补签成功',
    type: MakeUpCheckInResultDto,
  })
  @ApiResponse({ status: 400, description: '补签失败' })
  @ApiResponse({ status: 401, description: '未授权' })
  async makeUpCheckIn(
    @Request() req: any,
    @Body(ValidationPipe) makeUpDto: MakeUpCheckInDto,
  ): Promise<MakeUpCheckInResultDto> {
    const userId = req.user.id;
    return this.checkInService.makeUpCheckIn(userId, makeUpDto);
  }

  @Get('calendar/current')
  @ApiOperation({ summary: '获取当前月份签到日历' })
  @ApiResponse({
    status: 200,
    description: '获取当前月份签到日历成功',
    type: CheckInCalendarDto,
  })
  @ApiResponse({ status: 401, description: '未授权' })
  async getCurrentMonthCalendar(@Request() req: any): Promise<CheckInCalendarDto> {
    const userId = req.user.id;
    const now = new Date();
    return this.checkInService.getCheckInCalendar(userId, now.getFullYear(), now.getMonth() + 1);
  }

  @Get('today')
  @ApiOperation({ summary: '获取今日签到信息' })
  @ApiResponse({
    status: 200,
    description: '获取今日签到信息成功',
  })
  @ApiResponse({ status: 401, description: '未授权' })
  async getTodayCheckIn(@Request() req: any) {
    const userId = req.user.id;
    const status = await this.checkInService.getCheckInStatus(userId);
    
    return {
      hasCheckedIn: status.hasCheckedInToday,
      canCheckIn: status.canCheckIn,
      checkIn: status.todayCheckIn,
      consecutiveDays: status.consecutiveDays,
      estimatedRewards: status.estimatedRewards,
      nextBonusDay: status.nextBonusDay,
    };
  }

  @Get('streak')
  @ApiOperation({ summary: '获取连续签到信息' })
  @ApiResponse({
    status: 200,
    description: '获取连续签到信息成功',
  })
  @ApiResponse({ status: 401, description: '未授权' })
  async getStreakInfo(@Request() req: any) {
    const userId = req.user.id;
    const stats = await this.checkInService.getUserCheckInStats(userId);
    
    return {
      currentStreak: stats.consecutiveDays,
      longestStreak: stats.longestStreak,
      nextBonusDay: Math.max(0, 7 - (stats.consecutiveDays % 7)),
      streakLevel: this.getStreakLevel(stats.consecutiveDays),
      nextMilestone: this.getNextMilestone(stats.consecutiveDays),
    };
  }

  @Get('rewards/preview')
  @ApiOperation({ summary: '预览签到奖励' })
  @ApiResponse({
    status: 200,
    description: '获取签到奖励预览成功',
  })
  @ApiResponse({ status: 401, description: '未授权' })
  async getRewardsPreview(@Request() req: any) {
    const userId = req.user.id;
    const status = await this.checkInService.getCheckInStatus(userId);
    
    if (status.hasCheckedInToday) {
      return {
        message: '今天已经签到过了',
        todayRewards: null,
        tomorrowRewards: status.estimatedRewards,
      };
    }
    
    return {
      message: '今天还未签到',
      todayRewards: status.estimatedRewards,
      tomorrowRewards: null,
    };
  }

  /**
   * 获取客户端IP地址
   */
  private getClientIp(req: any): string {
    return (
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      'unknown'
    );
  }

  /**
   * 获取连续签到等级
   */
  private getStreakLevel(consecutiveDays: number): string {
    if (consecutiveDays >= 365) return '签到大师';
    if (consecutiveDays >= 100) return '签到专家';
    if (consecutiveDays >= 30) return '签到达人';
    if (consecutiveDays >= 7) return '签到新手';
    return '初学者';
  }

  /**
   * 获取下一个里程碑
   */
  private getNextMilestone(consecutiveDays: number): { days: number; title: string } | null {
    const milestones = [
      { days: 7, title: '一周签到' },
      { days: 30, title: '一月签到' },
      { days: 100, title: '百日签到' },
      { days: 365, title: '一年签到' },
    ];
    
    for (const milestone of milestones) {
      if (consecutiveDays < milestone.days) {
        return milestone;
      }
    }
    
    return null;
  }
}