import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 基础响应DTO
 */
export class BaseResponseDto<T = any> {
  @ApiProperty({ description: '状态码', example: 200 })
  code: number;

  @ApiProperty({ description: '响应消息', example: '操作成功' })
  message: string;

  @ApiProperty({ description: '响应数据' })
  data?: T;

  @ApiProperty({ description: '时间戳', example: 1640995200000 })
  timestamp: number;

  @ApiProperty({ description: '请求路径', example: '/api/v1/users/profile' })
  path?: string;

  constructor(code: number, message: string, data?: T, path?: string) {
    this.code = code;
    this.message = message;
    this.data = data;
    this.timestamp = Date.now();
    this.path = path;
  }

  /**
   * 成功响应
   */
  static success<T>(data?: T, message = '操作成功', path?: string): BaseResponseDto<T> {
    return new BaseResponseDto(200, message, data, path);
  }

  /**
   * 失败响应
   */
  static error(code: number, message: string, path?: string): BaseResponseDto {
    return new BaseResponseDto(code, message, null, path);
  }
}

/**
 * 分页信息
 */
export class PaginationInfo {
  @ApiProperty({ description: '当前页码', example: 1 })
  page: number;

  @ApiProperty({ description: '每页数量', example: 10 })
  limit: number;

  @ApiProperty({ description: '总数量', example: 100 })
  total: number;

  @ApiProperty({ description: '总页数', example: 10 })
  totalPages: number;

  @ApiProperty({ description: '是否有下一页', example: true })
  hasNext: boolean;

  @ApiProperty({ description: '是否有上一页', example: false })
  hasPrev: boolean;

  constructor(page: number, limit: number, total: number) {
    this.page = page;
    this.limit = limit;
    this.total = total;
    this.totalPages = Math.ceil(total / limit);
    this.hasNext = page < this.totalPages;
    this.hasPrev = page > 1;
  }
}

/**
 * 分页响应DTO
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({ description: '数据列表' })
  data: T[];

  @ApiProperty({ description: '分页信息', type: PaginationInfo })
  pagination: PaginationInfo;

  constructor(data: T[], pagination: PaginationInfo) {
    this.data = data;
    this.pagination = pagination;
  }
}

/**
 * 基础分页查询DTO
 */
export class BasePaginationDto {
  @ApiProperty({ description: '页码', example: 1, required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: '每页数量', example: 10, required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({ description: '排序字段', example: 'createdAt', required: false })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({ description: '排序方向', example: 'DESC', required: false, enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}