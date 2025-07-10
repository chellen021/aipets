import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Module, Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, Min, Max } from 'class-validator';

// 本地定义的枚举
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

@ApiTags('宠物管理')
@Controller('pets')
@ApiBearerAuth('JWT-auth')
class SimplePetsController {
  @ApiOperation({ summary: '创建宠物', description: '为当前用户创建一只新宠物' })
  @ApiResponse({ status: 201, description: '宠物创建成功', type: PetDto })
  @ApiResponse({ status: 400, description: '请求参数错误或宠物数量已达上限' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @Post()
  async create(@Body() createPetDto: CreatePetDto): Promise<PetDto> {
    return {
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
  }

  @ApiOperation({ summary: '获取宠物详情', description: '根据宠物ID获取详细信息' })
  @ApiParam({ name: 'id', description: '宠物ID', example: 'uuid' })
  @ApiResponse({ status: 200, description: '获取成功', type: PetDto })
  @ApiResponse({ status: 404, description: '宠物不存在' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PetDto> {
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

  @ApiOperation({ summary: '与宠物互动', description: '与宠物进行各种互动，如喂食、游戏、照顾等' })
  @ApiParam({ name: 'id', description: '宠物ID', example: 'uuid' })
  @ApiResponse({ status: 200, description: '互动成功', type: PetInteractionResultDto })
  @ApiResponse({ status: 404, description: '宠物不存在' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @Post(':id/interact')
  async interact(
    @Param('id') id: string,
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
}

@Module({
  controllers: [SimplePetsController],
})
class SimpleTestModule {}

async function bootstrap() {
  const app = await NestFactory.create(SimpleTestModule);

  // CORS配置
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Swagger文档配置
  const config = new DocumentBuilder()
    .setTitle('萌宠伙伴 API (简化测试版)')
    .setDescription('萌宠伙伴微信小程序后端API文档 - 简化测试版本')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('宠物管理', '宠物相关API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  const port = 3001;
  await app.listen(port);
  console.log(`简化测试应用运行在: http://localhost:${port}`);
  console.log(`Swagger文档地址: http://localhost:${port}/api/v1/docs`);
}

bootstrap();