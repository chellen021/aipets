import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 当前用户装饰器
 * 用于在控制器方法中获取当前登录用户信息
 * 
 * @example
 * ```typescript
 * @Get('profile')
 * async getProfile(@User() user: any) {
 *   return user;
 * }
 * 
 * @Get('profile')
 * async getUserId(@User('id') userId: string) {
 *   return { userId };
 * }
 * ```
 */
export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);