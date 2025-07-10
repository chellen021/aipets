import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { BaseResponseDto } from '../dto/base-response.dto';

/**
 * 响应拦截器 - 统一响应格式
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, BaseResponseDto<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<BaseResponseDto<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    
    return next.handle().pipe(
      map((data) => {
        // 如果数据已经是BaseResponseDto格式，直接返回
        if (data instanceof BaseResponseDto) {
          return data;
        }

        // 否则包装成统一格式
        return BaseResponseDto.success(data, '操作成功', request.url);
      }),
    );
  }
}