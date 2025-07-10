import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  IsUUID,
  IsDateString,
  Min,
  Max,
  ValidateNested,
  IsObject,
  IsInt,
  IsPositive,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ItemType,
  ItemRarity,
  ItemStatus,
  PurchaseLimitType,
  ItemEffect,
  ItemAttributes,
  PurchaseLimit,
  DiscountInfo,
} from '../entities/shop-item.entity';
import {
  PurchaseStatus,
  PaymentMethod,
  PurchaseSource,
  PaymentDetails,
  ItemSnapshot,
} from '../entities/purchase.entity';
import { BasePaginationDto } from '../../common/dto/base-response.dto';

/**
 * 商品查询DTO
 */
export class ShopItemQueryDto extends BasePaginationDto {
  @ApiPropertyOptional({ description: '商品分类' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '商品类型', enum: ItemType })
  @IsOptional()
  @IsEnum(ItemType)
  type?: ItemType;

  @ApiPropertyOptional({ description: '稀有度', enum: ItemRarity })
  @IsOptional()
  @IsEnum(ItemRarity)
  rarity?: ItemRarity;

  @ApiPropertyOptional({ description: '状态', enum: ItemStatus })
  @IsOptional()
  @IsEnum(ItemStatus)
  status?: ItemStatus;

  @ApiPropertyOptional({ description: '最低价格' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: '最高价格' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: '是否推荐' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isRecommended?: boolean;

  @ApiPropertyOptional({ description: '是否新品' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isNew?: boolean;

  @ApiPropertyOptional({ description: '是否热门' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isHot?: boolean;

  @ApiPropertyOptional({ description: '是否限量' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isLimited?: boolean;

  @ApiPropertyOptional({ description: '标签' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];



  @ApiPropertyOptional({ description: '只显示有库存的商品' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  inStockOnly?: boolean;

  @ApiPropertyOptional({ description: '用户等级（用于过滤可购买商品）' })
  @IsOptional()
  @IsInt()
  @Min(1)
  userLevel?: number;
}

/**
 * 商品DTO
 */
export class ShopItemDto {
  @ApiProperty({ description: '商品ID' })
  id: string;

  @ApiProperty({ description: '商品名称' })
  name: string;

  @ApiProperty({ description: '商品描述' })
  description: string;

  @ApiProperty({ description: '商品分类' })
  category: string;

  @ApiProperty({ description: '商品类型', enum: ItemType })
  type: ItemType;

  @ApiProperty({ description: '稀有度', enum: ItemRarity })
  rarity: ItemRarity;

  @ApiProperty({ description: '状态', enum: ItemStatus })
  status: ItemStatus;

  @ApiProperty({ description: '价格' })
  price: number;

  @ApiProperty({ description: '原价' })
  originalPrice?: number;

  @ApiProperty({ description: '当前有效价格' })
  currentPrice: number;

  @ApiProperty({ description: '商品图片' })
  imageUrl?: string;

  @ApiProperty({ description: '商品图片列表' })
  images?: string[];

  @ApiProperty({ description: '商品效果' })
  effects?: ItemEffect[];

  @ApiProperty({ description: '商品属性' })
  attributes?: ItemAttributes;

  @ApiProperty({ description: '库存数量' })
  stock: number;

  @ApiProperty({ description: '销售数量' })
  soldCount: number;

  @ApiProperty({ description: '查看次数' })
  viewCount: number;

  @ApiProperty({ description: '评分' })
  rating: number;

  @ApiProperty({ description: '评价数量' })
  reviewCount: number;

  @ApiProperty({ description: '购买限制' })
  purchaseLimit?: PurchaseLimit;

  @ApiProperty({ description: '折扣信息' })
  discount?: DiscountInfo;

  @ApiProperty({ description: '是否推荐' })
  isRecommended: boolean;

  @ApiProperty({ description: '是否新品' })
  isNew: boolean;

  @ApiProperty({ description: '是否热门' })
  isHot: boolean;

  @ApiProperty({ description: '是否限量' })
  isLimited: boolean;

  @ApiProperty({ description: '最低等级要求' })
  minLevel: number;

  @ApiProperty({ description: '标签' })
  tags?: string[];

  @ApiProperty({ description: '使用说明' })
  usageInstructions?: string;

  @ApiProperty({ description: '稀有度颜色' })
  rarityColor: string;

  @ApiProperty({ description: '稀有度显示名称' })
  rarityDisplayName: string;

  @ApiProperty({ description: '类型显示名称' })
  typeDisplayName: string;

  @ApiProperty({ description: '状态显示名称' })
  statusDisplayName: string;

  @ApiProperty({ description: '主要效果描述' })
  primaryEffectDescription: string;

  @ApiProperty({ description: '是否有库存' })
  isInStock: boolean;

  @ApiProperty({ description: '是否可购买' })
  canPurchase: boolean;

  @ApiProperty({ description: '折扣百分比' })
  discountPercentage: number;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

/**
 * 商品简要信息DTO
 */
export class ShopItemBriefDto {
  @ApiProperty({ description: '商品ID' })
  id: string;

  @ApiProperty({ description: '商品名称' })
  name: string;

  @ApiProperty({ description: '商品分类' })
  category: string;

  @ApiProperty({ description: '商品类型', enum: ItemType })
  type: ItemType;

  @ApiProperty({ description: '稀有度', enum: ItemRarity })
  rarity: ItemRarity;

  @ApiProperty({ description: '当前有效价格' })
  currentPrice: number;

  @ApiProperty({ description: '商品图片' })
  imageUrl?: string;

  @ApiProperty({ description: '是否有库存' })
  isInStock: boolean;

  @ApiProperty({ description: '是否推荐' })
  isRecommended: boolean;

  @ApiProperty({ description: '是否新品' })
  isNew: boolean;

  @ApiProperty({ description: '是否热门' })
  isHot: boolean;

  @ApiProperty({ description: '稀有度颜色' })
  rarityColor: string;

  @ApiProperty({ description: '主要效果描述' })
  primaryEffectDescription: string;
}

/**
 * 购买请求DTO
 */
export class PurchaseItemDto {
  @ApiProperty({ description: '商品ID' })
  @IsUUID()
  itemId: string;

  @ApiProperty({ description: '购买数量', default: 1 })
  @IsInt()
  @Min(1)
  @Max(99)
  quantity: number = 1;

  @ApiPropertyOptional({ description: '支付方式', enum: PaymentMethod, default: PaymentMethod.POINTS })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod = PaymentMethod.POINTS;

  @ApiPropertyOptional({ description: '优惠券代码' })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * 购买结果DTO
 */
export class PurchaseResultDto {
  @ApiProperty({ description: '是否成功' })
  success: boolean;

  @ApiProperty({ description: '消息' })
  message: string;

  @ApiProperty({ description: '购买记录ID' })
  purchaseId?: string;

  @ApiProperty({ description: '交易ID' })
  transactionId?: string;

  @ApiProperty({ description: '支付详情' })
  paymentDetails?: PaymentDetails;

  @ApiProperty({ description: '商品信息' })
  item?: ShopItemBriefDto;

  @ApiProperty({ description: '购买数量' })
  quantity?: number;

  @ApiProperty({ description: '总价' })
  totalPrice?: number;

  @ApiProperty({ description: '用户剩余积分' })
  remainingPoints?: number;

  @ApiProperty({ description: '用户剩余金币' })
  remainingCoins?: number;
}

/**
 * 购买记录DTO
 */
export class PurchaseDto {
  @ApiProperty({ description: '购买记录ID' })
  id: string;

  @ApiProperty({ description: '用户ID' })
  userId: string;

  @ApiProperty({ description: '商品ID' })
  itemId: string;

  @ApiProperty({ description: '购买数量' })
  quantity: number;

  @ApiProperty({ description: '单价' })
  unitPrice: number;

  @ApiProperty({ description: '总价' })
  totalPrice: number;

  @ApiProperty({ description: '状态', enum: PurchaseStatus })
  status: PurchaseStatus;

  @ApiProperty({ description: '支付方式', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: '购买来源', enum: PurchaseSource })
  source: PurchaseSource;

  @ApiProperty({ description: '支付详情' })
  paymentDetails?: PaymentDetails;

  @ApiProperty({ description: '商品快照' })
  itemSnapshot?: ItemSnapshot;

  @ApiProperty({ description: '完成时间' })
  completedAt?: Date;

  @ApiProperty({ description: '取消时间' })
  cancelledAt?: Date;

  @ApiProperty({ description: '退款时间' })
  refundedAt?: Date;

  @ApiProperty({ description: '备注' })
  notes?: string;

  @ApiProperty({ description: '失败原因' })
  failureReason?: string;

  @ApiProperty({ description: '交易ID' })
  transactionId?: string;

  @ApiProperty({ description: '状态显示名称' })
  statusDisplayName: string;

  @ApiProperty({ description: '支付方式显示名称' })
  paymentMethodDisplayName: string;

  @ApiProperty({ description: '购买来源显示名称' })
  sourceDisplayName: string;

  @ApiProperty({ description: '节省金额' })
  savedAmount: number;

  @ApiProperty({ description: '折扣百分比' })
  discountPercentage: number;

  @ApiProperty({ description: '交易摘要' })
  transactionSummary: string;

  @ApiProperty({ description: '是否可退款' })
  canRefund: boolean;

  @ApiProperty({ description: '是否可取消' })
  canCancel: boolean;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

/**
 * 购买历史查询DTO
 */
export class PurchaseHistoryQueryDto extends BasePaginationDto {
  @ApiPropertyOptional({ description: '状态', enum: PurchaseStatus })
  @IsOptional()
  @IsEnum(PurchaseStatus)
  status?: PurchaseStatus;

  @ApiPropertyOptional({ description: '支付方式', enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ description: '购买来源', enum: PurchaseSource })
  @IsOptional()
  @IsEnum(PurchaseSource)
  source?: PurchaseSource;

  @ApiPropertyOptional({ description: '商品类型', enum: ItemType })
  @IsOptional()
  @IsEnum(ItemType)
  itemType?: ItemType;

  @ApiPropertyOptional({ description: '开始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '最低金额' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({ description: '最高金额' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @ApiPropertyOptional({ description: '搜索关键词（商品名称）' })
  @IsOptional()
  @IsString()
  search?: string;



  @ApiPropertyOptional({ description: '只显示本月购买' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  thisMonthOnly?: boolean;

  @ApiPropertyOptional({ description: '只显示今天购买' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  todayOnly?: boolean;
}

/**
 * 购买统计DTO
 */
export class PurchaseStatsDto {
  @ApiProperty({ description: '总购买次数' })
  totalPurchases: number;

  @ApiProperty({ description: '总消费金额' })
  totalSpent: number;

  @ApiProperty({ description: '平均单次消费' })
  averageSpent: number;

  @ApiProperty({ description: '本月购买次数' })
  thisMonthPurchases: number;

  @ApiProperty({ description: '本月消费金额' })
  thisMonthSpent: number;

  @ApiProperty({ description: '今天购买次数' })
  todayPurchases: number;

  @ApiProperty({ description: '今天消费金额' })
  todaySpent: number;

  @ApiProperty({ description: '最喜欢的商品类型' })
  favoriteItemType: string;

  @ApiProperty({ description: '最近购买时间' })
  lastPurchaseDate?: Date;

  @ApiProperty({ description: '购买的商品种类数' })
  uniqueItemsCount: number;

  @ApiProperty({ description: '总节省金额' })
  totalSaved: number;

  @ApiProperty({ description: '月度统计' })
  monthlyStats: {
    month: string;
    purchases: number;
    spent: number;
    saved: number;
  }[];

  @ApiProperty({ description: '类型统计' })
  typeStats: {
    type: string;
    typeName: string;
    purchases: number;
    spent: number;
    percentage: number;
  }[];
}

/**
 * 商店分类DTO
 */
export class ShopCategoryDto {
  @ApiProperty({ description: '分类名称' })
  name: string;

  @ApiProperty({ description: '分类显示名称' })
  displayName: string;

  @ApiProperty({ description: '分类图标' })
  icon?: string;

  @ApiProperty({ description: '商品数量' })
  itemCount: number;

  @ApiProperty({ description: '是否热门' })
  isHot: boolean;

  @ApiProperty({ description: '排序权重' })
  sortOrder: number;
}

/**
 * 商店首页数据DTO
 */
export class ShopHomeDto {
  @ApiProperty({ description: '轮播图' })
  banners: {
    id: string;
    title: string;
    imageUrl: string;
    linkType: 'item' | 'category' | 'url';
    linkValue: string;
    sortOrder: number;
  }[];

  @ApiProperty({ description: '分类列表' })
  categories: ShopCategoryDto[];

  @ApiProperty({ description: '推荐商品' })
  recommendedItems: ShopItemBriefDto[];

  @ApiProperty({ description: '新品上架' })
  newItems: ShopItemBriefDto[];

  @ApiProperty({ description: '热门商品' })
  hotItems: ShopItemBriefDto[];

  @ApiProperty({ description: '限量商品' })
  limitedItems: ShopItemBriefDto[];

  @ApiProperty({ description: '今日特价' })
  todayDeals: ShopItemBriefDto[];
}

/**
 * 商品搜索建议DTO
 */
export class SearchSuggestionDto {
  @ApiProperty({ description: '搜索关键词' })
  keyword: string;

  @ApiProperty({ description: '搜索类型' })
  type: 'item' | 'category' | 'tag';

  @ApiProperty({ description: '匹配数量' })
  count: number;

  @ApiProperty({ description: '热度' })
  popularity: number;
}

/**
 * 退款请求DTO
 */
export class RefundRequestDto {
  @ApiProperty({ description: '购买记录ID' })
  @IsUUID()
  purchaseId: string;

  @ApiProperty({ description: '退款原因' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ description: '详细说明' })
  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * 退款结果DTO
 */
export class RefundResultDto {
  @ApiProperty({ description: '是否成功' })
  success: boolean;

  @ApiProperty({ description: '消息' })
  message: string;

  @ApiProperty({ description: '退款金额' })
  refundAmount?: number;

  @ApiProperty({ description: '退款方式' })
  refundMethod?: string;

  @ApiProperty({ description: '预计到账时间' })
  estimatedArrivalTime?: string;
}