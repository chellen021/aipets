import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ValidationPipe,
  UsePipes,
  Logger,
  Ip,
  Headers,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ShopService } from './shop.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
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
import { ItemType, ItemRarity, ItemStatus } from './entities/shop-item.entity';
import { PurchaseStatus, PaymentMethod, PurchaseSource } from './entities/purchase.entity';

@ApiTags('商店')
@Controller('shop')
@UseGuards(JwtAuthGuard)
export class ShopController {
  private readonly logger = new Logger(ShopController.name);

  constructor(private readonly shopService: ShopService) {}

  @Get('home')
  @Public()
  @ApiOperation({ summary: '获取商店首页数据' })
  @ApiResponse({ status: 200, description: '商店首页数据', type: ShopHomeDto })
  async getShopHome(): Promise<ShopHomeDto> {
    return this.shopService.getShopHome();
  }

  @Get('items')
  @Public()
  @ApiOperation({ summary: '获取商品列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 20 })
  @ApiQuery({ name: 'category', required: false, description: '商品分类', example: 'food' })
  @ApiQuery({ name: 'type', required: false, description: '商品类型', enum: ItemType })
  @ApiQuery({ name: 'rarity', required: false, description: '稀有度', enum: ItemRarity })
  @ApiQuery({ name: 'status', required: false, description: '状态', enum: ItemStatus })
  @ApiQuery({ name: 'minPrice', required: false, description: '最低价格', example: 10 })
  @ApiQuery({ name: 'maxPrice', required: false, description: '最高价格', example: 100 })
  @ApiQuery({ name: 'search', required: false, description: '搜索关键词', example: '食物' })
  @ApiQuery({ name: 'isRecommended', required: false, description: '是否推荐', example: true })
  @ApiQuery({ name: 'isNew', required: false, description: '是否新品', example: true })
  @ApiQuery({ name: 'isHot', required: false, description: '是否热门', example: true })
  @ApiQuery({ name: 'isLimited', required: false, description: '是否限量', example: true })
  @ApiQuery({ name: 'tags', required: false, description: '标签', example: ['healthy', 'delicious'] })
  @ApiQuery({ name: 'sortBy', required: false, description: '排序字段', example: 'price' })
  @ApiQuery({ name: 'sortOrder', required: false, description: '排序方向', example: 'ASC' })
  @ApiQuery({ name: 'inStockOnly', required: false, description: '仅显示有库存', example: true })
  @ApiResponse({ status: 200, description: '商品列表', type: PaginatedResponseDto<ShopItemDto> })
  async getShopItems(
    @Query(new ValidationPipe({ transform: true })) query: ShopItemQueryDto,
    @Request() req?: any,
  ): Promise<PaginatedResponseDto<ShopItemDto>> {
    const userLevel = req?.user?.level || 1;
    return this.shopService.getShopItems(query, userLevel);
  }

  @Get('items/:id')
  @Public()
  @ApiOperation({ summary: '获取商品详情' })
  @ApiResponse({ status: 200, description: '商品详情', type: ShopItemDto })
  @ApiResponse({ status: 404, description: '商品不存在' })
  async getShopItemById(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req?: any,
  ): Promise<ShopItemDto> {
    const userLevel = req?.user?.level || 1;
    return this.shopService.getShopItemById(id, userLevel);
  }

  @Post('purchase')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: '购买商品' })
  @ApiResponse({ status: 200, description: '购买成功', type: PurchaseResultDto })
  @ApiResponse({ status: 400, description: '购买失败' })
  @ApiResponse({ status: 404, description: '商品不存在' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async purchaseItem(
    @Request() req: any,
    @Body() purchaseDto: PurchaseItemDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<PurchaseResultDto> {
    const userId = req.user.id;
    this.logger.log(`用户 ${userId} 尝试购买商品: ${JSON.stringify(purchaseDto)}`);
    
    return this.shopService.purchaseItem(userId, purchaseDto, ipAddress, userAgent);
  }

  @Get('purchases')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取购买历史' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量', example: 20 })
  @ApiQuery({ name: 'status', required: false, description: '购买状态', enum: PurchaseStatus })
  @ApiQuery({ name: 'paymentMethod', required: false, description: '支付方式', enum: PaymentMethod })
  @ApiQuery({ name: 'source', required: false, description: '购买来源', enum: PurchaseSource })
  @ApiQuery({ name: 'itemType', required: false, description: '商品类型', enum: ItemType })
  @ApiQuery({ name: 'startDate', required: false, description: '开始日期', example: '2024-01-01' })
  @ApiQuery({ name: 'endDate', required: false, description: '结束日期', example: '2024-12-31' })
  @ApiQuery({ name: 'minAmount', required: false, description: '最小金额', example: 10 })
  @ApiQuery({ name: 'maxAmount', required: false, description: '最大金额', example: 100 })
  @ApiQuery({ name: 'search', required: false, description: '搜索关键词', example: '食物' })
  @ApiQuery({ name: 'sortBy', required: false, description: '排序字段', example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, description: '排序方向', example: 'DESC' })
  @ApiQuery({ name: 'thisMonthOnly', required: false, description: '仅本月', example: true })
  @ApiQuery({ name: 'todayOnly', required: false, description: '仅今天', example: true })
  @ApiResponse({ status: 200, description: '购买历史', type: PaginatedResponseDto<PurchaseDto> })
  async getPurchaseHistory(
    @Request() req: any,
    @Query(new ValidationPipe({ transform: true })) query: PurchaseHistoryQueryDto,
  ): Promise<PaginatedResponseDto<PurchaseDto>> {
    const userId = req.user.id;
    return this.shopService.getPurchaseHistory(userId, query);
  }

  @Get('purchases/stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取购买统计' })
  @ApiResponse({ status: 200, description: '购买统计', type: PurchaseStatsDto })
  async getPurchaseStats(@Request() req: any): Promise<PurchaseStatsDto> {
    const userId = req.user.id;
    return this.shopService.getPurchaseStats(userId);
  }

  @Post('refund')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: '申请退款' })
  @ApiResponse({ status: 200, description: '退款成功', type: RefundResultDto })
  @ApiResponse({ status: 400, description: '退款失败' })
  @ApiResponse({ status: 404, description: '购买记录不存在' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async requestRefund(
    @Request() req: any,
    @Body() refundDto: RefundRequestDto,
  ): Promise<RefundResultDto> {
    const userId = req.user.id;
    this.logger.log(`用户 ${userId} 申请退款: ${JSON.stringify(refundDto)}`);
    
    return this.shopService.requestRefund(userId, refundDto);
  }

  @Get('search/suggestions')
  @Public()
  @ApiOperation({ summary: '获取搜索建议' })
  @ApiQuery({ name: 'keyword', required: true, description: '搜索关键词', example: '食物' })
  @ApiResponse({ status: 200, description: '搜索建议', type: [SearchSuggestionDto] })
  async getSearchSuggestions(
    @Query('keyword') keyword: string,
  ): Promise<SearchSuggestionDto[]> {
    return this.shopService.getSearchSuggestions(keyword);
  }

  @Get('categories')
  @Public()
  @ApiOperation({ summary: '获取商品分类' })
  @ApiResponse({ status: 200, description: '商品分类列表', type: [ShopCategoryDto] })
  async getCategories(): Promise<ShopCategoryDto[]> {
    const shopHome = await this.shopService.getShopHome();
    return shopHome.categories;
  }

  @Get('featured/recommended')
  @Public()
  @ApiOperation({ summary: '获取推荐商品' })
  @ApiQuery({ name: 'limit', required: false, description: '数量限制', example: 8 })
  @ApiResponse({ status: 200, description: '推荐商品列表', type: [ShopItemBriefDto] })
  async getRecommendedItems(
    @Query('limit') limit: number = 8,
  ): Promise<ShopItemBriefDto[]> {
    const shopHome = await this.shopService.getShopHome();
    return shopHome.recommendedItems.slice(0, limit);
  }

  @Get('featured/new')
  @Public()
  @ApiOperation({ summary: '获取新品' })
  @ApiQuery({ name: 'limit', required: false, description: '数量限制', example: 8 })
  @ApiResponse({ status: 200, description: '新品列表', type: [ShopItemBriefDto] })
  async getNewItems(
    @Query('limit') limit: number = 8,
  ): Promise<ShopItemBriefDto[]> {
    const shopHome = await this.shopService.getShopHome();
    return shopHome.newItems.slice(0, limit);
  }

  @Get('featured/hot')
  @Public()
  @ApiOperation({ summary: '获取热门商品' })
  @ApiQuery({ name: 'limit', required: false, description: '数量限制', example: 8 })
  @ApiResponse({ status: 200, description: '热门商品列表', type: [ShopItemBriefDto] })
  async getHotItems(
    @Query('limit') limit: number = 8,
  ): Promise<ShopItemBriefDto[]> {
    const shopHome = await this.shopService.getShopHome();
    return shopHome.hotItems.slice(0, limit);
  }

  @Get('featured/limited')
  @Public()
  @ApiOperation({ summary: '获取限量商品' })
  @ApiQuery({ name: 'limit', required: false, description: '数量限制', example: 6 })
  @ApiResponse({ status: 200, description: '限量商品列表', type: [ShopItemBriefDto] })
  async getLimitedItems(
    @Query('limit') limit: number = 6,
  ): Promise<ShopItemBriefDto[]> {
    const shopHome = await this.shopService.getShopHome();
    return shopHome.limitedItems.slice(0, limit);
  }

  @Get('featured/deals')
  @Public()
  @ApiOperation({ summary: '获取今日特价' })
  @ApiQuery({ name: 'limit', required: false, description: '数量限制', example: 6 })
  @ApiResponse({ status: 200, description: '今日特价列表', type: [ShopItemBriefDto] })
  async getTodayDeals(
    @Query('limit') limit: number = 6,
  ): Promise<ShopItemBriefDto[]> {
    const shopHome = await this.shopService.getShopHome();
    return shopHome.todayDeals.slice(0, limit);
  }

  @Get('purchases/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取购买详情' })
  @ApiResponse({ status: 200, description: '购买详情', type: PurchaseDto })
  @ApiResponse({ status: 404, description: '购买记录不存在' })
  async getPurchaseById(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PurchaseDto> {
    const userId = req.user.id;
    const purchases = await this.shopService.getPurchaseHistory(userId, {
      page: 1,
      limit: 1,
    });
    
    const purchase = purchases.data.find(p => p.id === id);
    if (!purchase) {
      throw new NotFoundException('购买记录不存在');
    }
    
    return purchase;
  }

  @Get('purchases/today/summary')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取今日购买摘要' })
  @ApiResponse({ 
    status: 200, 
    description: '今日购买摘要',
    schema: {
      type: 'object',
      properties: {
        todayPurchases: { type: 'number', description: '今日购买次数' },
        todaySpent: { type: 'number', description: '今日消费金额' },
        todaySaved: { type: 'number', description: '今日节省金额' },
        recentPurchases: {
          type: 'array',
          items: { $ref: '#/components/schemas/PurchaseDto' },
          description: '最近购买记录'
        }
      }
    }
  })
  async getTodayPurchaseSummary(@Request() req: any) {
    const userId = req.user.id;
    const stats = await this.shopService.getPurchaseStats(userId);
    const recentPurchases = await this.shopService.getPurchaseHistory(userId, {
      page: 1,
      limit: 5,
      todayOnly: true,
    });
    
    return {
      todayPurchases: stats.todayPurchases,
      todaySpent: stats.todaySpent,
      todaySaved: recentPurchases.data.reduce((sum, p) => sum + p.savedAmount, 0),
      recentPurchases: recentPurchases.data,
    };
  }

  @Get('analytics/popular')
  @Public()
  @ApiOperation({ summary: '获取热门商品分析' })
  @ApiQuery({ name: 'limit', required: false, description: '数量限制', example: 10 })
  @ApiQuery({ name: 'period', required: false, description: '时间周期', example: '7d' })
  @ApiResponse({ 
    status: 200, 
    description: '热门商品分析',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          item: { $ref: '#/components/schemas/ShopItemBriefDto' },
          soldCount: { type: 'number', description: '销售数量' },
          revenue: { type: 'number', description: '销售收入' },
          viewCount: { type: 'number', description: '查看次数' },
          conversionRate: { type: 'number', description: '转化率' }
        }
      }
    }
  })
  async getPopularItemsAnalytics(
    @Query('limit') limit: number = 10,
    @Query('period') period: string = '7d',
  ) {
    // 这里可以根据需要实现更复杂的分析逻辑
    const shopHome = await this.shopService.getShopHome();
    const hotItems = shopHome.hotItems.slice(0, limit);
    
    return hotItems.map(item => ({
      item,
      soldCount: Math.floor(Math.random() * 100) + 10, // 模拟数据
      revenue: Math.floor(Math.random() * 10000) + 1000,
      viewCount: Math.floor(Math.random() * 1000) + 100,
      conversionRate: Math.round((Math.random() * 20 + 5) * 100) / 100,
    }));
  }

  /**
   * 获取客户端IP地址
   */
  private getClientIp(req: any): string {
    return req.ip || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress || 
           req.headers['x-forwarded-for']?.split(',')[0] || 
           'unknown';
  }
}