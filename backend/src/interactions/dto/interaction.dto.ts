import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InteractionType, InteractionResult } from '../entities/interaction.entity';
import { BasePaginationDto } from '../../common/dto/base-response.dto';

/**
 * 创建互动记录DTO
 */
export class CreateInteractionDto {
  @IsEnum(InteractionType)
  type: InteractionType;

  @IsOptional()
  @IsString()
  item?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  intensity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * 互动记录响应DTO
 */
export class InteractionDto {
  id: string;
  type: InteractionType;
  typeDisplayName: string;
  result: InteractionResult;
  item?: string;
  intensity: number;
  experienceGained: number;
  pointsGained: number;
  duration: number;
  attributeChanges?: {
    health?: number;
    happiness?: number;
    energy?: number;
    hunger?: number;
  };
  petStateBefore?: {
    health: number;
    happiness: number;
    energy: number;
    hunger: number;
    level: number;
  };
  petStateAfter?: {
    health: number;
    happiness: number;
    energy: number;
    hunger: number;
    level: number;
  };
  notes?: string;
  levelUpOccurred: boolean;
  newLevel?: number;
  effectivenessScore: number;
  isEffective: boolean;
  userId: string;
  petId: string;
  pet?: {
    id: string;
    name: string;
    type: string;
    avatar?: string;
  };
  createdAt: Date;
}

/**
 * 互动记录查询DTO
 */
export class InteractionQueryDto extends BasePaginationDto {
  @IsOptional()
  @IsUUID()
  petId?: string;

  @IsOptional()
  @IsEnum(InteractionType)
  type?: InteractionType;

  @IsOptional()
  @IsEnum(InteractionResult)
  result?: InteractionResult;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Boolean)
  effectiveOnly?: boolean; // 只显示有效互动

  @IsOptional()
  @Type(() => Boolean)
  levelUpOnly?: boolean; // 只显示导致升级的互动
}

/**
 * 互动统计DTO
 */
export class InteractionStatsDto {
  totalInteractions: number;
  effectiveInteractions: number;
  totalExperienceGained: number;
  totalPointsGained: number;
  averageEffectivenessScore: number;
  levelUpsTriggered: number;
  interactionsByType: {
    type: InteractionType;
    count: number;
    totalExperience: number;
    averageEffectiveness: number;
  }[];
  dailyInteractions: {
    date: string;
    count: number;
    experience: number;
    points: number;
  }[];
  mostActiveHours: {
    hour: number;
    count: number;
  }[];
}

/**
 * 互动趋势DTO
 */
export class InteractionTrendDto {
  period: string; // 时间段（如 '2024-01-01' 或 '2024-01'）
  totalInteractions: number;
  experienceGained: number;
  pointsGained: number;
  averageEffectiveness: number;
  levelUps: number;
  typeBreakdown: {
    [key in InteractionType]?: number;
  };
}

/**
 * 宠物互动历史DTO
 */
export class PetInteractionHistoryDto {
  petId: string;
  petName: string;
  totalInteractions: number;
  firstInteraction: Date;
  lastInteraction: Date;
  favoriteInteractionType: InteractionType;
  averageEffectiveness: number;
  totalLevelUps: number;
  recentInteractions: InteractionDto[];
}

/**
 * 互动排行榜DTO
 */
export class InteractionLeaderboardDto {
  rank: number;
  user: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  totalInteractions: number;
  totalExperience: number;
  totalPoints: number;
  averageEffectiveness: number;
  activePets: number;
  levelUpsAchieved: number;
}

/**
 * 互动排行榜查询DTO
 */
export class InteractionLeaderboardQueryDto extends BasePaginationDto {
  @IsOptional()
  @IsEnum(['totalInteractions', 'totalExperience', 'totalPoints', 'averageEffectiveness'])
  rankBy?: string;

  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly', 'all'])
  period?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

/**
 * 互动建议DTO
 */
export class InteractionSuggestionDto {
  petId: string;
  petName: string;
  suggestedType: InteractionType;
  reason: string;
  expectedBenefit: string;
  priority: 'high' | 'medium' | 'low';
  estimatedDuration: number; // 预计时间（分钟）
  requiredItems?: string[];
  tips: string[];
}

/**
 * 互动成就DTO
 */
export class InteractionAchievementDto {
  id: string;
  title: string;
  description: string;
  type: InteractionType | 'general';
  requirement: {
    count?: number;
    effectiveness?: number;
    consecutive?: number;
    timeframe?: string;
  };
  reward: {
    points: number;
    experience: number;
    badge?: string;
  };
  progress: {
    current: number;
    target: number;
    percentage: number;
  };
  completed: boolean;
  completedAt?: Date;
}

/**
 * 批量互动DTO
 */
export class BatchInteractionDto {
  @IsUUID('4', { each: true })
  petIds: string[];

  @IsEnum(InteractionType)
  type: InteractionType;

  @IsOptional()
  @IsString()
  item?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  intensity?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * 批量互动结果DTO
 */
export class BatchInteractionResultDto {
  totalPets: number;
  successfulInteractions: number;
  failedInteractions: number;
  totalExperienceGained: number;
  totalPointsGained: number;
  levelUpsOccurred: number;
  results: {
    petId: string;
    petName: string;
    success: boolean;
    error?: string;
    experienceGained: number;
    pointsGained: number;
    levelUp: boolean;
  }[];
}