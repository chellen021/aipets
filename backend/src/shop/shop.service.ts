import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In, MoreThan, LessThan } from 'typeorm';
import { ShopItem, ItemStatus, ItemType, ItemRarity } from './entities/shop-item.entity';
import { Purchase, PurchaseStatus, PaymentMethod, PurchaseSource } from './entities/purchase.entity';
import { UsersService } from '../users/users.service';
import {
  ShopItemQueryDto,
  ShopItemDto,
  ShopItemBriefDto,
  PurchaseItemDto,
  PurchaseResultDto,
  PurchaseDto,
  PurchaseHistoryQueryDto,
  PurchaseStatsDto,
  ShopCategoryDto,
  ShopHomeDto,
  SearchSuggestionDto,
  RefundRequestDto,
  RefundResultDto,
} from './dto/shop.dto';
import { PaginatedResponseDto } from '../common/dto/base-response.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ShopService {
  private readonly logger = new Logger(ShopService.name);

  constructor(
    @InjectRepository(ShopItem)
    private readonly shopItemRepository: Repository<ShopItem>,
    @InjectRepository(Purchase)
    private readonly purchaseRepository: Repository<Purchase>,
    private readonly usersService: UsersService,
  ) {}

  /**
   * 获取商店首页数据
   */
  async getShopHome(): Promise<ShopHomeDto> {
    // 获取分类
    const categories = await this.getCategories();

    // 获取推荐商品
    const recommendedItems = await this.getItemsByCondition(
      { isRecommended: true, status: ItemStatus.ACTIVE },
      8
    );

    // 获取新品
    const newItems = await this.getItemsByCondition(
      { isNew: true, status: ItemStatus.ACTIVE },
      8
    );

    // 获取热门商品
    const hotItems = await this.getItemsByCondition(
      { isHot: true, status: ItemStatus.ACTIVE },
      8
    );

    // 获取限量商品
    const limitedItems = await this.getItemsByCondition(
      { isLimited: true, status: ItemStatus.ACTIVE },
      6
    );

    // 获取今日特价（有折扣的商品）
    const todayDeals = await this.shopItemRepository
      .createQueryBuilder('item')
      .where('item.status = :status', { status: ItemStatus.ACTIVE })
      .andWhere('item.discount IS NOT NULL')
      .orderBy('item.soldCount', 'DESC')
      .take(6)
      .getMany();

    return {
      banners: [
        {
          id: '1',
          title: '新用户专享礼包',
          imageUrl: '/images/banners/newbie-pack.jpg',
          linkType: 'category',
          linkValue: 'special',
          sortOrder: 1,
        },
        {
          id: '2',
          title: '限时折扣活动',
          imageUrl: '/images/banners/discount.jpg',
          linkType: 'category',
          linkValue: 'promotion',
          sortOrder: 2,
        },
      ],
      categories,
      recommendedItems: recommendedItems.map(item => this.toShopItemBriefDto(item)),
      newItems: newItems.map(item => this.toShopItemBriefDto(item)),
      hotItems: hotItems.map(item => this.toShopItemBriefDto(item)),
      limitedItems: limitedItems.map(item => this.toShopItemBriefDto(item)),
      todayDeals: todayDeals.map(item => this.toShopItemBriefDto(item)),
    };
  }

  /**
   * 获取商品列表
   */
  async getShopItems(
    query: ShopItemQueryDto,
    userLevel: number = 1,
  ): Promise<PaginatedResponseDto<ShopItemDto>> {
    const {
      page = 1,
      limit = 20,
      category,
      type,
      rarity,
      status = ItemStatus.ACTIVE,
      minPrice,
      maxPrice,
      search,
      isRecommended,
      isNew,
      isHot,
      isLimited,
      tags,
      sortBy = 'sortOrder',
      sortOrder = 'ASC',
      inStockOnly,
    } = query;

    const queryBuilder = this.shopItemRepository.createQueryBuilder('item');

    // 基础过滤条件
    queryBuilder.where('item.status = :status', { status });

    // 用户等级过滤
    queryBuilder.andWhere('item.minLevel <= :userLevel', { userLevel });

    // 应用过滤条件
    if (category) {
      queryBuilder.andWhere('item.category = :category', { category });
    }

    if (type) {
      queryBuilder.andWhere('item.type = :type', { type });
    }

    if (rarity) {
      queryBuilder.andWhere('item.rarity = :rarity', { rarity });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('item.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('item.price <= :maxPrice', { maxPrice });
    }

    if (search) {
      queryBuilder.andWhere(
        '(item.name ILIKE :search OR item.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (isRecommended !== undefined) {
      queryBuilder.andWhere('item.isRecommended = :isRecommended', { isRecommended });
    }

    if (isNew !== undefined) {
      queryBuilder.andWhere('item.isNew = :isNew', { isNew });
    }

    if (isHot !== undefined) {
      queryBuilder.andWhere('item.isHot = :isHot', { isHot });
    }

    if (isLimited !== undefined) {
      queryBuilder.andWhere('item.isLimited = :isLimited', { isLimited });
    }

    if (tags && tags.length > 0) {
      queryBuilder.andWhere('item.tags && :tags', { tags });
    }

    if (inStockOnly) {
      queryBuilder.andWhere('(item.stock = -1 OR item.stock > 0)');
    }

    // 排序
    queryBuilder.orderBy(`item.${sortBy}`, sortOrder);

    // 分页
    const [items, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // 增加查看次数
    await Promise.all(items.map(item => this.increaseViewCount(item.id)));

    const itemDtos = items.map(item => this.toShopItemDto(item, userLevel));

    return {
      data: itemDtos,
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
   * 获取商品详情
   */
  async getShopItemById(id: string, userLevel: number = 1): Promise<ShopItemDto> {
    const item = await this.shopItemRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('商品不存在');
    }

    // 增加查看次数
    await this.increaseViewCount(id);

    return this.toShopItemDto(item, userLevel);
  }

  /**
   * 购买商品
   */
  async purchaseItem(
    userId: string,
    purchaseDto: PurchaseItemDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<PurchaseResultDto> {
    const { itemId, quantity, paymentMethod = PaymentMethod.POINTS, couponCode, notes } = purchaseDto;

    // 检查用户是否存在
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 检查商品是否存在
    const item = await this.shopItemRepository.findOne({ where: { id: itemId } });
    if (!item) {
      throw new NotFoundException('商品不存在');
    }

    // 检查商品是否可购买
    if (!item.canPurchase(user.level)) {
      throw new BadRequestException('商品不可购买');
    }

    // 检查库存
    if (!item.isInStock() || (item.stock !== -1 && item.stock < quantity)) {
      throw new BadRequestException('库存不足');
    }

    // 检查购买限制
    if (item.purchaseLimit) {
      const canPurchase = await this.checkPurchaseLimit(userId, item, quantity);
      if (!canPurchase) {
        throw new BadRequestException('超出购买限制');
      }
    }

    // 计算价格
    const unitPrice = item.getCurrentPrice();
    const totalPrice = unitPrice * quantity;

    // 检查用户余额
    if (paymentMethod === PaymentMethod.POINTS && user.points < totalPrice) {
      throw new BadRequestException('积分不足');
    }

    // 生成交易ID
    const transactionId = this.generateTransactionId();

    // 解析设备信息
    const deviceType = this.parseDeviceType(userAgent);

    // 创建购买记录
    const purchase = this.purchaseRepository.create({
      userId,
      itemId,
      quantity,
      unitPrice,
      totalPrice,
      status: PurchaseStatus.PENDING,
      paymentMethod,
      source: PurchaseSource.SHOP,
      paymentDetails: {
        pointsUsed: paymentMethod === PaymentMethod.POINTS ? totalPrice : 0,
        originalPrice: item.price * quantity,
        finalPrice: totalPrice,
        discountApplied: (item.price - unitPrice) * quantity,
      },
      itemSnapshot: {
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category,
        type: item.type,
        rarity: item.rarity,
        imageUrl: item.imageUrl,
        effects: item.effects,
        attributes: item.attributes,
      },
      notes,
      ipAddress,
      userAgent,
      deviceType,
      transactionId,
    });

    try {
      // 开始事务处理
      const savedPurchase = await this.purchaseRepository.save(purchase);

      // 扣除用户积分
      if (paymentMethod === PaymentMethod.POINTS) {
        await this.usersService.addPoints(userId, -totalPrice);
      }

      // 减少商品库存
      if (item.stock !== -1) {
        item.reduceStock(quantity);
      }
      item.increaseSoldCount(quantity);
      await this.shopItemRepository.save(item);

      // 完成购买
      savedPurchase.complete();
      await this.purchaseRepository.save(savedPurchase);

      // 获取用户最新信息
      const updatedUser = await this.usersService.findById(userId);

      this.logger.log(`用户 ${userId} 购买商品 ${item.name} x${quantity}，消费 ${totalPrice} 积分`);

      return {
        success: true,
        message: '购买成功',
        purchaseId: savedPurchase.id,
        transactionId,
        paymentDetails: savedPurchase.paymentDetails,
        item: this.toShopItemBriefDto(item),
        quantity,
        totalPrice,
        remainingPoints: updatedUser?.points || 0,
        remainingCoins: 0, // 暂时不支持金币
      };
    } catch (error) {
      // 购买失败，标记订单状态
      purchase.fail(error.message);
      await this.purchaseRepository.save(purchase);
      
      this.logger.error(`购买失败: ${error.message}`, error.stack);
      throw new InternalServerErrorException('购买失败，请稍后重试');
    }
  }

  /**
   * 获取用户购买历史
   */
  async getPurchaseHistory(
    userId: string,
    query: PurchaseHistoryQueryDto,
  ): Promise<PaginatedResponseDto<PurchaseDto>> {
    const {
      page = 1,
      limit = 20,
      status,
      paymentMethod,
      source,
      itemType,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      thisMonthOnly,
      todayOnly,
    } = query;

    const queryBuilder = this.purchaseRepository
      .createQueryBuilder('purchase')
      .leftJoinAndSelect('purchase.item', 'item')
      .where('purchase.userId = :userId', { userId });

    // 应用过滤条件
    if (status) {
      queryBuilder.andWhere('purchase.status = :status', { status });
    }

    if (paymentMethod) {
      queryBuilder.andWhere('purchase.paymentMethod = :paymentMethod', { paymentMethod });
    }

    if (source) {
      queryBuilder.andWhere('purchase.source = :source', { source });
    }

    if (itemType) {
      queryBuilder.andWhere('item.type = :itemType', { itemType });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('purchase.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    if (minAmount !== undefined) {
      queryBuilder.andWhere('purchase.totalPrice >= :minAmount', { minAmount });
    }

    if (maxAmount !== undefined) {
      queryBuilder.andWhere('purchase.totalPrice <= :maxAmount', { maxAmount });
    }

    if (search) {
      queryBuilder.andWhere(
        '(item.name ILIKE :search OR purchase.notes ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (todayOnly) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      queryBuilder.andWhere('purchase.createdAt BETWEEN :today AND :tomorrow', {
        today,
        tomorrow,
      });
    } else if (thisMonthOnly) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      queryBuilder.andWhere('purchase.createdAt BETWEEN :startOfMonth AND :endOfMonth', {
        startOfMonth,
        endOfMonth,
      });
    }

    // 排序
    queryBuilder.orderBy(`purchase.${sortBy}`, sortOrder);

    // 分页
    const [purchases, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const purchaseDtos = purchases.map(purchase => this.toPurchaseDto(purchase));

    return {
      data: purchaseDtos,
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
   * 获取用户购买统计
   */
  async getPurchaseStats(userId: string): Promise<PurchaseStatsDto> {
    const purchases = await this.purchaseRepository.find({
      where: { userId, status: PurchaseStatus.COMPLETED },
      relations: ['item'],
      order: { createdAt: 'ASC' },
    });

    const totalPurchases = purchases.length;
    const totalSpent = purchases.reduce((sum, p) => sum + p.totalPrice, 0);
    const averageSpent = totalPurchases > 0 ? Math.round(totalSpent / totalPurchases) : 0;

    // 本月统计
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthPurchases = purchases.filter(p => p.createdAt >= startOfMonth);
    const thisMonthSpent = thisMonthPurchases.reduce((sum, p) => sum + p.totalPrice, 0);

    // 今天统计
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayPurchases = purchases.filter(p => p.isToday());
    const todaySpent = todayPurchases.reduce((sum, p) => sum + p.totalPrice, 0);

    // 最喜欢的商品类型
    const typeCount = new Map<string, number>();
    purchases.forEach(p => {
      if (p.itemSnapshot?.type) {
        const count = typeCount.get(p.itemSnapshot.type) || 0;
        typeCount.set(p.itemSnapshot.type, count + 1);
      }
    });
    const favoriteItemType = Array.from(typeCount.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';

    // 最近购买时间
    const lastPurchaseDate = purchases.length > 0 ? purchases[purchases.length - 1].createdAt : undefined;

    // 购买的商品种类数
    const uniqueItems = new Set(purchases.map(p => p.itemId));
    const uniqueItemsCount = uniqueItems.size;

    // 总节省金额
    const totalSaved = purchases.reduce((sum, p) => sum + p.getSavedAmount(), 0);

    // 月度统计
    const monthlyStats = this.calculateMonthlyPurchaseStats(purchases);

    // 类型统计
    const typeStats = this.calculateTypePurchaseStats(purchases);

    return {
      totalPurchases,
      totalSpent,
      averageSpent,
      thisMonthPurchases: thisMonthPurchases.length,
      thisMonthSpent,
      todayPurchases: todayPurchases.length,
      todaySpent,
      favoriteItemType,
      lastPurchaseDate,
      uniqueItemsCount,
      totalSaved,
      monthlyStats,
      typeStats,
    };
  }

  /**
   * 申请退款
   */
  async requestRefund(
    userId: string,
    refundDto: RefundRequestDto,
  ): Promise<RefundResultDto> {
    const { purchaseId, reason, description } = refundDto;

    const purchase = await this.purchaseRepository.findOne({
      where: { id: purchaseId, userId },
      relations: ['item'],
    });

    if (!purchase) {
      throw new NotFoundException('购买记录不存在');
    }

    if (!purchase.canRefund()) {
      throw new BadRequestException('该订单不支持退款');
    }

    try {
      // 退还积分
      if (purchase.paymentMethod === PaymentMethod.POINTS) {
        await this.usersService.addPoints(userId, purchase.totalPrice);
      }

      // 恢复库存
      if (purchase.item && purchase.item.stock !== -1) {
        purchase.item.stock += purchase.quantity;
        purchase.item.soldCount = Math.max(0, purchase.item.soldCount - purchase.quantity);
        await this.shopItemRepository.save(purchase.item);
      }

      // 更新购买记录
      purchase.refund(`${reason}: ${description || ''}`);
      await this.purchaseRepository.save(purchase);

      this.logger.log(`用户 ${userId} 退款成功，订单 ${purchaseId}，金额 ${purchase.totalPrice}`);

      return {
        success: true,
        message: '退款成功',
        refundAmount: purchase.totalPrice,
        refundMethod: purchase.getPaymentMethodDisplayName(),
        estimatedArrivalTime: '即时到账',
      };
    } catch (error) {
      this.logger.error(`退款失败: ${error.message}`, error.stack);
      throw new InternalServerErrorException('退款失败，请稍后重试');
    }
  }

  /**
   * 获取搜索建议
   */
  async getSearchSuggestions(keyword: string): Promise<SearchSuggestionDto[]> {
    const suggestions: SearchSuggestionDto[] = [];

    if (keyword.length < 2) {
      return suggestions;
    }

    // 商品名称建议
    const items = await this.shopItemRepository
      .createQueryBuilder('item')
      .select(['item.name', 'COUNT(*) as count'])
      .where('item.name ILIKE :keyword', { keyword: `%${keyword}%` })
      .andWhere('item.status = :status', { status: ItemStatus.ACTIVE })
      .groupBy('item.name')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    items.forEach(item => {
      suggestions.push({
        keyword: item.item_name,
        type: 'item',
        count: parseInt(item.count),
        popularity: parseInt(item.count),
      });
    });

    // 分类建议
    const categories = await this.shopItemRepository
      .createQueryBuilder('item')
      .select(['item.category', 'COUNT(*) as count'])
      .where('item.category ILIKE :keyword', { keyword: `%${keyword}%` })
      .andWhere('item.status = :status', { status: ItemStatus.ACTIVE })
      .groupBy('item.category')
      .orderBy('count', 'DESC')
      .limit(3)
      .getRawMany();

    categories.forEach(category => {
      suggestions.push({
        keyword: category.item_category,
        type: 'category',
        count: parseInt(category.count),
        popularity: parseInt(category.count),
      });
    });

    return suggestions.sort((a, b) => b.popularity - a.popularity);
  }

  /**
   * 获取分类列表
   */
  private async getCategories(): Promise<ShopCategoryDto[]> {
    const categories = await this.shopItemRepository
      .createQueryBuilder('item')
      .select(['item.category', 'COUNT(*) as count'])
      .where('item.status = :status', { status: ItemStatus.ACTIVE })
      .groupBy('item.category')
      .orderBy('count', 'DESC')
      .getRawMany();

    const categoryDisplayNames = {
      food: '食物',
      toy: '玩具',
      medicine: '药品',
      decoration: '装饰品',
      special: '特殊物品',
      consumable: '消耗品',
    };

    return categories.map((category, index) => ({
      name: category.item_category,
      displayName: categoryDisplayNames[category.item_category] || category.item_category,
      icon: `/images/categories/${category.item_category}.png`,
      itemCount: parseInt(category.count),
      isHot: index < 3, // 前3个分类标记为热门
      sortOrder: index + 1,
    }));
  }

  /**
   * 根据条件获取商品
   */
  private async getItemsByCondition(
    conditions: any,
    limit: number,
  ): Promise<ShopItem[]> {
    return this.shopItemRepository.find({
      where: conditions,
      order: { soldCount: 'DESC', sortOrder: 'ASC' },
      take: limit,
    });
  }

  /**
   * 检查购买限制
   */
  private async checkPurchaseLimit(
    userId: string,
    item: ShopItem,
    quantity: number,
  ): Promise<boolean> {
    if (!item.purchaseLimit) {
      return true;
    }

    const { type, quantity: limitQuantity } = item.purchaseLimit;
    let startDate: Date;
    const now = new Date();

    switch (type) {
      case 'daily':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'total':
        startDate = new Date(0); // 从最开始计算
        break;
      default:
        return true;
    }

    const purchasedQuantity = await this.purchaseRepository
      .createQueryBuilder('purchase')
      .select('SUM(purchase.quantity)', 'total')
      .where('purchase.userId = :userId', { userId })
      .andWhere('purchase.itemId = :itemId', { itemId: item.id })
      .andWhere('purchase.status = :status', { status: PurchaseStatus.COMPLETED })
      .andWhere('purchase.createdAt >= :startDate', { startDate })
      .getRawOne();

    const totalPurchased = parseInt(purchasedQuantity?.total || '0');
    return totalPurchased + quantity <= limitQuantity;
  }

  /**
   * 增加商品查看次数
   */
  private async increaseViewCount(itemId: string): Promise<void> {
    await this.shopItemRepository.increment({ id: itemId }, 'viewCount', 1);
  }

  /**
   * 生成交易ID
   */
  private generateTransactionId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    return `TXN${timestamp}${random}`.toUpperCase();
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
   * 计算月度购买统计
   */
  private calculateMonthlyPurchaseStats(purchases: Purchase[]): PurchaseStatsDto['monthlyStats'] {
    const monthlyMap = new Map<string, { purchases: number; spent: number; saved: number }>();
    
    purchases.forEach(purchase => {
      const monthKey = `${purchase.createdAt.getFullYear()}-${String(purchase.createdAt.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { purchases: 0, spent: 0, saved: 0 });
      }
      
      const stats = monthlyMap.get(monthKey)!;
      stats.purchases++;
      stats.spent += purchase.totalPrice;
      stats.saved += purchase.getSavedAmount();
    });
    
    return Array.from(monthlyMap.entries())
      .map(([month, stats]) => ({ month, ...stats }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * 计算类型购买统计
   */
  private calculateTypePurchaseStats(purchases: Purchase[]): PurchaseStatsDto['typeStats'] {
    const typeMap = new Map<string, { purchases: number; spent: number }>();
    const totalPurchases = purchases.length;
    
    purchases.forEach(purchase => {
      const type = purchase.itemSnapshot?.type || 'unknown';
      
      if (!typeMap.has(type)) {
        typeMap.set(type, { purchases: 0, spent: 0 });
      }
      
      const stats = typeMap.get(type)!;
      stats.purchases++;
      stats.spent += purchase.totalPrice;
    });
    
    const typeDisplayNames = {
      food: '食物',
      toy: '玩具',
      medicine: '药品',
      decoration: '装饰品',
      special: '特殊物品',
      consumable: '消耗品',
    };
    
    return Array.from(typeMap.entries())
      .map(([type, stats]) => ({
        type,
        typeName: typeDisplayNames[type] || type,
        purchases: stats.purchases,
        spent: stats.spent,
        percentage: totalPurchases > 0 ? Math.round((stats.purchases / totalPurchases) * 100) : 0,
      }))
      .sort((a, b) => b.purchases - a.purchases);
  }

  /**
   * 转换为ShopItemDto
   */
  private toShopItemDto(item: ShopItem, userLevel: number = 1): ShopItemDto {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      type: item.type,
      rarity: item.rarity,
      status: item.status,
      price: item.price,
      originalPrice: item.originalPrice,
      currentPrice: item.getCurrentPrice(),
      imageUrl: item.imageUrl,
      images: item.images,
      effects: item.effects,
      attributes: item.attributes,
      stock: item.stock,
      soldCount: item.soldCount,
      viewCount: item.viewCount,
      rating: item.rating,
      reviewCount: item.reviewCount,
      purchaseLimit: item.purchaseLimit,
      discount: item.discount,
      isRecommended: item.isRecommended,
      isNew: item.isNew,
      isHot: item.isHot,
      isLimited: item.isLimited,
      minLevel: item.minLevel,
      tags: item.tags,
      usageInstructions: item.usageInstructions,
      rarityColor: item.getRarityColor(),
      rarityDisplayName: item.getRarityDisplayName(),
      typeDisplayName: item.getTypeDisplayName(),
      statusDisplayName: item.getStatusDisplayName(),
      primaryEffectDescription: item.getPrimaryEffectDescription(),
      isInStock: item.isInStock(),
      canPurchase: item.canPurchase(userLevel),
      discountPercentage: item.getDiscountPercentage(),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  /**
   * 转换为ShopItemBriefDto
   */
  private toShopItemBriefDto(item: ShopItem): ShopItemBriefDto {
    return {
      id: item.id,
      name: item.name,
      category: item.category,
      type: item.type,
      rarity: item.rarity,
      currentPrice: item.getCurrentPrice(),
      imageUrl: item.imageUrl,
      isInStock: item.isInStock(),
      isRecommended: item.isRecommended,
      isNew: item.isNew,
      isHot: item.isHot,
      rarityColor: item.getRarityColor(),
      primaryEffectDescription: item.getPrimaryEffectDescription(),
    };
  }

  /**
   * 转换为PurchaseDto
   */
  private toPurchaseDto(purchase: Purchase): PurchaseDto {
    return {
      id: purchase.id,
      userId: purchase.userId,
      itemId: purchase.itemId,
      quantity: purchase.quantity,
      unitPrice: purchase.unitPrice,
      totalPrice: purchase.totalPrice,
      status: purchase.status,
      paymentMethod: purchase.paymentMethod,
      source: purchase.source,
      paymentDetails: purchase.paymentDetails,
      itemSnapshot: purchase.itemSnapshot,
      completedAt: purchase.completedAt,
      cancelledAt: purchase.cancelledAt,
      refundedAt: purchase.refundedAt,
      notes: purchase.notes,
      failureReason: purchase.failureReason,
      transactionId: purchase.transactionId,
      statusDisplayName: purchase.getStatusDisplayName(),
      paymentMethodDisplayName: purchase.getPaymentMethodDisplayName(),
      sourceDisplayName: purchase.getSourceDisplayName(),
      savedAmount: purchase.getSavedAmount(),
      discountPercentage: purchase.getDiscountPercentage(),
      transactionSummary: purchase.getTransactionSummary(),
      canRefund: purchase.canRefund(),
      canCancel: purchase.canCancel(),
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt,
    };
  }
}