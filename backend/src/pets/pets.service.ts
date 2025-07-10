import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like } from 'typeorm';
import { Pet, PetType, PetStatus } from './entities/pet.entity';
import { UsersService } from '../users/users.service';
import {
  CreatePetDto,
  UpdatePetDto,
  PetDto,
  PetBriefDto,
  PetStatsDto,
  PetInteractionDto,
  PetInteractionResultDto,
  PetQueryDto,
  PetRankingDto,
  PetRankingQueryDto,
  PetCareAdviceDto,
  PetHealthReportDto,
} from './dto/pet.dto';
import { PaginatedResponseDto } from '../common/dto/base-response.dto';

@Injectable()
export class PetsService {
  private readonly logger = new Logger(PetsService.name);

  constructor(
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
    private readonly usersService: UsersService,
  ) {}

  /**
   * 创建宠物
   */
  async create(userId: string, createPetDto: CreatePetDto): Promise<PetDto> {
    // 检查用户是否存在
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 检查用户宠物数量限制（假设最多5只）
    const userPetCount = await this.petRepository.count({
      where: { ownerId: userId },
    });
    if (userPetCount >= 5) {
      throw new BadRequestException('宠物数量已达上限（5只）');
    }

    // 创建宠物
    const pet = this.petRepository.create({
      ...createPetDto,
      ownerId: userId,
      birthday: createPetDto.birthday ? new Date(createPetDto.birthday) : new Date(),
      lastInteractionTime: new Date(),
    });

    const savedPet = await this.petRepository.save(pet);
    this.logger.log(`用户 ${userId} 创建了新宠物: ${savedPet.id}`);

    return this.toPetDto(savedPet);
  }

  /**
   * 获取用户的宠物列表
   */
  async findByUserId(
    userId: string,
    query: PetQueryDto,
  ): Promise<PaginatedResponseDto<PetDto>> {
    const { page = 1, limit = 10, type, status, search, sortBy = 'createdAt', sortOrder = 'DESC', needsCareOnly } = query;

    const queryBuilder = this.petRepository.createQueryBuilder('pet')
      .where('pet.ownerId = :userId', { userId });

    // 应用过滤条件
    if (type) {
      queryBuilder.andWhere('pet.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('pet.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere('pet.name ILIKE :search', { search: `%${search}%` });
    }

    if (needsCareOnly) {
      queryBuilder.andWhere(
        '(pet.health < 50 OR pet.happiness < 50 OR pet.energy < 30 OR pet.hunger < 30)'
      );
    }

    // 排序
    queryBuilder.orderBy(`pet.${sortBy}`, sortOrder);

    // 分页
    const [pets, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // 更新宠物状态（自然衰减）
    const updatedPets = await Promise.all(
      pets.map(async (pet) => {
        pet.naturalDecay();
        return this.petRepository.save(pet);
      })
    );

    const petDtos = updatedPets.map(pet => this.toPetDto(pet));

    return {
      data: petDtos,
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
   * 根据ID获取宠物详情
   */
  async findById(petId: string, userId?: string): Promise<PetDto> {
    const pet = await this.petRepository.findOne({
      where: { id: petId },
    });

    if (!pet) {
      throw new NotFoundException('宠物不存在');
    }

    // 如果指定了用户ID，检查权限
    if (userId && pet.ownerId !== userId) {
      throw new ForbiddenException('无权访问此宠物');
    }

    // 更新宠物状态
    pet.naturalDecay();
    const updatedPet = await this.petRepository.save(pet);

    return this.toPetDto(updatedPet);
  }

  /**
   * 更新宠物信息
   */
  async update(petId: string, userId: string, updatePetDto: UpdatePetDto): Promise<PetDto> {
    const pet = await this.petRepository.findOne({
      where: { id: petId, ownerId: userId },
    });

    if (!pet) {
      throw new NotFoundException('宠物不存在或无权访问');
    }

    // 更新宠物信息
    Object.assign(pet, {
      ...updatePetDto,
      birthday: updatePetDto.birthday ? new Date(updatePetDto.birthday) : pet.birthday,
    });

    const updatedPet = await this.petRepository.save(pet);
    this.logger.log(`宠物 ${petId} 信息已更新`);

    return this.toPetDto(updatedPet);
  }

  /**
   * 删除宠物
   */
  async remove(petId: string, userId: string): Promise<void> {
    const pet = await this.petRepository.findOne({
      where: { id: petId, ownerId: userId },
    });

    if (!pet) {
      throw new NotFoundException('宠物不存在或无权访问');
    }

    await this.petRepository.remove(pet);
    this.logger.log(`宠物 ${petId} 已被删除`);
  }

  /**
   * 宠物互动
   */
  async interact(
    petId: string,
    userId: string,
    interactionDto: PetInteractionDto,
  ): Promise<PetInteractionResultDto> {
    const pet = await this.petRepository.findOne({
      where: { id: petId, ownerId: userId },
    });

    if (!pet) {
      throw new NotFoundException('宠物不存在或无权访问');
    }

    // 更新宠物状态
    pet.naturalDecay();

    const { action, intensity = 5 } = interactionDto;
    let experienceGained = 0;
    let pointsGained = 0;
    const attributeChanges: any = {};
    let message = '';

    // 根据互动类型更新属性
    switch (action) {
      case 'feed':
        const hungerIncrease = Math.min(30, 100 - pet.hunger);
        pet.hunger = Math.min(100, pet.hunger + hungerIncrease);
        pet.health = Math.min(100, pet.health + 5);
        pet.totalFeedings += 1;
        pet.lastFeedTime = new Date();
        experienceGained = 10;
        pointsGained = 5;
        attributeChanges.hunger = hungerIncrease;
        attributeChanges.health = 5;
        message = '宠物吃得很开心！';
        break;

      case 'play':
        const happinessIncrease = Math.min(25, 100 - pet.happiness);
        pet.happiness = Math.min(100, pet.happiness + happinessIncrease);
        pet.energy = Math.max(0, pet.energy - 10);
        pet.hunger = Math.max(0, pet.hunger - 5);
        pet.totalPlayings += 1;
        pet.lastPlayTime = new Date();
        experienceGained = 15;
        pointsGained = 8;
        attributeChanges.happiness = happinessIncrease;
        attributeChanges.energy = -10;
        attributeChanges.hunger = -5;
        message = '宠物玩得很开心！';
        break;

      case 'care':
        const healthIncrease = Math.min(20, 100 - pet.health);
        const energyIncrease = Math.min(15, 100 - pet.energy);
        pet.health = Math.min(100, pet.health + healthIncrease);
        pet.energy = Math.min(100, pet.energy + energyIncrease);
        pet.happiness = Math.min(100, pet.happiness + 10);
        pet.totalCarings += 1;
        pet.lastCareTime = new Date();
        experienceGained = 12;
        pointsGained = 6;
        attributeChanges.health = healthIncrease;
        attributeChanges.energy = energyIncrease;
        attributeChanges.happiness = 10;
        message = '宠物感受到了你的关爱！';
        break;

      case 'clean':
        pet.health = Math.min(100, pet.health + 10);
        pet.happiness = Math.min(100, pet.happiness + 15);
        experienceGained = 8;
        pointsGained = 4;
        attributeChanges.health = 10;
        attributeChanges.happiness = 15;
        message = '宠物变得干净整洁！';
        break;

      case 'medicine':
        if (pet.health < 70) {
          const healthRestore = Math.min(40, 100 - pet.health);
          pet.health = Math.min(100, pet.health + healthRestore);
          experienceGained = 5;
          pointsGained = 3;
          attributeChanges.health = healthRestore;
          message = '宠物的健康状况有所改善！';
        } else {
          message = '宠物目前不需要药物治疗。';
        }
        break;

      default:
        throw new BadRequestException('无效的互动类型');
    }

    // 更新互动时间和经验
    pet.lastInteractionTime = new Date();
    pet.experience += experienceGained;

    // 检查升级
    let levelUp = false;
    let newLevel = pet.level;
    if (pet.canLevelUp()) {
      pet.levelUp();
      levelUp = true;
      newLevel = pet.level;
      pointsGained += 20; // 升级奖励
    }

    // 更新宠物状态
    pet.updateStatus();

    // 保存宠物
    const updatedPet = await this.petRepository.save(pet);

    // 给用户增加积分
    if (pointsGained > 0) {
      await this.usersService.addPoints(userId, pointsGained);
    }

    this.logger.log(`宠物 ${petId} 进行了 ${action} 互动，获得 ${experienceGained} 经验`);

    return {
      success: true,
      message,
      experienceGained,
      pointsGained,
      attributeChanges,
      levelUp,
      newLevel: levelUp ? newLevel : undefined,
      pet: this.toPetDto(updatedPet),
    };
  }

  /**
   * 获取用户宠物统计
   */
  async getUserPetStats(userId: string): Promise<PetStatsDto> {
    const pets = await this.petRepository.find({
      where: { ownerId: userId },
    });

    const totalPets = pets.length;
    const healthyPets = pets.filter(pet => pet.status === PetStatus.HEALTHY).length;
    const petsNeedingCare = pets.filter(pet => pet.needsCare()).length;
    const averageLevel = totalPets > 0 ? 
      Math.round(pets.reduce((sum, pet) => sum + pet.level, 0) / totalPets) : 0;
    const totalInteractions = pets.reduce(
      (sum, pet) => sum + pet.totalFeedings + pet.totalPlayings + pet.totalCarings, 0
    );

    // 找到最活跃的宠物
    let mostActivePet: PetBriefDto | undefined;
    if (pets.length > 0) {
      const mostActive = pets.reduce((prev, current) => {
        const prevInteractions = prev.totalFeedings + prev.totalPlayings + prev.totalCarings;
        const currentInteractions = current.totalFeedings + current.totalPlayings + current.totalCarings;
        return currentInteractions > prevInteractions ? current : prev;
      });
      mostActivePet = this.toPetBriefDto(mostActive);
    }

    return {
      totalPets,
      healthyPets,
      petsNeedingCare,
      averageLevel,
      totalInteractions,
      mostActivePet,
    };
  }

  /**
   * 获取宠物排行榜
   */
  async getPetRanking(query: PetRankingQueryDto): Promise<PaginatedResponseDto<PetRankingDto>> {
    const { page = 1, limit = 10, rankBy = 'level', type } = query;

    const queryBuilder = this.petRepository.createQueryBuilder('pet')
      .leftJoinAndSelect('pet.owner', 'owner');

    if (type) {
      queryBuilder.where('pet.type = :type', { type });
    }

    // 根据排行依据排序
    let orderField = 'pet.level';
    switch (rankBy) {
      case 'experience':
        orderField = 'pet.experience';
        break;
      case 'overallScore':
        orderField = '(pet.health + pet.happiness + pet.energy + pet.hunger) / 4';
        break;
      case 'totalInteractions':
        orderField = '(pet.totalFeedings + pet.totalPlayings + pet.totalCarings)';
        break;
    }

    queryBuilder.orderBy(orderField, 'DESC');

    const [pets, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const rankings = pets.map((pet, index) => {
      let score = pet.level;
      switch (rankBy) {
        case 'experience':
          score = pet.experience;
          break;
        case 'overallScore':
          score = pet.getOverallScore();
          break;
        case 'totalInteractions':
          score = pet.totalFeedings + pet.totalPlayings + pet.totalCarings;
          break;
      }

      return {
        rank: (page - 1) * limit + index + 1,
        pet: this.toPetBriefDto(pet),
        owner: {
          id: pet.owner.id,
          nickname: pet.owner.nickname,
          avatar: pet.owner.avatar,
        },
        score,
      };
    });

    return {
      data: rankings,
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
   * 获取宠物护理建议
   */
  async getPetCareAdvice(petId: string, userId: string): Promise<PetCareAdviceDto[]> {
    const pet = await this.findById(petId, userId);
    const advices: PetCareAdviceDto[] = [];

    // 健康建议
    if (pet.health < 30) {
      advices.push({
        priority: 'high',
        category: 'health',
        title: '健康状况危急',
        description: '宠物的健康状况很差，需要立即照顾',
        suggestedActions: ['使用药物治疗', '增加护理频率', '确保充足休息'],
        estimatedTime: 30,
      });
    } else if (pet.health < 60) {
      advices.push({
        priority: 'medium',
        category: 'health',
        title: '健康需要关注',
        description: '宠物的健康状况一般，建议加强护理',
        suggestedActions: ['定期护理', '注意饮食', '适量运动'],
        estimatedTime: 15,
      });
    }

    // 快乐度建议
    if (pet.happiness < 30) {
      advices.push({
        priority: 'high',
        category: 'happiness',
        title: '情绪低落',
        description: '宠物看起来很不开心，需要更多关爱',
        suggestedActions: ['陪宠物玩耍', '给予更多关注', '尝试新的互动方式'],
        estimatedTime: 20,
      });
    }

    // 精力建议
    if (pet.energy < 30) {
      advices.push({
        priority: 'medium',
        category: 'energy',
        title: '精力不足',
        description: '宠物看起来很疲惫，需要休息',
        suggestedActions: ['让宠物充分休息', '减少剧烈活动', '提供舒适环境'],
        estimatedTime: 10,
      });
    }

    // 饥饿建议
    if (pet.hunger < 30) {
      advices.push({
        priority: 'high',
        category: 'hunger',
        title: '需要进食',
        description: '宠物很饿，需要及时喂食',
        suggestedActions: ['立即喂食', '检查食物质量', '调整喂食时间'],
        estimatedTime: 5,
      });
    }

    // 如果没有特殊问题，给出一般建议
    if (advices.length === 0) {
      advices.push({
        priority: 'low',
        category: 'general',
        title: '保持良好状态',
        description: '宠物状态良好，继续保持定期互动',
        suggestedActions: ['定期互动', '保持清洁', '监控健康状况'],
        estimatedTime: 10,
      });
    }

    return advices.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * 转换为PetDto
   */
  private toPetDto(pet: Pet): PetDto {
    return {
      id: pet.id,
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      gender: pet.gender,
      birthday: pet.birthday,
      avatar: pet.avatar,
      description: pet.description,
      health: pet.health,
      happiness: pet.happiness,
      energy: pet.energy,
      hunger: pet.hunger,
      experience: pet.experience,
      level: pet.level,
      status: pet.status,
      age: pet.getAge(),
      overallScore: pet.getOverallScore(),
      needsCare: pet.needsCare(),
      canLevelUp: pet.canLevelUp(),
      totalFeedings: pet.totalFeedings,
      totalPlayings: pet.totalPlayings,
      totalCarings: pet.totalCarings,
      lastFeedTime: pet.lastFeedTime,
      lastPlayTime: pet.lastPlayTime,
      lastCareTime: pet.lastCareTime,
      lastInteractionTime: pet.lastInteractionTime,
      ownerId: pet.ownerId,
      createdAt: pet.createdAt,
      updatedAt: pet.updatedAt,
    };
  }

  /**
   * 转换为PetBriefDto
   */
  private toPetBriefDto(pet: Pet): PetBriefDto {
    return {
      id: pet.id,
      name: pet.name,
      type: pet.type,
      avatar: pet.avatar,
      level: pet.level,
      status: pet.status,
      overallScore: pet.getOverallScore(),
      needsCare: pet.needsCare(),
    };
  }
}