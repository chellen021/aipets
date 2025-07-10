import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  Max,
  Length,
  IsUUID,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { PetType, PetGender, PetStatus } from '../entities/pet.entity';
import { BasePaginationDto } from '../../common/dto/base-response.dto';

/**
 * 创建宠物DTO
 */
export class CreatePetDto {
  @ApiProperty({ description: '宠物名称', example: '小白' })
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({ description: '宠物类型', enum: PetType, example: PetType.CAT })
  @IsEnum(PetType)
  type: PetType;

  @ApiPropertyOptional({ description: '宠物品种', example: '英短' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  breed?: string;

  @ApiPropertyOptional({ description: '宠物性别', enum: PetGender, example: PetGender.MALE })
  @IsOptional()
  @IsEnum(PetGender)
  gender?: PetGender;

  @ApiPropertyOptional({ description: '宠物生日', example: '2023-01-01' })
  @IsOptional()
  @IsDateString()
  birthday?: string;

  @ApiPropertyOptional({ description: '宠物头像URL', example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsUrl()
  avatar?: string;

  @ApiPropertyOptional({ description: '宠物描述', example: '一只可爱的小猫咪' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;
}

/**
 * 更新宠物DTO
 */
export class UpdatePetDto {
  @ApiPropertyOptional({ description: '宠物名称', example: '小白' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @ApiPropertyOptional({ description: '宠物品种', example: '英短' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  breed?: string;

  @ApiPropertyOptional({ description: '宠物性别', enum: PetGender, example: PetGender.MALE })
  @IsOptional()
  @IsEnum(PetGender)
  gender?: PetGender;

  @ApiPropertyOptional({ description: '宠物生日', example: '2023-01-01' })
  @IsOptional()
  @IsDateString()
  birthday?: string;

  @ApiPropertyOptional({ description: '宠物头像URL', example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsUrl()
  avatar?: string;

  @ApiPropertyOptional({ description: '宠物描述', example: '一只可爱的小猫咪' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;
}

/**
 * 宠物响应DTO
 */
export class PetDto {
  @ApiProperty({ description: '宠物ID', example: 'uuid-string' })
  id: string;

  @ApiProperty({ description: '宠物名称', example: '小白' })
  name: string;

  @ApiProperty({ description: '宠物类型', enum: PetType, example: PetType.CAT })
  type: PetType;

  @ApiPropertyOptional({ description: '宠物品种', example: '英短' })
  breed?: string;

  @ApiProperty({ description: '宠物性别', enum: PetGender, example: PetGender.MALE })
  gender: PetGender;

  @ApiPropertyOptional({ description: '宠物生日', example: '2023-01-01T00:00:00Z' })
  birthday?: Date;

  @ApiPropertyOptional({ description: '宠物头像URL', example: 'https://example.com/avatar.jpg' })
  avatar?: string;

  @ApiPropertyOptional({ description: '宠物描述', example: '一只可爱的小猫咪' })
  description?: string;

  @ApiProperty({ description: '健康值', example: 80, minimum: 0, maximum: 100 })
  health: number;

  @ApiProperty({ description: '快乐值', example: 75, minimum: 0, maximum: 100 })
  happiness: number;

  @ApiProperty({ description: '精力值', example: 60, minimum: 0, maximum: 100 })
  energy: number;

  @ApiProperty({ description: '饥饿值', example: 40, minimum: 0, maximum: 100 })
  hunger: number;

  @ApiProperty({ description: '经验值', example: 1250 })
  experience: number;

  @ApiProperty({ description: '等级', example: 5 })
  level: number;

  @ApiProperty({ description: '宠物状态', enum: PetStatus, example: PetStatus.HEALTHY })
  status: PetStatus;

  @ApiProperty({ description: '年龄（月数）', example: 6 })
  age: number; // 计算得出的年龄（月数）

  @ApiProperty({ description: '整体状态评分', example: 85, minimum: 0, maximum: 100 })
  overallScore: number; // 整体状态评分

  @ApiProperty({ description: '是否需要照顾', example: true })
  needsCare: boolean; // 是否需要照顾

  @ApiProperty({ description: '是否可以升级', example: false })
  canLevelUp: boolean; // 是否可以升级

  @ApiProperty({ description: '总喂食次数', example: 15 })
  totalFeedings: number;

  @ApiProperty({ description: '总游戏次数', example: 12 })
  totalPlayings: number;

  @ApiProperty({ description: '总护理次数', example: 8 })
  totalCarings: number;

  @ApiPropertyOptional({ description: '最后喂食时间', example: '2023-12-01T10:00:00Z' })
  lastFeedTime?: Date;

  @ApiPropertyOptional({ description: '最后游戏时间', example: '2023-12-01T09:30:00Z' })
  lastPlayTime?: Date;

  @ApiPropertyOptional({ description: '最后护理时间', example: '2023-12-01T08:00:00Z' })
  lastCareTime?: Date;

  @ApiPropertyOptional({ description: '最后互动时间', example: '2023-12-01T10:00:00Z' })
  lastInteractionTime?: Date;

  @ApiProperty({ description: '主人ID', example: 'owner-uuid' })
  ownerId: string;

  @ApiProperty({ description: '创建时间', example: '2023-11-01T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间', example: '2023-12-01T10:00:00Z' })
  updatedAt: Date;
}

/**
 * 宠物简要信息DTO
 */
export class PetBriefDto {
  id: string;
  name: string;
  type: PetType;
  avatar?: string;
  level: number;
  status: PetStatus;
  overallScore: number;
  needsCare: boolean;
}

/**
 * 宠物统计DTO
 */
export class PetStatsDto {
  totalPets: number;
  healthyPets: number;
  petsNeedingCare: number;
  averageLevel: number;
  totalInteractions: number;
  mostActivePet?: PetBriefDto;
}

/**
 * 宠物互动DTO
 */
export class PetInteractionDto {
  @ApiProperty({ 
    description: '互动类型', 
    enum: ['feed', 'play', 'care', 'clean', 'medicine'],
    example: 'feed'
  })
  @IsEnum(['feed', 'play', 'care', 'clean', 'medicine'])
  action: string;

  @ApiPropertyOptional({ description: '使用的物品（如食物、玩具等）', example: 'premium_food' })
  @IsOptional()
  @IsString()
  item?: string; // 使用的物品（如食物、玩具等）

  @ApiPropertyOptional({ description: '互动强度（1-10）', example: 5, minimum: 1, maximum: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  intensity?: number; // 互动强度（1-10）
}

/**
 * 宠物互动结果DTO
 */
export class PetInteractionResultDto {
  @ApiProperty({ description: '互动是否成功', example: true })
  success: boolean;

  @ApiProperty({ description: '互动结果消息', example: '小白很开心地吃完了食物！' })
  message: string;

  @ApiProperty({ description: '获得的经验值', example: 15 })
  experienceGained: number;

  @ApiProperty({ description: '获得的积分', example: 10 })
  pointsGained: number;

  @ApiProperty({ 
    description: '属性变化',
    example: { health: 5, happiness: 10, energy: -5, hunger: -20 }
  })
  attributeChanges: {
    health?: number;
    happiness?: number;
    energy?: number;
    hunger?: number;
  };

  @ApiPropertyOptional({ description: '是否升级', example: false })
  levelUp?: boolean;

  @ApiPropertyOptional({ description: '新等级', example: 6 })
  newLevel?: number;

  @ApiProperty({ description: '更新后的宠物信息' })
  pet: PetDto;
}

/**
 * 宠物查询DTO
 */
export class PetQueryDto extends BasePaginationDto {
  @IsOptional()
  @IsEnum(PetType)
  type?: PetType;

  @IsOptional()
  @IsEnum(PetStatus)
  status?: PetStatus;

  @IsOptional()
  @IsString()
  search?: string; // 搜索宠物名称

  @IsOptional()
  @Type(() => Boolean)
  needsCareOnly?: boolean; // 只显示需要照顾的宠物
}

/**
 * 宠物排行榜DTO
 */
export class PetRankingDto {
  rank: number;
  pet: PetBriefDto;
  owner: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  score: number; // 排行依据的分数
}

/**
 * 宠物排行榜查询DTO
 */
export class PetRankingQueryDto extends BasePaginationDto {
  @IsOptional()
  @IsEnum(['level', 'experience', 'overallScore', 'totalInteractions'])
  rankBy?: string;

  @IsOptional()
  @IsEnum(PetType)
  type?: PetType;
}

/**
 * 宠物成长记录DTO
 */
export class PetGrowthRecordDto {
  date: Date;
  level: number;
  experience: number;
  health: number;
  happiness: number;
  energy: number;
  hunger: number;
  interactions: number;
}

/**
 * 宠物护理建议DTO
 */
export class PetCareAdviceDto {
  priority: 'high' | 'medium' | 'low';
  category: 'health' | 'happiness' | 'energy' | 'hunger' | 'general';
  title: string;
  description: string;
  suggestedActions: string[];
  estimatedTime: number; // 预计需要的时间（分钟）
}

/**
 * 宠物健康报告DTO
 */
export class PetHealthReportDto {
  petId: string;
  petName: string;
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
  healthScore: number;
  lastCheckup: Date;
  careAdvices: PetCareAdviceDto[];
  trends: {
    health: 'improving' | 'stable' | 'declining';
    happiness: 'improving' | 'stable' | 'declining';
    activity: 'increasing' | 'stable' | 'decreasing';
  };
  nextCheckupRecommended: Date;
}