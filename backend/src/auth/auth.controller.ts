import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  WechatLoginDto,
  LoginResponseDto,
  RefreshTokenDto,
  SessionCheckResponseDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { User } from '../common/decorators/user.decorator';
import { Request } from 'express';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 微信登录
   */
  @ApiOperation({ summary: '微信登录', description: '通过微信授权码进行用户登录' })
  @ApiResponse({ status: 200, description: '登录成功', type: LoginResponseDto })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 401, description: '微信授权失败' })
  @Public()
  @Post('wechat-login')
  @HttpCode(HttpStatus.OK)
  async wechatLogin(
    @Body() loginDto: WechatLoginDto,
    @Req() req: Request,
  ): Promise<LoginResponseDto> {
    const ipAddress = this.getClientIp(req);
    const userAgent = req.headers['user-agent'];
    
    return this.authService.wechatLogin(loginDto, ipAddress, userAgent);
  }

  /**
   * 刷新访问令牌
   */
  @ApiOperation({ summary: '刷新令牌', description: '使用刷新令牌获取新的访问令牌' })
  @ApiResponse({ status: 200, description: '刷新成功', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: '刷新令牌无效或已过期' })
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<LoginResponseDto> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  /**
   * 验证当前会话
   */
  @ApiOperation({ summary: '验证会话', description: '验证当前用户会话是否有效' })
  @ApiResponse({ status: 200, description: '会话验证结果', type: SessionCheckResponseDto })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('session')
  async checkSession(
    @User() user: any,
    @Headers('authorization') authorization: string,
  ): Promise<SessionCheckResponseDto> {
    // 提取token（去掉Bearer前缀）
    const token = authorization?.replace('Bearer ', '');
    
    if (!token) {
      return { valid: false };
    }
    
    const result = await this.authService.validateToken(token);
    
    return {
      valid: result.valid,
      user: result.user,
      expiresIn: result.expiresIn,
    };
  }

  /**
   * 登出（客户端处理，服务端记录）
   */
  @ApiOperation({ summary: '用户登出', description: '用户登出系统' })
  @ApiResponse({ status: 200, description: '登出成功' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@User() user: any): Promise<{ message: string }> {
    // 这里可以添加登出日志记录
    // 实际的token失效由客户端处理（删除本地存储的token）
    return { message: '登出成功' };
  }

  /**
   * 获取客户端IP地址
   */
  private getClientIp(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (req.headers['x-real-ip'] as string) ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      '127.0.0.1'
    );
  }
}