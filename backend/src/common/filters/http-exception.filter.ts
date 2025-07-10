import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseResponseDto } from '../dto/base-response.dto';

/**
 * 全局HTTP异常过滤器
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let details: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || responseObj.error || 'Unknown error';
        details = responseObj.details;
      } else {
        message = 'Unknown error';
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = '服务器内部错误';
      
      // 记录未知异常
      this.logger.error(
        `Unhandled exception: ${exception}`,
        exception instanceof Error ? exception.stack : undefined,
        'HttpExceptionFilter',
      );
    }

    // 记录异常信息
    this.logger.error(
      `HTTP Exception: ${status} - ${message}`,
      {
        url: request.url,
        method: request.method,
        ip: request.ip,
        userAgent: request.get('User-Agent'),
        body: request.body,
        query: request.query,
        params: request.params,
      },
      'HttpExceptionFilter',
    );

    // 构造响应数据
    const errorResponse = BaseResponseDto.error(
      status,
      message,
      request.url,
    );

    // 在开发环境下添加详细错误信息
    if (process.env.NODE_ENV === 'development' && details) {
      (errorResponse as any).details = details;
    }

    response.status(status).json(errorResponse);
  }
}