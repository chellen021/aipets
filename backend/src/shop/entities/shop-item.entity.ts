import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 商品类型枚举
 */
export enum ItemType {
  FOOD = 'food',           // 食物
  TOY = 'toy',             // 玩具
  MEDICINE = 'medicine',   // 药品
  DECORATION = 'decoration', // 装饰品
  SPECIAL = 'special',     // 特殊物品
  CONSUMABLE = 'consumable', // 消耗品
}

/**
 * 商品稀有度枚举
 */
export enum ItemRarity {
  COMMON = 'common',       // 普通
  UNCOMMON = 'uncommon',   // 不常见
  RARE = 'rare',           // 稀有
  EPIC = 'epic',           // 史诗
  LEGENDARY = 'legendary', // 传说
}

/**
 * 商品状态枚举
 */
export enum ItemStatus {
  ACTIVE = 'active',       // 上架
  INACTIVE = 'inactive',   // 下架
  OUT_OF_STOCK = 'out_of_stock', // 缺货
  COMING_SOON = 'coming_soon',   // 即将上架
}

/**
 * 购买限制类型枚举
 */
export enum PurchaseLimitType {
  NONE = 'none',           // 无限制
  DAILY = 'daily',         // 每日限制
  WEEKLY = 'weekly',       // 每周限制
  MONTHLY = 'monthly',     // 每月限制
  TOTAL = 'total',         // 总计限制
}

/**
 * 商品效果接口
 */
export interface ItemEffect {
  type: 'health' | 'happiness' | 'energy' | 'hunger' | 'experience' | 'special';
  value: number;
  duration?: number; // 持续时间（分钟）
  description?: string;
}

/**
 * 商品属性接口
 */
export interface ItemAttributes {
  weight?: number;         // 重量
  size?: string;          // 尺寸
  color?: string;         // 颜色
  material?: string;      // 材质
  brand?: string;         // 品牌
  origin?: string;        // 产地
  shelfLife?: number;     // 保质期（天）
  nutritionValue?: number; // 营养价值
  funValue?: number;      // 娱乐价值
  durability?: number;    // 耐久度
  [key: string]: any;     // 其他自定义属性
}

/**
 * 购买限制接口
 */
export interface PurchaseLimit {
  type: PurchaseLimitType;
  quantity: number;
  resetTime?: string; // 重置时间（如每日00:00）
}

/**
 * 折扣信息接口
 */
export interface DiscountInfo {
  type: 'percentage' | 'fixed';
  value: number;
  startDate?: Date;
  endDate?: Date;
  minQuantity?: number;
  maxDiscount?: number;
  description?: string;
}

@Entity('shop_items')
@Index(['category', 'status'])
@Index(['type', 'rarity'])
@Index(['price', 'status'])
@Index(['isRecommended', 'status'])
export class ShopItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  @Index()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 50 })
  @Index()
  category: string; // 商品分类

  @Column({
    type: 'varchar',
    length: 20,
    default: 'consumable',
  })
  @Index()
  type: ItemType;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'common',
  })
  @Index()
  rarity: ItemRarity;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'active',
  })
  @Index()
  status: ItemStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @Index()
  price: number; // 积分价格

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  originalPrice: number; // 原价

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({ type: 'json', nullable: true })
  images: string[]; // 多张图片

  @Column({ type: 'json', nullable: true })
  effects: ItemEffect[]; // 商品效果

  @Column({ type: 'json', nullable: true })
  attributes: ItemAttributes; // 商品属性

  @Column({ type: 'int', default: -1 })
  stock: number; // 库存数量，-1表示无限

  @Column({ type: 'int', default: 0 })
  @Index()
  soldCount: number; // 销售数量

  @Column({ type: 'int', default: 0 })
  @Index()
  viewCount: number; // 查看次数

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  @Index()
  rating: number; // 评分

  @Column({ type: 'int', default: 0 })
  reviewCount: number; // 评价数量

  @Column({ type: 'json', nullable: true })
  purchaseLimit: PurchaseLimit; // 购买限制

  @Column({ type: 'json', nullable: true })
  discount: DiscountInfo; // 折扣信息

  @Column({ type: 'int', default: 0 })
  @Index()
  sortOrder: number; // 排序权重

  @Column({ type: 'boolean', default: false })
  @Index()
  isRecommended: boolean; // 是否推荐

  @Column({ type: 'boolean', default: false })
  @Index()
  isNew: boolean; // 是否新品

  @Column({ type: 'boolean', default: false })
  @Index()
  isHot: boolean; // 是否热门

  @Column({ type: 'boolean', default: false })
  @Index()
  isLimited: boolean; // 是否限量

  @Column({ type: 'datetime', nullable: true })
  availableFrom: Date; // 上架时间

  @Column({ type: 'datetime', nullable: true })
  availableTo: Date; // 下架时间

  @Column({ type: 'int', default: 1 })
  minLevel: number; // 最低等级要求

  @Column({ type: 'json', nullable: true })
  tags: string[]; // 标签

  @Column({ type: 'text', nullable: true })
  usageInstructions: string; // 使用说明

  @Column({ type: 'text', nullable: true })
  notes: string; // 备注

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * 获取当前有效价格
   */
  getCurrentPrice(): number {
    if (!this.discount || !this.isDiscountValid()) {
      return this.price;
    }

    if (this.discount.type === 'percentage') {
      const discountAmount = this.price * (this.discount.value / 100);
      const finalDiscount = this.discount.maxDiscount 
        ? Math.min(discountAmount, this.discount.maxDiscount)
        : discountAmount;
      return Math.max(0, this.price - finalDiscount);
    } else {
      return Math.max(0, this.price - this.discount.value);
    }
  }

  /**
   * 检查折扣是否有效
   */
  isDiscountValid(): boolean {
    if (!this.discount) return false;

    const now = new Date();
    if (this.discount.startDate && now < this.discount.startDate) {
      return false;
    }
    if (this.discount.endDate && now > this.discount.endDate) {
      return false;
    }

    return true;
  }

  /**
   * 获取折扣百分比
   */
  getDiscountPercentage(): number {
    if (!this.discount || !this.isDiscountValid()) {
      return 0;
    }

    const currentPrice = this.getCurrentPrice();
    return Math.round(((this.price - currentPrice) / this.price) * 100);
  }

  /**
   * 检查是否有库存
   */
  isInStock(): boolean {
    return this.stock === -1 || this.stock > 0;
  }

  /**
   * 检查是否可购买
   */
  canPurchase(userLevel: number = 1): boolean {
    return (
      this.status === ItemStatus.ACTIVE &&
      this.isInStock() &&
      userLevel >= this.minLevel &&
      this.isAvailable()
    );
  }

  /**
   * 检查是否在可用时间范围内
   */
  isAvailable(): boolean {
    const now = new Date();
    if (this.availableFrom && now < this.availableFrom) {
      return false;
    }
    if (this.availableTo && now > this.availableTo) {
      return false;
    }
    return true;
  }

  /**
   * 获取稀有度颜色
   */
  getRarityColor(): string {
    const colors = {
      [ItemRarity.COMMON]: '#9CA3AF',
      [ItemRarity.UNCOMMON]: '#10B981',
      [ItemRarity.RARE]: '#3B82F6',
      [ItemRarity.EPIC]: '#8B5CF6',
      [ItemRarity.LEGENDARY]: '#F59E0B',
    };
    return colors[this.rarity] || colors[ItemRarity.COMMON];
  }

  /**
   * 获取稀有度显示名称
   */
  getRarityDisplayName(): string {
    const names = {
      [ItemRarity.COMMON]: '普通',
      [ItemRarity.UNCOMMON]: '不常见',
      [ItemRarity.RARE]: '稀有',
      [ItemRarity.EPIC]: '史诗',
      [ItemRarity.LEGENDARY]: '传说',
    };
    return names[this.rarity] || names[ItemRarity.COMMON];
  }

  /**
   * 获取类型显示名称
   */
  getTypeDisplayName(): string {
    const names = {
      [ItemType.FOOD]: '食物',
      [ItemType.TOY]: '玩具',
      [ItemType.MEDICINE]: '药品',
      [ItemType.DECORATION]: '装饰品',
      [ItemType.SPECIAL]: '特殊物品',
      [ItemType.CONSUMABLE]: '消耗品',
    };
    return names[this.type] || names[ItemType.CONSUMABLE];
  }

  /**
   * 获取状态显示名称
   */
  getStatusDisplayName(): string {
    const names = {
      [ItemStatus.ACTIVE]: '上架中',
      [ItemStatus.INACTIVE]: '已下架',
      [ItemStatus.OUT_OF_STOCK]: '缺货',
      [ItemStatus.COMING_SOON]: '即将上架',
    };
    return names[this.status] || names[ItemStatus.ACTIVE];
  }

  /**
   * 获取主要效果描述
   */
  getPrimaryEffectDescription(): string {
    if (!this.effects || this.effects.length === 0) {
      return '无特殊效果';
    }

    const primaryEffect = this.effects[0];
    const effectNames = {
      health: '健康',
      happiness: '快乐',
      energy: '精力',
      hunger: '饥饿',
      experience: '经验',
      special: '特殊',
    };

    const effectName = effectNames[primaryEffect.type] || primaryEffect.type;
    const sign = primaryEffect.value > 0 ? '+' : '';
    return `${effectName} ${sign}${primaryEffect.value}`;
  }

  /**
   * 减少库存
   */
  reduceStock(quantity: number = 1): boolean {
    if (this.stock === -1) {
      return true; // 无限库存
    }

    if (this.stock >= quantity) {
      this.stock -= quantity;
      return true;
    }

    return false;
  }

  /**
   * 增加销售数量
   */
  increaseSoldCount(quantity: number = 1): void {
    this.soldCount += quantity;
  }

  /**
   * 增加查看次数
   */
  increaseViewCount(): void {
    this.viewCount += 1;
  }

  /**
   * 更新评分
   */
  updateRating(newRating: number): void {
    const totalRating = this.rating * this.reviewCount + newRating;
    this.reviewCount += 1;
    this.rating = Math.round((totalRating / this.reviewCount) * 100) / 100;
  }
}