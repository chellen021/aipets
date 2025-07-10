import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Interaction, InteractionType, InteractionResult } from './entities/interaction.entity';
import { PetsService } from '../pets/pets.service';
import { UsersService } from '../users/users.service';
import {
  CreateInteractionDto,
  InteractionDto,
  InteractionQueryDto,
  InteractionStatsDto,
  InteractionTrendDto,
  PetInteractionHistoryDto,
  InteractionLeaderboardDto,
  InteractionLeaderboardQueryDto,
  InteractionSuggestionDto,
  BatchInteractionDto,
  BatchInteractionResultDto,
} from './dto/interaction.dto';
import { PaginatedResponseDto } from '../common/dto/base-response.dto';

@Injectable()
export class InteractionsService {
  private readonly logger = new Logger(InteractionsService.name);

  constructor(
    @InjectRepository(Interaction)
    private readonly interactionRepository: Repository<Interaction>,
    private readonly petsService: PetsService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * 创建互动记录
   */
  async create(
    userId: string,
    petId: string,
    createInteractionDto: CreateInteractionDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<InteractionDto> {
    // 验证宠物是否存在且属于用户
    const pet = await this.petsService.findById(petId, userId);
    if (!pet) {
      throw new NotFoundException('宠物不存在或无权访问');
    }

    // 记录互动前的宠物状态
    const petStateBefore = {
      health: pet.health,
      happiness: pet.happiness,
      energy: pet.energy,
      hunger: pet.hunger,
      level: pet.level,
    };

    // 执行互动（通过PetsService）
    const interactionResult = await this.petsService.interact(petId, userId, {
      action: createInteractionDto.type,
      item: createInteractionDto.item,
      intensity: createInteractionDto.intensity,
    });

    // 获取互动后的宠物状态
    const updatedPet = await this.petsService.findById(petId, userId);
    const petStateAfter = {
      health: updatedPet.health,
      happiness: updatedPet.happiness,
      energy: updatedPet.energy,
      hunger: updatedPet.hunger,
      level: updatedPet.level,
    };

    // 解析设备信息
    const deviceType = this.parseDeviceType(userAgent);

    // 创建互动记录
    const interaction = this.interactionRepository.create({
      type: createInteractionDto.type,
      result: interactionResult.success ? InteractionResult.SUCCESS : InteractionResult.FAILED,
      item: createInteractionDto.item,
      intensity: createInteractionDto.intensity || 5,
      experienceGained: interactionResult.experienceGained,
      pointsGained: interactionResult.pointsGained,
      duration: createInteractionDto.duration || 0,
      attributeChanges: interactionResult.attributeChanges,
      petStateBefore,
      petStateAfter,
      notes: createInteractionDto.notes,
      ipAddress,
      userAgent,
      deviceType,
      levelUpOccurred: interactionResult.levelUp || false,
      newLevel: interactionResult.newLevel,
      userId,
      petId,
    });

    const savedInteraction = await this.interactionRepository.save(interaction);
    this.logger.log(`用户 ${userId} 与宠物 ${petId} 进行了 ${createInteractionDto.type} 互动`);

    return this.toInteractionDto(savedInteraction);
  }

  /**
   * 获取用户的互动记录
   */
  async findByUserId(
    userId: string,
    query: InteractionQueryDto,
  ): Promise<PaginatedResponseDto<InteractionDto>> {
    const {
      page = 1,
      limit = 20,
      petId,
      type,
      result,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      effectiveOnly,
      levelUpOnly,
    } = query;

    const queryBuilder = this.interactionRepository.createQueryBuilder('interaction')
      .leftJoinAndSelect('interaction.pet', 'pet')
      .where('interaction.userId = :userId', { userId });

    // 应用过滤条件
    if (petId) {
      queryBuilder.andWhere('interaction.petId = :petId', { petId });
    }

    if (type) {
      queryBuilder.andWhere('interaction.type = :type', { type });
    }

    if (result) {
      queryBuilder.andWhere('interaction.result = :result', { result });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('interaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    if (effectiveOnly) {
      queryBuilder.andWhere('interaction.result = :successResult', {
        successResult: InteractionResult.SUCCESS,
      });
    }

    if (levelUpOnly) {
      queryBuilder.andWhere('interaction.levelUpOccurred = true');
    }

    // 排序
    queryBuilder.orderBy(`interaction.${sortBy}`, sortOrder);

    // 分页
    const [interactions, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const interactionDtos = interactions.map(interaction => this.toInteractionDto(interaction));

    return {
      data: interactionDtos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  /**
   * 获取用户的互动统计
   */
  async getUserInteractionStats(userId: string, days: number = 30): Promise<InteractionStatsDto> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const interactions = await this.interactionRepository.find({
      where: {
        userId,
        createdAt: Between(startDate, new Date()),
      },
      order: { createdAt: 'DESC' },
    });

    const totalInteractions = interactions.length;
    const effectiveInteractions = interactions.filter(i => i.isEffective()).length;
    const totalExperienceGained = interactions.reduce((sum, i) => sum + i.experienceGained, 0);
    const totalPointsGained = interactions.reduce((sum, i) => sum + i.pointsGained, 0);
    const averageEffectivenessScore = totalInteractions > 0 ?
      interactions.reduce((sum, i) => sum + i.getEffectivenessScore(), 0) / totalInteractions : 0;
    const levelUpsTriggered = interactions.filter(i => i.levelUpOccurred).length;

    // 按类型统计
    const typeStats = new Map<InteractionType, { count: number; totalExperience: number; effectiveness: number[] }>();
    interactions.forEach(interaction => {
      const type = interaction.type;
      if (!typeStats.has(type)) {
        typeStats.set(type, { count: 0, totalExperience: 0, effectiveness: [] });
      }
      const stats = typeStats.get(type)!;
      stats.count++;
      stats.totalExperience += interaction.experienceGained;
      stats.effectiveness.push(interaction.getEffectivenessScore());
    });

    const interactionsByType = Array.from(typeStats.entries()).map(([type, stats]) => ({
      type,
      count: stats.count,
      totalExperience: stats.totalExperience,
      averageEffectiveness: stats.effectiveness.length > 0 ?
        stats.effectiveness.reduce((sum, score) => sum + score, 0) / stats.effectiveness.length : 0,
    }));

    // 每日统计
    const dailyStats = new Map<string, { count: number; experience: number; points: number }>();
    interactions.forEach(interaction => {
      const date = interaction.createdAt.toISOString().split('T')[0];
      if (!dailyStats.has(date)) {
        dailyStats.set(date, { count: 0, experience: 0, points: 0 });
      }
      const stats = dailyStats.get(date)!;
      stats.count++;
      stats.experience += interaction.experienceGained;
      stats.points += interaction.pointsGained;
    });

    const dailyInteractions = Array.from(dailyStats.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 活跃时段统计
    const hourlyStats = new Map<number, number>();
    interactions.forEach(interaction => {
      const hour = interaction.createdAt.getHours();
      hourlyStats.set(hour, (hourlyStats.get(hour) || 0) + 1);
    });

    const mostActiveHours = Array.from(hourlyStats.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalInteractions,
      effectiveInteractions,
      totalExperienceGained,
      totalPointsGained,
      averageEffectivenessScore: Math.round(averageEffectivenessScore * 100) / 100,
      levelUpsTriggered,
      interactionsByType,
      dailyInteractions,
      mostActiveHours,
    };
  }

  /**
   * 获取宠物的互动历史
   */
  async getPetInteractionHistory(petId: string, userId: string): Promise<PetInteractionHistoryDto> {
    // 验证权限
    await this.petsService.findById(petId, userId);

    const interactions = await this.interactionRepository.find({
      where: { petId },
      order: { createdAt: 'DESC' },
      take: 10, // 最近10次互动
    });

    if (interactions.length === 0) {
      const pet = await this.petsService.findById(petId, userId);
      return {
        petId,
        petName: pet.name,
        totalInteractions: 0,
        firstInteraction: new Date(),
        lastInteraction: new Date(),
        favoriteInteractionType: InteractionType.FEED,
        averageEffectiveness: 0,
        totalLevelUps: 0,
        recentInteractions: [],
      };
    }

    const allInteractions = await this.interactionRepository.find({
      where: { petId },
      order: { createdAt: 'ASC' },
    });

    const pet = await this.petsService.findById(petId, userId);
    const totalInteractions = allInteractions.length;
    const firstInteraction = allInteractions[0].createdAt;
    const lastInteraction = allInteractions[allInteractions.length - 1].createdAt;
    
    // 找出最喜欢的互动类型
    const typeCount = new Map<InteractionType, number>();
    allInteractions.forEach(interaction => {
      typeCount.set(interaction.type, (typeCount.get(interaction.type) || 0) + 1);
    });
    const favoriteInteractionType = Array.from(typeCount.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || InteractionType.FEED;

    const averageEffectiveness = allInteractions.length > 0 ?
      allInteractions.reduce((sum, i) => sum + i.getEffectivenessScore(), 0) / allInteractions.length : 0;
    const totalLevelUps = allInteractions.filter(i => i.levelUpOccurred).length;

    const recentInteractions = interactions.map(interaction => this.toInteractionDto(interaction));

    return {
      petId,
      petName: pet.name,
      totalInteractions,
      firstInteraction,
      lastInteraction,
      favoriteInteractionType,
      averageEffectiveness: Math.round(averageEffectiveness * 100) / 100,
      totalLevelUps,
      recentInteractions,
    };
  }

  /**
   * 获取互动建议
   */
  async getInteractionSuggestions(userId: string): Promise<InteractionSuggestionDto[]> {
    // 获取用户的宠物
    const pets = await this.petsService.findByUserId(userId, { page: 1, limit: 100 });
    const suggestions: InteractionSuggestionDto[] = [];

    for (const pet of pets.data) {
      // 根据宠物状态生成建议
      if (pet.hunger < 30) {
        suggestions.push({
          petId: pet.id,
          petName: pet.name,
          suggestedType: InteractionType.FEED,
          reason: '宠物很饿，需要及时喂食',
          expectedBenefit: '恢复饥饿值，提升健康度',
          priority: 'high',
          estimatedDuration: 5,
          requiredItems: ['宠物食物'],
          tips: ['选择营养丰富的食物', '注意喂食量'],
        });
      }

      if (pet.happiness < 40) {
        suggestions.push({
          petId: pet.id,
          petName: pet.name,
          suggestedType: InteractionType.PLAY,
          reason: '宠物情绪低落，需要陪伴和娱乐',
          expectedBenefit: '提升快乐值，增强互动关系',
          priority: 'medium',
          estimatedDuration: 15,
          requiredItems: ['玩具'],
          tips: ['选择宠物喜欢的游戏', '保持耐心和热情'],
        });
      }

      if (pet.health < 50) {
        suggestions.push({
          petId: pet.id,
          petName: pet.name,
          suggestedType: InteractionType.CARE,
          reason: '宠物健康状况需要关注',
          expectedBenefit: '改善健康状况，预防疾病',
          priority: 'high',
          estimatedDuration: 20,
          tips: ['定期检查宠物状态', '提供舒适的环境'],
        });
      }

      if (pet.energy < 30) {
        suggestions.push({
          petId: pet.id,
          petName: pet.name,
          suggestedType: InteractionType.SLEEP,
          reason: '宠物精力不足，需要休息',
          expectedBenefit: '恢复精力，改善整体状态',
          priority: 'medium',
          estimatedDuration: 30,
          tips: ['提供安静的休息环境', '避免打扰'],
        });
      }
    }

    // 按优先级排序
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return suggestions.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  }

  /**
   * 批量互动
   */
  async batchInteract(
    userId: string,
    batchInteractionDto: BatchInteractionDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<BatchInteractionResultDto> {
    const { petIds, type, item, intensity, notes } = batchInteractionDto;
    const results: BatchInteractionResultDto['results'] = [];
    let successfulInteractions = 0;
    let failedInteractions = 0;
    let totalExperienceGained = 0;
    let totalPointsGained = 0;
    let levelUpsOccurred = 0;

    for (const petId of petIds) {
      try {
        const interaction = await this.create(
          userId,
          petId,
          { type, item, intensity, notes },
          ipAddress,
          userAgent,
        );

        const pet = await this.petsService.findById(petId, userId);
        results.push({
          petId,
          petName: pet.name,
          success: true,
          experienceGained: interaction.experienceGained,
          pointsGained: interaction.pointsGained,
          levelUp: interaction.levelUpOccurred,
        });

        successfulInteractions++;
        totalExperienceGained += interaction.experienceGained;
        totalPointsGained += interaction.pointsGained;
        if (interaction.levelUpOccurred) levelUpsOccurred++;
      } catch (error) {
        const pet = await this.petsService.findById(petId, userId).catch(() => null);
        results.push({
          petId,
          petName: pet?.name || '未知宠物',
          success: false,
          error: error.message,
          experienceGained: 0,
          pointsGained: 0,
          levelUp: false,
        });
        failedInteractions++;
      }
    }

    return {
      totalPets: petIds.length,
      successfulInteractions,
      failedInteractions,
      totalExperienceGained,
      totalPointsGained,
      levelUpsOccurred,
      results,
    };
  }

  /**
   * 解析设备类型
   */
  private parseDeviceType(userAgent?: string): string {
    if (!userAgent) return 'unknown';
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  /**
   * 转换为InteractionDto
   */
  private toInteractionDto(interaction: Interaction): InteractionDto {
    return {
      id: interaction.id,
      type: interaction.type,
      typeDisplayName: interaction.getTypeDisplayName(),
      result: interaction.result,
      item: interaction.item,
      intensity: interaction.intensity,
      experienceGained: interaction.experienceGained,
      pointsGained: interaction.pointsGained,
      duration: interaction.duration,
      attributeChanges: interaction.attributeChanges,
      petStateBefore: interaction.petStateBefore,
      petStateAfter: interaction.petStateAfter,
      notes: interaction.notes,
      levelUpOccurred: interaction.levelUpOccurred,
      newLevel: interaction.newLevel,
      effectivenessScore: interaction.getEffectivenessScore(),
      isEffective: interaction.isEffective(),
      userId: interaction.userId,
      petId: interaction.petId,
      pet: interaction.pet ? {
        id: interaction.pet.id,
        name: interaction.pet.name,
        type: interaction.pet.type,
        avatar: interaction.pet.avatar,
      } : undefined,
      createdAt: interaction.createdAt,
    };
  }
}