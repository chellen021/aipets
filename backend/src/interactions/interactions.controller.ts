import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InteractionsService } from './interactions.service';
import {
  CreateInteractionDto,
  InteractionDto,
  InteractionQueryDto,
  InteractionStatsDto,
  PetInteractionHistoryDto,
  InteractionSuggestionDto,
  BatchInteractionDto,
  BatchInteractionResultDto,
} from './dto/interaction.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';
import { PaginatedResponseDto } from '../common/dto/base-response.dto';
import { Request } from 'express';

@Controller('interactions')
@UseGuards(JwtAuthGuard)
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  /**
   * 创建互动记录
   */
  @Post('pets/:petId')
  async create(
    @Param('petId', ParseUUIDPipe) petId: string,
    @User('id') userId: string,
    @Body() createInteractionDto: CreateInteractionDto,
    @Req() req: Request,
  ): Promise<InteractionDto> {
    const ipAddress = this.getClientIp(req);
    const userAgent = req.headers['user-agent'];
    
    return this.interactionsService.create(
      userId,
      petId,
      createInteractionDto,
      ipAddress,
      userAgent,
    );
  }

  /**
   * 获取当前用户的互动记录
   */
  @Get('my')
  async getMyInteractions(
    @User('id') userId: string,
    @Query() query: InteractionQueryDto,
  ): Promise<PaginatedResponseDto<InteractionDto>> {
    return this.interactionsService.findByUserId(userId, query);
  }

  /**
   * 获取当前用户的互动统计
   */
  @Get('my/stats')
  async getMyInteractionStats(
    @User('id') userId: string,
    @Query('days') days?: number,
  ): Promise<InteractionStatsDto> {
    return this.interactionsService.getUserInteractionStats(userId, days);
  }

  /**
   * 获取互动建议
   */
  @Get('suggestions')
  async getInteractionSuggestions(
    @User('id') userId: string,
  ): Promise<InteractionSuggestionDto[]> {
    return this.interactionsService.getInteractionSuggestions(userId);
  }

  /**
   * 获取宠物的互动历史
   */
  @Get('pets/:petId/history')
  async getPetInteractionHistory(
    @Param('petId', ParseUUIDPipe) petId: string,
    @User('id') userId: string,
  ): Promise<PetInteractionHistoryDto> {
    return this.interactionsService.getPetInteractionHistory(petId, userId);
  }

  /**
   * 批量互动
   */
  @Post('batch')
  @HttpCode(HttpStatus.OK)
  async batchInteract(
    @User('id') userId: string,
    @Body() batchInteractionDto: BatchInteractionDto,
    @Req() req: Request,
  ): Promise<BatchInteractionResultDto> {
    const ipAddress = this.getClientIp(req);
    const userAgent = req.headers['user-agent'];
    
    return this.interactionsService.batchInteract(
      userId,
      batchInteractionDto,
      ipAddress,
      userAgent,
    );
  }

  /**
   * 获取特定宠物的互动记录
   */
  @Get('pets/:petId')
  async getPetInteractions(
    @Param('petId', ParseUUIDPipe) petId: string,
    @User('id') userId: string,
    @Query() query: Omit<InteractionQueryDto, 'petId'>,
  ): Promise<PaginatedResponseDto<InteractionDto>> {
    const fullQuery = { ...query, petId };
    return this.interactionsService.findByUserId(userId, fullQuery);
  }

  /**
   * 获取今日互动统计
   */
  @Get('my/today')
  async getTodayStats(
    @User('id') userId: string,
  ): Promise<{
    totalInteractions: number;
    experienceGained: number;
    pointsGained: number;
    levelUps: number;
    mostActiveType: string;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const query: InteractionQueryDto = {
      page: 1,
      limit: 1000,
      startDate: today.toISOString(),
      endDate: tomorrow.toISOString(),
    };

    const result = await this.interactionsService.findByUserId(userId, query);
    const interactions = result.data;

    const totalInteractions = interactions.length;
    const experienceGained = interactions.reduce((sum, i) => sum + i.experienceGained, 0);
    const pointsGained = interactions.reduce((sum, i) => sum + i.pointsGained, 0);
    const levelUps = interactions.filter(i => i.levelUpOccurred).length;

    // 找出最活跃的互动类型
    const typeCount = new Map<string, number>();
    interactions.forEach(interaction => {
      typeCount.set(interaction.type, (typeCount.get(interaction.type) || 0) + 1);
    });
    const mostActiveType = Array.from(typeCount.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';

    return {
      totalInteractions,
      experienceGained,
      pointsGained,
      levelUps,
      mostActiveType,
    };
  }

  /**
   * 获取互动类型统计
   */
  @Get('my/types')
  async getInteractionTypeStats(
    @User('id') userId: string,
    @Query('days') days: number = 30,
  ): Promise<{
    type: string;
    count: number;
    percentage: number;
    totalExperience: number;
    averageEffectiveness: number;
  }[]> {
    const stats = await this.interactionsService.getUserInteractionStats(userId, days);
    const totalInteractions = stats.totalInteractions;

    return stats.interactionsByType.map(typeStats => ({
      type: typeStats.type,
      count: typeStats.count,
      percentage: totalInteractions > 0 ? Math.round((typeStats.count / totalInteractions) * 100) : 0,
      totalExperience: typeStats.totalExperience,
      averageEffectiveness: Math.round(typeStats.averageEffectiveness * 100) / 100,
    }));
  }

  /**
   * 获取互动趋势数据
   */
  @Get('my/trends')
  async getInteractionTrends(
    @User('id') userId: string,
    @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'daily',
    @Query('days') days: number = 30,
  ): Promise<{
    period: string;
    interactions: number;
    experience: number;
    points: number;
    effectiveness: number;
  }[]> {
    const stats = await this.interactionsService.getUserInteractionStats(userId, days);
    
    if (period === 'daily') {
      return stats.dailyInteractions.map(daily => ({
        period: daily.date,
        interactions: daily.count,
        experience: daily.experience,
        points: daily.points,
        effectiveness: 0, // 需要额外计算
      }));
    }

    // 对于周/月统计，需要进一步聚合数据
    // 这里简化处理，返回日统计
    return stats.dailyInteractions.map(daily => ({
      period: daily.date,
      interactions: daily.count,
      experience: daily.experience,
      points: daily.points,
      effectiveness: 0,
    }));
  }

  /**
   * 获取客户端IP地址
   */
  private getClientIp(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (req.headers['x-real-ip'] as string) ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      '127.0.0.1'
    );
  }
}