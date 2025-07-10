import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * 公开接口装饰器
 * 使用此装饰器标记的接口不需要JWT认证
 * 
 * @example
 * ```typescript
 * @Public()
 * @Get('login')
 * async login() {
 *   // 此接口不需要认证
 * }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);