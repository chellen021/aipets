import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

/**
 * 日志拦截器 - 记录请求和响应信息
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const startTime = Date.now();

    // 记录请求信息
    this.logger.log(
      `Incoming Request: ${method} ${url} - ${ip} - ${userAgent}`,
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          const { statusCode } = response;

          // 记录响应信息
          this.logger.log(
            `Outgoing Response: ${method} ${url} - ${statusCode} - ${duration}ms`,
          );

          // 在开发环境下记录更详细的信息
          if (process.env.NODE_ENV === 'development') {
            this.logger.debug(`Request Body: ${JSON.stringify(request.body)}`);
            this.logger.debug(`Response Data: ${JSON.stringify(data)}`);
          }
        },
        error: (error) => {
          const endTime = Date.now();
          const duration = endTime - startTime;

          this.logger.error(
            `Request Error: ${method} ${url} - ${error.status || 500} - ${duration}ms`,
            error.stack,
          );
        },
      }),
    );
  }
}