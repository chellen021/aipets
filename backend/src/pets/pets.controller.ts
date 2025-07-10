import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
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
} from '@nestjs/swagger';
import { PetsService } from './pets.service';
import {
  CreatePetDto,
  UpdatePetDto,
  PetDto,
  PetStatsDto,
  PetInteractionDto,
  PetInteractionResultDto,
  PetQueryDto,
  PetRankingDto,
  PetRankingQueryDto,
  PetCareAdviceDto,
} from './dto/pet.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { PaginatedResponseDto } from '../common/dto/base-response.dto';

@ApiTags('宠物管理')
@Controller('pets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  /**
   * 创建宠物
   */
  @ApiOperation({ summary: '创建宠物', description: '为当前用户创建一只新宠物' })
  @ApiResponse({ status: 201, description: '宠物创建成功', type: PetDto })
  @ApiResponse({ status: 400, description: '请求参数错误或宠物数量已达上限' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @Post()
  async create(
    @User('id') userId: string,
    @Body() createPetDto: CreatePetDto,
  ): Promise<PetDto> {
    return this.petsService.create(userId, createPetDto);
  }

  /**
   * 获取当前用户的宠物列表
   */
  @ApiOperation({ summary: '获取我的宠物列表', description: '获取当前用户的所有宠物，支持分页和筛选' })
  @ApiResponse({ status: 200, description: '获取成功', type: PaginatedResponseDto })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @Get('my')
  async getMyPets(
    @User('id') userId: string,
    @Query() query: PetQueryDto,
  ): Promise<PaginatedResponseDto<PetDto>> {
    return this.petsService.findByUserId(userId, query);
  }

  /**
   * 获取当前用户的宠物统计
   */
  @ApiOperation({ summary: '获取我的宠物统计', description: '获取当前用户的宠物统计信息' })
  @ApiResponse({ status: 200, description: '获取成功', type: PetStatsDto })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @Get('my/stats')
  async getMyPetStats(
    @User('id') userId: string,
  ): Promise<PetStatsDto> {
    return this.petsService.getUserPetStats(userId);
  }

  /**
   * 获取宠物排行榜（公开接口）
   */
  @ApiOperation({ summary: '获取宠物排行榜', description: '获取宠物排行榜，支持按等级、经验等排序' })
  @ApiResponse({ status: 200, description: '获取成功', type: PaginatedResponseDto })
  @Public()
  @Get('ranking')
  async getPetRanking(
    @Query() query: PetRankingQueryDto,
  ): Promise<PaginatedResponseDto<PetRankingDto>> {
    return this.petsService.getPetRanking(query);
  }

  /**
   * 根据ID获取宠物详情
   */
  @ApiOperation({ summary: '获取宠物详情', description: '根据ID获取宠物详细信息' })
  @ApiParam({ name: 'id', description: '宠物ID', type: 'string' })
  @ApiResponse({ status: 200, description: '获取成功', type: PetDto })
  @ApiResponse({ status: 404, description: '宠物不存在' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @User('id') userId: string,
  ): Promise<PetDto> {
    return this.petsService.findById(id, userId);
  }

  /**
   * 更新宠物信息
   */
  @ApiOperation({ summary: '更新宠物信息', description: '更新宠物的基本信息' })
  @ApiParam({ name: 'id', description: '宠物ID', type: 'string' })
  @ApiResponse({ status: 200, description: '更新成功', type: PetDto })
  @ApiResponse({ status: 404, description: '宠物不存在' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @User('id') userId: string,
    @Body() updatePetDto: UpdatePetDto,
  ): Promise<PetDto> {
    return this.petsService.update(id, userId, updatePetDto);
  }

  /**
   * 删除宠物
   */
  @ApiOperation({ summary: '删除宠物', description: '删除指定的宠物' })
  @ApiParam({ name: 'id', description: '宠物ID', type: 'string' })
  @ApiResponse({ status: 204, description: '删除成功' })
  @ApiResponse({ status: 404, description: '宠物不存在' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @User('id') userId: string,
  ): Promise<void> {
    return this.petsService.remove(id, userId);
  }

  /**
   * 与宠物互动
   */
  @ApiOperation({ summary: '与宠物互动', description: '与宠物进行各种互动，如喂食、玩耍等' })
  @ApiParam({ name: 'id', description: '宠物ID', type: 'string' })
  @ApiResponse({ status: 200, description: '互动成功', type: PetInteractionResultDto })
  @ApiResponse({ status: 404, description: '宠物不存在' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @Post(':id/interact')
  async interact(
    @Param('id', ParseUUIDPipe) id: string,
    @User('id') userId: string,
    @Body() interactionDto: PetInteractionDto,
  ): Promise<PetInteractionResultDto> {
    return this.petsService.interact(id, userId, interactionDto);
  }

  /**
   * 获取宠物护理建议
   */
  @ApiOperation({ summary: '获取宠物护理建议', description: '根据宠物状态获取护理建议' })
  @ApiParam({ name: 'id', description: '宠物ID', type: 'string' })
  @ApiResponse({ status: 200, description: '获取成功', type: [PetCareAdviceDto] })
  @ApiResponse({ status: 404, description: '宠物不存在' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @Get(':id/care-advice')
  async getCareAdvice(
    @Param('id', ParseUUIDPipe) id: string,
    @User('id') userId: string,
  ): Promise<PetCareAdviceDto[]> {
    return this.petsService.getPetCareAdvice(id, userId);
  }

  /**
   * 获取宠物详情（公开接口，用于分享）
   */
  @ApiOperation({ summary: '获取宠物公开信息', description: '获取宠物的公开信息，无需认证，用于分享' })
  @ApiParam({ name: 'id', description: '宠物ID', type: 'string' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '宠物不存在' })
  @Public()
  @Get(':id/public')
  async getPublicPetInfo(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Partial<PetDto>> {
    const pet = await this.petsService.findById(id);
    
    // 只返回公开信息
    return {
      id: pet.id,
      name: pet.name,
      type: pet.type,
      avatar: pet.avatar,
      level: pet.level,
      status: pet.status,
      overallScore: pet.overallScore,
      age: pet.age,
      createdAt: pet.createdAt,
    };
  }
}