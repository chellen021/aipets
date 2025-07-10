import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ShopItem } from './shop-item.entity';

/**
 * 购买状态枚举
 */
export enum PurchaseStatus {
  PENDING = 'pending',     // 待处理
  COMPLETED = 'completed', // 已完成
  CANCELLED = 'cancelled', // 已取消
  REFUNDED = 'refunded',   // 已退款
  FAILED = 'failed',       // 失败
}

/**
 * 支付方式枚举
 */
export enum PaymentMethod {
  POINTS = 'points',       // 积分支付
  COINS = 'coins',         // 金币支付
  MIXED = 'mixed',         // 混合支付
}

/**
 * 购买来源枚举
 */
export enum PurchaseSource {
  SHOP = 'shop',           // 商店购买
  PROMOTION = 'promotion', // 促销活动
  GIFT = 'gift',           // 礼品
  REWARD = 'reward',       // 奖励
  ADMIN = 'admin',         // 管理员发放
}

/**
 * 支付详情接口
 */
export interface PaymentDetails {
  pointsUsed?: number;     // 使用的积分
  coinsUsed?: number;      // 使用的金币
  discountApplied?: number; // 应用的折扣
  originalPrice?: number;   // 原价
  finalPrice?: number;      // 最终价格
  couponCode?: string;      // 优惠券代码
  promotionId?: string;     // 促销活动ID
}

/**
 * 物品详情接口（购买时的快照）
 */
export interface ItemSnapshot {
  id: string;
  name: string;
  description?: string;
  category: string;
  type: string;
  rarity: string;
  imageUrl?: string;
  effects?: any[];
  attributes?: any;
}

@Entity('purchases')
@Index(['userId', 'status'])
@Index(['itemId', 'status'])
@Index(['createdAt', 'status'])
@Index(['source', 'status'])
export class Purchase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'uuid' })
  @Index()
  itemId: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number; // 单价

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number; // 总价

  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  @Index()
  status: PurchaseStatus;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'points',
  })
  @Index()
  paymentMethod: PaymentMethod;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'shop',
  })
  @Index()
  source: PurchaseSource;

  @Column({ type: 'json', nullable: true })
  paymentDetails: PaymentDetails;

  @Column({ type: 'json', nullable: true })
  itemSnapshot: ItemSnapshot; // 购买时的物品信息快照

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date; // 完成时间

  @Column({ type: 'datetime', nullable: true })
  cancelledAt: Date; // 取消时间

  @Column({ type: 'datetime', nullable: true })
  refundedAt: Date; // 退款时间

  @Column({ type: 'text', nullable: true })
  notes: string; // 备注

  @Column({ type: 'text', nullable: true })
  failureReason: string; // 失败原因

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string; // IP地址

  @Column({ type: 'text', nullable: true })
  userAgent: string; // 用户代理

  @Column({ type: 'varchar', length: 20, nullable: true })
  deviceType: string; // 设备类型

  @Column({ type: 'varchar', length: 100, nullable: true })
  transactionId: string; // 交易ID

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>; // 额外元数据

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 关联关系
  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => ShopItem, { eager: false })
  @JoinColumn({ name: 'itemId' })
  item: ShopItem;

  /**
   * 完成购买
   */
  complete(): void {
    this.status = PurchaseStatus.COMPLETED;
    this.completedAt = new Date();
  }

  /**
   * 取消购买
   */
  cancel(reason?: string): void {
    this.status = PurchaseStatus.CANCELLED;
    this.cancelledAt = new Date();
    if (reason) {
      this.notes = reason;
    }
  }

  /**
   * 退款
   */
  refund(reason?: string): void {
    this.status = PurchaseStatus.REFUNDED;
    this.refundedAt = new Date();
    if (reason) {
      this.notes = reason;
    }
  }

  /**
   * 标记为失败
   */
  fail(reason: string): void {
    this.status = PurchaseStatus.FAILED;
    this.failureReason = reason;
  }

  /**
   * 检查是否可以退款
   */
  canRefund(): boolean {
    return (
      this.status === PurchaseStatus.COMPLETED &&
      this.completedAt &&
      Date.now() - this.completedAt.getTime() <= 24 * 60 * 60 * 1000 // 24小时内
    );
  }

  /**
   * 检查是否可以取消
   */
  canCancel(): boolean {
    return this.status === PurchaseStatus.PENDING;
  }

  /**
   * 获取状态显示名称
   */
  getStatusDisplayName(): string {
    const names = {
      [PurchaseStatus.PENDING]: '待处理',
      [PurchaseStatus.COMPLETED]: '已完成',
      [PurchaseStatus.CANCELLED]: '已取消',
      [PurchaseStatus.REFUNDED]: '已退款',
      [PurchaseStatus.FAILED]: '失败',
    };
    return names[this.status] || names[PurchaseStatus.PENDING];
  }

  /**
   * 获取支付方式显示名称
   */
  getPaymentMethodDisplayName(): string {
    const names = {
      [PaymentMethod.POINTS]: '积分支付',
      [PaymentMethod.COINS]: '金币支付',
      [PaymentMethod.MIXED]: '混合支付',
    };
    return names[this.paymentMethod] || names[PaymentMethod.POINTS];
  }

  /**
   * 获取购买来源显示名称
   */
  getSourceDisplayName(): string {
    const names = {
      [PurchaseSource.SHOP]: '商店购买',
      [PurchaseSource.PROMOTION]: '促销活动',
      [PurchaseSource.GIFT]: '礼品',
      [PurchaseSource.REWARD]: '奖励',
      [PurchaseSource.ADMIN]: '管理员发放',
    };
    return names[this.source] || names[PurchaseSource.SHOP];
  }

  /**
   * 计算节省的金额
   */
  getSavedAmount(): number {
    if (!this.paymentDetails?.originalPrice) {
      return 0;
    }
    return this.paymentDetails.originalPrice - this.totalPrice;
  }

  /**
   * 获取折扣百分比
   */
  getDiscountPercentage(): number {
    const savedAmount = this.getSavedAmount();
    if (savedAmount <= 0 || !this.paymentDetails?.originalPrice) {
      return 0;
    }
    return Math.round((savedAmount / this.paymentDetails.originalPrice) * 100);
  }

  /**
   * 检查是否是今天的购买
   */
  isToday(): boolean {
    const today = new Date();
    const purchaseDate = new Date(this.createdAt);
    return (
      today.getFullYear() === purchaseDate.getFullYear() &&
      today.getMonth() === purchaseDate.getMonth() &&
      today.getDate() === purchaseDate.getDate()
    );
  }

  /**
   * 检查是否是本周的购买
   */
  isThisWeek(): boolean {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    return this.createdAt >= startOfWeek;
  }

  /**
   * 检查是否是本月的购买
   */
  isThisMonth(): boolean {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return this.createdAt >= startOfMonth;
  }

  /**
   * 获取购买时长（分钟）
   */
  getPurchaseDurationMinutes(): number {
    if (!this.completedAt) {
      return 0;
    }
    return Math.floor((this.completedAt.getTime() - this.createdAt.getTime()) / (1000 * 60));
  }

  /**
   * 生成交易摘要
   */
  getTransactionSummary(): string {
    const itemName = this.itemSnapshot?.name || '未知商品';
    const quantity = this.quantity > 1 ? ` x${this.quantity}` : '';
    const price = this.totalPrice;
    const method = this.getPaymentMethodDisplayName();
    
    return `${itemName}${quantity} - ${price}积分 (${method})`;
  }
}