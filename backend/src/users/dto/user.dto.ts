import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsObject,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * 用户基础信息DTO
 */
export class UserDto {
  @ApiProperty({ description: '用户ID' })
  id: string;

  @ApiProperty({ description: '用户昵称' })
  nickname: string;

  @ApiProperty({ description: '用户头像URL', required: false })
  avatar?: string;

  @ApiProperty({ description: '性别', enum: ['male', 'female', 'unknown'] })
  gender: 'male' | 'female' | 'unknown';

  @ApiProperty({ description: '生日', required: false })
  birthday?: string;

  @ApiProperty({ description: '用户积分' })
  points: number;

  @ApiProperty({ description: '用户等级' })
  level: number;

  @ApiProperty({ description: '经验值' })
  experience: number;

  @ApiProperty({ description: '连续签到天数' })
  consecutiveCheckins: number;

  @ApiProperty({ description: '总签到天数' })
  totalCheckins: number;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

/**
 * 更新用户信息DTO
 */
export class UpdateUserDto {
  @ApiProperty({ description: '用户昵称', required: false })
  @IsOptional()
  @IsString({ message: '昵称必须是字符串' })
  @MinLength(1, { message: '昵称不能为空' })
  @MaxLength(50, { message: '昵称长度不能超过50个字符' })
  nickname?: string;

  @ApiProperty({ description: '性别', enum: ['male', 'female', 'unknown'], required: false })
  @IsOptional()
  @IsEnum(['male', 'female', 'unknown'], { message: '性别值无效' })
  gender?: 'male' | 'female' | 'unknown';

  @ApiProperty({ description: '生日', required: false, example: '1990-01-01' })
  @IsOptional()
  @IsDateString({}, { message: '生日格式无效' })
  birthday?: string;
}

/**
 * 用户设置DTO
 */
export class UserSettingsDto {
  @ApiProperty({ description: '是否启用通知' })
  @IsBoolean({ message: '通知设置必须是布尔值' })
  notificationsEnabled: boolean;

  @ApiProperty({ description: '隐私设置' })
  @IsObject({ message: '隐私设置必须是对象' })
  privacySettings: Record<string, any>;
}

/**
 * 用户统计信息DTO
 */
export class UserStatsDto {
  @ApiProperty({ description: '用户积分' })
  points: number;

  @ApiProperty({ description: '用户等级' })
  level: number;

  @ApiProperty({ description: '经验值' })
  experience: number;

  @ApiProperty({ description: '下一级所需经验值' })
  nextLevelExperience: number;

  @ApiProperty({ description: '连续签到天数' })
  consecutiveCheckins: number;

  @ApiProperty({ description: '总签到天数' })
  totalCheckins: number;

  @ApiProperty({ description: '宠物数量' })
  petCount: number;

  @ApiProperty({ description: '互动次数' })
  interactionCount: number;
}

/**
 * 用户简要信息DTO（用于排行榜等场景）
 */
export class UserBriefDto {
  @ApiProperty({ description: '用户ID' })
  id: string;

  @ApiProperty({ description: '用户昵称' })
  nickname: string;

  @ApiProperty({ description: '用户头像URL', required: false })
  avatar?: string;

  @ApiProperty({ description: '用户等级' })
  level: number;

  @ApiProperty({ description: '用户积分' })
  points: number;
}

/**
 * 用户排行榜DTO
 */
export class UserRankDto extends UserBriefDto {
  @ApiProperty({ description: '排名' })
  rank: number;

  @ApiProperty({ description: '分数（积分或等级等）' })
  score: number;
}