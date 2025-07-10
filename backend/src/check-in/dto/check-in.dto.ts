import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CheckInType, CheckInStatus } from '../entities/check-in.entity';
import { BasePaginationDto } from '../../common/dto/base-response.dto';

/**
 * 签到DTO
 */
export class CheckInDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * 签到响应DTO
 */
export class CheckInResponseDto {
  id: string;
  type: CheckInType;
  status: CheckInStatus;
  checkInDate: Date;
  pointsEarned: number;
  experienceEarned: number;
  consecutiveDays: number;
  isBonusDay: boolean;
  multiplier: number;
  rewards?: {
    points?: number;
    experience?: number;
    items?: string[];
    badges?: string[];
    specialRewards?: any[];
  };
  rewardDescription: string;
  statusDescription: string;
  userId: string;
  createdAt: Date;
}

/**
 * 签到结果DTO
 */
export class CheckInResultDto {
  success: boolean;
  message: string;
  checkIn?: CheckInResponseDto;
  totalPointsEarned: number;
  totalExperienceEarned: number;
  newConsecutiveRecord?: boolean;
  nextBonusDay?: number; // 距离下次奖励日的天数
  achievements?: string[]; // 解锁的成就
}

/**
 * 签到状态DTO
 */
export class CheckInStatusDto {
  canCheckIn: boolean;
  hasCheckedInToday: boolean;
  todayCheckIn?: CheckInResponseDto;
  consecutiveDays: number;
  totalCheckIns: number;
  thisMonthCheckIns: number;
  longestStreak: number;
  nextBonusDay: number;
  estimatedRewards: {
    points: number;
    experience: number;
    multiplier: number;
  };
}

/**
 * 签到历史查询DTO
 */
export class CheckInHistoryQueryDto extends BasePaginationDto {
  @IsOptional()
  @IsEnum(CheckInType)
  type?: CheckInType;

  @IsOptional()
  @IsEnum(CheckInStatus)
  status?: CheckInStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Boolean)
  bonusDaysOnly?: boolean; // 只显示奖励日

  @IsOptional()
  @Type(() => Boolean)
  thisMonthOnly?: boolean; // 只显示本月
}

/**
 * 签到统计DTO
 */
export class CheckInStatsDto {
  totalCheckIns: number;
  consecutiveDays: number;
  longestStreak: number;
  totalPointsEarned: number;
  totalExperienceEarned: number;
  averagePointsPerDay: number;
  thisMonthCheckIns: number;
  thisWeekCheckIns: number;
  bonusDaysCount: number;
  checkInRate: number; // 签到率（百分比）
  monthlyStats: {
    month: string;
    checkIns: number;
    points: number;
    experience: number;
    bonusDays: number;
  }[];
  weeklyPattern: {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    dayName: string;
    checkIns: number;
    rate: number;
  }[];
}

/**
 * 签到日历DTO
 */
export class CheckInCalendarDto {
  year: number;
  month: number;
  days: {
    date: number;
    hasCheckIn: boolean;
    checkIn?: {
      id: string;
      points: number;
      experience: number;
      consecutiveDays: number;
      isBonusDay: boolean;
      status: CheckInStatus;
    };
    isToday: boolean;
    isFuture: boolean;
  }[];
  monthlyStats: {
    totalDays: number;
    checkInDays: number;
    missedDays: number;
    bonusDays: number;
    totalPoints: number;
    totalExperience: number;
    checkInRate: number;
  };
}

/**
 * 签到排行榜DTO
 */
export class CheckInLeaderboardDto {
  rank: number;
  user: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  consecutiveDays: number;
  totalCheckIns: number;
  totalPoints: number;
  longestStreak: number;
  checkInRate: number;
  lastCheckIn: Date;
}

/**
 * 签到排行榜查询DTO
 */
export class CheckInLeaderboardQueryDto extends BasePaginationDto {
  @IsOptional()
  @IsEnum(['consecutiveDays', 'totalCheckIns', 'totalPoints', 'longestStreak', 'checkInRate'])
  rankBy?: string;

  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly', 'all'])
  period?: string;

  @IsOptional()
  @Type(() => Boolean)
  activeOnly?: boolean; // 只显示活跃用户（最近7天有签到）
}

/**
 * 签到奖励配置DTO
 */
export class CheckInRewardConfigDto {
  basePoints: number;
  baseExperience: number;
  consecutiveBonusPoints: number;
  consecutiveBonusExperience: number;
  weeklyBonusMultiplier: number;
  monthlyBonusMultiplier: number;
  specialRewards: {
    days: number;
    points: number;
    experience: number;
    items?: string[];
    badges?: string[];
  }[];
}

/**
 * 签到提醒DTO
 */
export class CheckInReminderDto {
  userId: string;
  enabled: boolean;
  reminderTime: string; // HH:mm 格式
  timezone: string;
  lastReminded?: Date;
  consecutiveMissed: number;
}

/**
 * 签到成就DTO
 */
export class CheckInAchievementDto {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: {
    type: 'consecutive' | 'total' | 'monthly' | 'streak';
    value: number;
    period?: string;
  };
  reward: {
    points: number;
    experience: number;
    badge?: string;
    title?: string;
  };
  progress: {
    current: number;
    target: number;
    percentage: number;
  };
  completed: boolean;
  completedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

/**
 * 补签DTO
 */
export class MakeUpCheckInDto {
  @IsDateString()
  targetDate: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * 补签结果DTO
 */
export class MakeUpCheckInResultDto {
  success: boolean;
  message: string;
  checkIn?: CheckInResponseDto;
  cost: {
    points?: number;
    items?: string[];
  };
  refunded?: boolean;
}