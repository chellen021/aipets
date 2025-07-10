import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, IsBoolean, Min, Max } from 'class-validator';

// 本地定义的枚举和DTO，避免导入数据库相关模块
enum PetType {
  CAT = 'cat',
  DOG = 'dog',
  RABBIT = 'rabbit',
  HAMSTER = 'hamster',
  BIRD = 'bird',
}

enum PetGender {
  MALE = 'male',
  FEMALE = 'female',
}

enum PetStatus {
  HEALTHY = 'healthy',
  SICK = 'sick',
  TIRED = 'tired',
  HUNGRY = 'hungry',
  HAPPY = 'happy',
}

enum InteractionType {
  FEED = 'feed',
  PLAY = 'play',
  CARE = 'care',
  CLEAN = 'clean',
  EXERCISE = 'exercise',
}

enum RankingType {
  LEVEL = 'level',
  EXPERIENCE = 'experience',
  OVERALL_SCORE = 'overall_score',
  TOTAL_INTERACTIONS = 'total_interactions',
}

// DTO类定义
class CreatePetDto {
  @ApiProperty({ description: '宠物名称', example: '小白' })
  @IsString()
  name: string;

  @ApiProperty({ description: '宠物类型', enum: PetType, example: PetType.CAT })
  @IsEnum(PetType)
  type: PetType;

  @ApiProperty({ description: '宠物品种', example: '英短' })
  @IsString()
  breed: string;

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
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: '宠物描述', example: '一只可爱的小猫咪' })
  @IsOptional()
  @IsString()
  description?: string;
}

class UpdatePetDto {
  @ApiPropertyOptional({ description: '宠物名称', example: '小白' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '宠物头像URL', example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: '宠物描述', example: '一只可爱的小猫咪' })
  @IsOptional()
  @IsString()
  description?: string;
}

class PetDto {
  @ApiProperty({ description: '宠物ID', example: 'uuid' })
  id: string;

  @ApiProperty({ description: '宠物名称', example: '小白' })
  name: string;

  @ApiProperty({ description: '宠物类型', enum: PetType })
  type: PetType;

  @ApiProperty({ description: '宠物品种', example: '英短' })
  breed: string;

  @ApiProperty({ description: '宠物性别', enum: PetGender })
  gender: PetGender;

  @ApiProperty({ description: '宠物生日' })
  birthday: Date;

  @ApiPropertyOptional({ description: '宠物头像URL' })
  avatar?: string;

  @ApiPropertyOptional({ description: '宠物描述' })
  description?: string;

  @ApiProperty({ description: '健康值', example: 85 })
  health: number;

  @ApiProperty({ description: '快乐值', example: 90 })
  happiness: number;

  @ApiProperty({ description: '精力值', example: 75 })
  energy: number;

  @ApiProperty({ description: '饥饿值', example: 60 })
  hunger: number;

  @ApiProperty({ description: '经验值', example: 1250 })
  experience: number;

  @ApiProperty({ description: '等级', example: 5 })
  level: number;

  @ApiProperty({ description: '状态', enum: PetStatus })
  status: PetStatus;

  @ApiProperty({ description: '年龄（月）', example: 6 })
  age: number;

  @ApiProperty({ description: '综合评分', example: 82.5 })
  overallScore: number;

  @ApiProperty({ description: '是否需要照顾', example: false })
  needsCare: boolean;

  @ApiProperty({ description: '是否可以升级', example: true })
  canLevelUp: boolean;

  @ApiProperty({ description: '总喂食次数', example: 15 })
  totalFeedings: number;

  @ApiProperty({ description: '总游戏次数', example: 12 })
  totalPlayings: number;

  @ApiProperty({ description: '总照顾次数', example: 8 })
  totalCarings: number;

  @ApiPropertyOptional({ description: '最后喂食时间' })
  lastFeedTime?: Date;

  @ApiPropertyOptional({ description: '最后游戏时间' })
  lastPlayTime?: Date;

  @ApiPropertyOptional({ description: '最后照顾时间' })
  lastCareTime?: Date;

  @ApiPropertyOptional({ description: '最后互动时间' })
  lastInteractionTime?: Date;

  @ApiProperty({ description: '主人ID' })
  ownerId: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

class PetBriefDto {
  @ApiProperty({ description: '宠物ID' })
  id: string;

  @ApiProperty({ description: '宠物名称' })
  name: string;

  @ApiProperty({ description: '宠物类型', enum: PetType })
  type: PetType;

  @ApiPropertyOptional({ description: '宠物头像URL' })
  avatar?: string;

  @ApiProperty({ description: '等级' })
  level: number;

  @ApiProperty({ description: '状态', enum: PetStatus })
  status: PetStatus;

  @ApiProperty({ description: '综合评分' })
  overallScore: number;

  @ApiProperty({ description: '是否需要照顾' })
  needsCare: boolean;
}

class UserBriefDto {
  @ApiProperty({ description: '用户ID' })
  id: string;

  @ApiProperty({ description: '用户昵称' })
  nickname: string;

  @ApiPropertyOptional({ description: '用户头像' })
  avatar?: string;
}

class PetStatsDto {
  @ApiProperty({ description: '宠物总数', example: 3 })
  totalPets: number;

  @ApiProperty({ description: '健康宠物数', example: 2 })
  healthyPets: number;

  @ApiProperty({ description: '需要照顾的宠物数', example: 1 })
  petsNeedingCare: number;

  @ApiProperty({ description: '平均等级', example: 4.5 })
  averageLevel: number;

  @ApiProperty({ description: '总互动次数', example: 156 })
  totalInteractions: number;

  @ApiProperty({ description: '最活跃的宠物', type: PetBriefDto })
  mostActivePet: PetBriefDto;
}

class PetInteractionDto {
  @ApiProperty({ description: '互动类型', enum: InteractionType })
  @IsEnum(InteractionType)
  type: InteractionType;

  @ApiPropertyOptional({ description: '互动强度', minimum: 1, maximum: 10, example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  intensity?: number;
}

class PetInteractionResultDto {
  @ApiProperty({ description: '互动是否成功', example: true })
  success: boolean;

  @ApiProperty({ description: '结果消息', example: '小白很开心地吃完了食物！' })
  message: string;

  @ApiProperty({ description: '获得的经验值', example: 10 })
  experienceGained: number;

  @ApiProperty({ description: '获得的积分', example: 5 })
  pointsGained: number;

  @ApiProperty({ description: '是否升级', example: false })
  leveledUp: boolean;

  @ApiPropertyOptional({ description: '新等级', example: 6 })
  newLevel?: number;

  @ApiProperty({ description: '更新后的宠物信息', type: PetDto })
  pet: PetDto;
}

class PetQueryDto {
  @ApiPropertyOptional({ description: '页码', example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: '宠物类型筛选', enum: PetType })
  @IsOptional()
  @IsEnum(PetType)
  type?: PetType;

  @ApiPropertyOptional({ description: '状态筛选', enum: PetStatus })
  @IsOptional()
  @IsEnum(PetStatus)
  status?: PetStatus;
}

class PetRankingDto {
  @ApiProperty({ description: '排名', example: 1 })
  rank: number;

  @ApiProperty({ description: '宠物信息', type: PetBriefDto })
  pet: PetBriefDto;

  @ApiProperty({ description: '主人信息', type: UserBriefDto })
  owner: UserBriefDto;

  @ApiProperty({ description: '评分', example: 95 })
  score: number;
}

class PetRankingQueryDto {
  @ApiPropertyOptional({ description: '页码', example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ description: '排序类型', enum: RankingType, example: RankingType.LEVEL })
  @IsOptional()
  @IsEnum(RankingType)
  sortBy?: RankingType;
}

class PetCareAdviceDto {
  @ApiProperty({ description: '优先级', example: 'high' })
  priority: string;

  @ApiProperty({ description: '类别', example: 'health' })
  category: string;

  @ApiProperty({ description: '标题', example: '宠物需要喂食' })
  title: string;

  @ApiProperty({ description: '描述', example: '您的宠物饥饿值较高，建议及时喂食' })
  description: string;

  @ApiProperty({ description: '建议行动', example: ['喂食', '给水'] })
  suggestedActions: string[];

  @ApiProperty({ description: '预计时间', example: '5分钟' })
  estimatedTime: string;
}

class PaginationInfo {
  @ApiProperty({ description: '总数量', example: 100 })
  total: number;

  @ApiProperty({ description: '当前页码', example: 1 })
  page: number;

  @ApiProperty({ description: '每页数量', example: 10 })
  limit: number;

  @ApiProperty({ description: '总页数', example: 10 })
  totalPages: number;

  @ApiProperty({ description: '是否有下一页', example: true })
  hasNext: boolean;

  @ApiProperty({ description: '是否有上一页', example: false })
  hasPrev: boolean;
}

class PaginatedResponseDto<T> {
  @ApiProperty({ description: '数据列表' })
  data: T[];

  @ApiProperty({ description: '分页信息', type: PaginationInfo })
  pagination: PaginationInfo;
}

/**
 * 宠物管理演示控制器 - 仅用于API文档展示
 * 不依赖数据库连接，提供完整的API接口文档
 */
@ApiTags('宠物管理')
@Controller('pets')
@ApiBearerAuth('JWT-auth')
export class PetsDemoController {
  /**
   * 创建宠物
   */
  @ApiOperation({ summary: '创建宠物', description: '为当前用户创建一只新宠物' })
  @ApiResponse({ status: 201, description: '宠物创建成功', type: PetDto })
  @ApiResponse({ status: 400, description: '请求参数错误或宠物数量已达上限' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @Post()
  async create(@Body() createPetDto: CreatePetDto): Promise<PetDto> {
    // 演示数据
    const mockPet: PetDto = {
      id: 'demo-pet-uuid',
      name: createPetDto.name,
      type: createPetDto.type,
      breed: createPetDto.breed,
      gender: createPetDto.gender || PetGender.MALE,
      birthday: createPetDto.birthday ? new Date(createPetDto.birthday) : new Date(),
      avatar: createPetDto.avatar,
      description: createPetDto.description,
      health: 100,
      happiness: 80,
      energy: 90,
      hunger: 30,
      experience: 0,
      level: 1,
      status: PetStatus.HEALTHY,
      age: 0,
      overallScore: 85,
      needsCare: false,
      canLevelUp: false,
      totalFeedings: 0,
      totalPlayings: 0,
      totalCarings: 0,
      ownerId: 'demo-user-uuid',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return mockPet;
  }

  /**
   * 获取当前用户的宠物列表
   */
  @ApiOperation({ summary: '获取我的宠物列表', description: '获取当前用户的所有宠物，支持分页和筛选' })
  @ApiResponse({ status: 200, description: '获取成功', type: PaginatedResponseDto })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @Get('my')
  async getMyPets(@Query() query: PetQueryDto): Promise<PaginatedResponseDto<PetDto>> {
    const mockPet: PetDto = {
      id: 'demo-pet-uuid',
      name: '小白',
      type: PetType.CAT,
      breed: '英短',
      gender: PetGender.MALE,
      birthday: new Date('2023-01-01'),
      avatar: 'https://example.com/avatar.jpg',
      description: '一只可爱的小猫咪',
      health: 85,
      happiness: 75,
      energy: 60,
      hunger: 40,
      experience: 1250,
      level: 5,
      status: PetStatus.HEALTHY,
      age: 6,
      overallScore: 85,
      needsCare: true,
      canLevelUp: false,
      totalFeedings: 15,
      totalPlayings: 12,
      totalCarings: 8,
      lastFeedTime: new Date(),
      lastPlayTime: new Date(),
      lastCareTime: new Date(),
      lastInteractionTime: new Date(),
      ownerId: 'demo-user-uuid',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      data: [mockPet],
      pagination: {
        total: 1,
        page: query.page || 1,
        limit: query.limit || 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  }

  /**
   * 获取当前用户的宠物统计
   */
  @ApiOperation({ summary: '获取我的宠物统计', description: '获取当前用户的宠物统计信息' })
  @ApiResponse({ status: 200, description: '获取成功', type: PetStatsDto })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @Get('my/stats')
  async getMyPetStats(): Promise<PetStatsDto> {
    return {
      totalPets: 3,
      healthyPets: 2,
      petsNeedingCare: 1,
      averageLevel: 4.5,
      totalInteractions: 156,
      mostActivePet: {
        id: 'most-active-pet-uuid',
        name: '活跃小宠',
        type: PetType.DOG,
        avatar: 'https://example.com/active-pet.jpg',
        level: 8,
        status: PetStatus.HEALTHY,
        overallScore: 92,
        needsCare: false,
      },
    };
  }

  /**
   * 获取宠物排行榜
   */
  @ApiOperation({ summary: '获取宠物排行榜', description: '获取宠物排行榜，支持按等级、经验等排序' })
  @ApiResponse({ status: 200, description: '获取成功', type: PaginatedResponseDto })
  @Get('ranking')
  async getPetRanking(@Query() query: PetRankingQueryDto): Promise<PaginatedResponseDto<PetRankingDto>> {
    const mockRanking: PetRankingDto = {
      rank: 1,
      pet: {
        id: 'top-pet-uuid',
        name: '冠军宠物',
        type: PetType.DOG,
        avatar: 'https://example.com/champion.jpg',
        level: 10,
        status: PetStatus.HEALTHY,
        overallScore: 95,
        needsCare: false,
      },
      owner: {
        id: 'owner-uuid',
        nickname: '宠物大师',
        avatar: 'https://example.com/owner.jpg',
      },
      score: 95,
    };

    return {
      data: [mockRanking],
      pagination: {
        page: query.page || 1,
        limit: query.limit || 10,
        total: 100,
        totalPages: 10,
        hasNext: true,
        hasPrev: false,
      },
    };
  }

  /**
   * 根据ID获取宠物详情
   */
  @ApiOperation({ summary: '获取宠物详情', description: '根据宠物ID获取详细信息' })
  @ApiParam({ name: 'id', description: '宠物ID', example: 'uuid' })
  @ApiResponse({ status: 200, description: '获取成功', type: PetDto })
  @ApiResponse({ status: 404, description: '宠物不存在' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PetDto> {
    return {
      id,
      name: '小白',
      type: PetType.CAT,
      breed: '英短',
      gender: PetGender.MALE,
      birthday: new Date('2023-01-01'),
      avatar: 'https://example.com/avatar.jpg',
      description: '一只可爱的小猫咪',
      health: 85,
      happiness: 75,
      energy: 60,
      hunger: 40,
      experience: 1250,
      level: 5,
      status: PetStatus.HEALTHY,
      age: 6,
      overallScore: 85,
      needsCare: true,
      canLevelUp: false,
      totalFeedings: 15,
      totalPlayings: 12,
      totalCarings: 8,
      lastFeedTime: new Date(),
      lastPlayTime: new Date(),
      lastCareTime: new Date(),
      lastInteractionTime: new Date(),
      ownerId: 'demo-user-uuid',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * 更新宠物信息
   */
  @ApiOperation({ summary: '更新宠物信息', description: '更新宠物的基本信息' })
  @ApiParam({ name: 'id', description: '宠物ID', example: 'uuid' })
  @ApiResponse({ status: 200, description: '更新成功', type: PetDto })
  @ApiResponse({ status: 404, description: '宠物不存在' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 403, description: '无权限操作此宠物' })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePetDto: UpdatePetDto,
  ): Promise<PetDto> {
    return {
      id,
      name: updatePetDto.name || '小白',
      type: PetType.CAT,
      breed: '英短',
      gender: PetGender.MALE,
      birthday: new Date('2023-01-01'),
      avatar: updatePetDto.avatar || 'https://example.com/avatar.jpg',
      description: updatePetDto.description || '一只可爱的小猫咪',
      health: 85,
      happiness: 75,
      energy: 60,
      hunger: 40,
      experience: 1250,
      level: 5,
      status: PetStatus.HEALTHY,
      age: 6,
      overallScore: 85,
      needsCare: true,
      canLevelUp: false,
      totalFeedings: 15,
      totalPlayings: 12,
      totalCarings: 8,
      lastFeedTime: new Date(),
      lastPlayTime: new Date(),
      lastCareTime: new Date(),
      lastInteractionTime: new Date(),
      ownerId: 'demo-user-uuid',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * 删除宠物
   */
  @ApiOperation({ summary: '删除宠物', description: '删除指定的宠物' })
  @ApiParam({ name: 'id', description: '宠物ID', example: 'uuid' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '宠物不存在' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 403, description: '无权限操作此宠物' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    // 演示删除操作
    return;
  }

  /**
   * 与宠物互动
   */
  @ApiOperation({ summary: '与宠物互动', description: '与宠物进行各种互动，如喂食、游戏、照顾等' })
  @ApiParam({ name: 'id', description: '宠物ID', example: 'uuid' })
  @ApiResponse({ status: 200, description: '互动成功', type: PetInteractionResultDto })
  @ApiResponse({ status: 404, description: '宠物不存在' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiResponse({ status: 403, description: '无权限操作此宠物' })
  @ApiResponse({ status: 400, description: '互动参数错误或宠物状态不允许此互动' })
  @Post(':id/interact')
  async interact(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() interactionDto: PetInteractionDto,
  ): Promise<PetInteractionResultDto> {
    const updatedPet: PetDto = {
      id,
      name: '小白',
      type: PetType.CAT,
      breed: '英短',
      gender: PetGender.MALE,
      birthday: new Date('2023-01-01'),
      avatar: 'https://example.com/avatar.jpg',
      description: '一只可爱的小猫咪',
      health: 90,
      happiness: 85,
      energy: 70,
      hunger: 30,
      experience: 1260,
      level: 5,
      status: PetStatus.HAPPY,
      age: 6,
      overallScore: 87,
      needsCare: false,
      canLevelUp: false,
      totalFeedings: 16,
      totalPlayings: 12,
      totalCarings: 8,
      lastFeedTime: new Date(),
      lastPlayTime: new Date(),
      lastCareTime: new Date(),
      lastInteractionTime: new Date(),
      ownerId: 'demo-user-uuid',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      success: true,
      message: '小白很开心地吃完了食物！',
      experienceGained: 10,
      pointsGained: 5,
      leveledUp: false,
      pet: updatedPet,
    };
  }

  /**
   * 获取宠物护理建议
   */
  @ApiOperation({ summary: '获取宠物护理建议', description: '根据宠物当前状态获取护理建议' })
  @ApiParam({ name: 'id', description: '宠物ID', example: 'uuid' })
  @ApiResponse({ status: 200, description: '获取成功', type: [PetCareAdviceDto] })
  @ApiResponse({ status: 404, description: '宠物不存在' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @Get(':id/care-advice')
  async getCareAdvice(@Param('id', ParseUUIDPipe) id: string): Promise<PetCareAdviceDto[]> {
    return [
      {
        priority: 'high',
        category: 'hunger',
        title: '宠物需要喂食',
        description: '您的宠物饥饿值较高，建议及时喂食',
        suggestedActions: ['喂食', '给水'],
        estimatedTime: '5分钟',
      },
      {
        priority: 'medium',
        category: 'energy',
        title: '宠物需要休息',
        description: '您的宠物精力不足，建议让它休息一下',
        suggestedActions: ['让宠物睡觉', '减少活动'],
        estimatedTime: '30分钟',
      },
    ];
  }

  /**
   * 获取宠物公开信息
   */
  @ApiOperation({ summary: '获取宠物公开信息', description: '获取宠物的公开展示信息，无需登录' })
  @ApiParam({ name: 'id', description: '宠物ID', example: 'uuid' })
  @ApiResponse({ status: 200, description: '获取成功', type: PetBriefDto })
  @ApiResponse({ status: 404, description: '宠物不存在' })
  @Get(':id/public')
  async getPublicInfo(@Param('id', ParseUUIDPipe) id: string): Promise<PetBriefDto> {
    return {
      id,
      name: '小白',
      type: PetType.CAT,
      avatar: 'https://example.com/avatar.jpg',
      level: 5,
      status: PetStatus.HEALTHY,
      overallScore: 85,
      needsCare: false,
    };
  }
}