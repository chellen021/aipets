import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserLoginLog } from './entities/user-login-log.entity';
import { UpdateUserDto, UserDto, UserStatsDto, UserBriefDto } from './dto/user.dto';
import { UploadService } from '../upload/upload.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserLoginLog)
    private readonly userLoginLogRepository: Repository<UserLoginLog>,
    private readonly uploadService: UploadService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 根据OpenID查找用户
   */
  async findByOpenId(openid: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { openid } });
  }

  /**
   * 根据ID查找用户
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * 创建新用户
   */
  async create(userData: {
    openid: string;
    unionid?: string;
    nickname: string;
    avatar?: string;
    gender?: 'male' | 'female' | 'unknown';
  }): Promise<User> {
    // 检查用户是否已存在
    const existingUser = await this.findByOpenId(userData.openid);
    if (existingUser) {
      throw new ConflictException('用户已存在');
    }

    const user = this.userRepository.create({
      ...userData,
      points: 100, // 新用户赠送100积分
      level: 1,
      experience: 0,
      consecutiveCheckins: 0,
      totalCheckins: 0,
      notificationsEnabled: true,
      privacySettings: {},
      status: 'active',
    });

    return this.userRepository.save(user);
  }

  /**
   * 更新用户信息
   */
  async update(id: string, updateData: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 更新用户信息
    Object.assign(user, updateData);
    
    return this.userRepository.save(user);
  }

  /**
   * 更新用户头像
   */
  async updateAvatar(id: string, avatarUrl: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 如果用户已有头像，删除旧头像文件
    if (user.avatar) {
      await this.uploadService.deleteFileByUrl(user.avatar);
    }

    user.avatar = avatarUrl;
    return this.userRepository.save(user);
  }

  /**
   * 上传并更新用户头像
   */
  async uploadAndUpdateAvatar(id: string, file: Express.Multer.File): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 上传新头像
    const uploadResult = await this.uploadService.uploadAvatar(file, id);
    
    // 如果用户已有头像，删除旧头像文件
    if (user.avatar) {
      await this.uploadService.deleteFileByUrl(user.avatar);
    }

    // 更新用户头像URL
    user.avatar = uploadResult.url;
    return this.userRepository.save(user);
  }

  /**
   * 更新用户设置
   */
  async updateSettings(
    id: string,
    settings: {
      notificationsEnabled?: boolean;
      privacySettings?: Record<string, any>;
    },
  ): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (settings.notificationsEnabled !== undefined) {
      user.notificationsEnabled = settings.notificationsEnabled;
    }

    if (settings.privacySettings) {
      user.privacySettings = { ...user.privacySettings, ...settings.privacySettings };
    }

    return this.userRepository.save(user);
  }

  /**
   * 获取用户统计信息
   */
  async getUserStats(id: string): Promise<UserStatsDto> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // TODO: 从其他服务获取宠物数量和互动次数
    const petCount = 0; // 暂时设为0，后续从宠物服务获取
    const interactionCount = 0; // 暂时设为0，后续从互动服务获取

    return {
      points: user.points,
      level: user.level,
      experience: user.experience,
      nextLevelExperience: user.getNextLevelExperience(),
      consecutiveCheckins: user.consecutiveCheckins,
      totalCheckins: user.totalCheckins,
      petCount,
      interactionCount,
    };
  }

  /**
   * 添加用户积分
   */
  async addPoints(id: string, points: number, reason?: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    user.addPoints(points);
    
    // TODO: 记录积分变动日志
    
    return this.userRepository.save(user);
  }

  /**
   * 扣除用户积分
   */
  async deductPoints(id: string, points: number, reason?: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (!user.deductPoints(points)) {
      throw new BadRequestException('积分不足');
    }

    // TODO: 记录积分变动日志
    
    return this.userRepository.save(user);
  }

  /**
   * 添加用户经验值
   */
  async addExperience(id: string, experience: number): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const oldLevel = user.level;
    user.addExperience(experience);
    
    const savedUser = await this.userRepository.save(user);
    
    // 如果升级了，可以发送通知或奖励
    if (savedUser.level > oldLevel) {
      // TODO: 发送升级通知
      // TODO: 发放升级奖励
    }
    
    return savedUser;
  }

  /**
   * 记录用户登录日志
   */
  async logLogin(
    userId: string,
    ipAddress: string,
    userAgent?: string,
    status: 'success' | 'failed' = 'success',
    failureReason?: string,
  ): Promise<UserLoginLog> {
    const loginLog = this.userLoginLogRepository.create({
      userId,
      ipAddress,
      userAgent,
      status,
      failureReason,
      deviceType: this.parseDeviceType(userAgent),
      operatingSystem: this.parseOperatingSystem(userAgent),
      browser: this.parseBrowser(userAgent),
    });

    return this.userLoginLogRepository.save(loginLog);
  }

  /**
   * 更新用户最后登录信息
   */
  async updateLastLogin(id: string, ipAddress: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    user.lastLoginAt = new Date();
    user.lastLoginIp = ipAddress;
    
    return this.userRepository.save(user);
  }

  /**
   * 获取用户简要信息（用于排行榜等）
   */
  async getUserBrief(id: string): Promise<UserBriefDto> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      level: user.level,
      points: user.points,
    };
  }

  /**
   * 转换用户实体为DTO
   */
  toDto(user: User): UserDto {
    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      gender: user.gender,
      birthday: user.birthday ? (user.birthday instanceof Date ? user.birthday.toISOString().split('T')[0] : user.birthday) : undefined,
      points: user.points,
      level: user.level,
      experience: user.experience,
      consecutiveCheckins: user.consecutiveCheckins,
      totalCheckins: user.totalCheckins,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  /**
   * 解析设备类型
   */
  private parseDeviceType(userAgent?: string): 'mobile' | 'desktop' | 'tablet' | 'unknown' {
    if (!userAgent) return 'unknown';
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    }
    if (ua.includes('windows') || ua.includes('macintosh') || ua.includes('linux')) {
      return 'desktop';
    }
    return 'unknown';
  }

  /**
   * 解析操作系统
   */
  private parseOperatingSystem(userAgent?: string): string | undefined {
    if (!userAgent) return undefined;
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('macintosh') || ua.includes('mac os')) return 'macOS';
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
    
    return undefined;
  }

  /**
   * 解析浏览器
   */
  private parseBrowser(userAgent?: string): string | undefined {
    if (!userAgent) return undefined;
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari')) return 'Safari';
    if (ua.includes('edge')) return 'Edge';
    if (ua.includes('opera')) return 'Opera';
    
    return undefined;
  }
}