import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * 微信登录请求DTO
 */
export class WechatLoginDto {
  @ApiProperty({ description: '微信登录凭证code' })
  @IsString({ message: 'code必须是字符串' })
  @IsNotEmpty({ message: 'code不能为空' })
  code: string;

  @ApiProperty({ description: '用户昵称', required: false })
  @IsOptional()
  @IsString({ message: '昵称必须是字符串' })
  nickname?: string;

  @ApiProperty({ description: '用户头像URL', required: false })
  @IsOptional()
  @IsString({ message: '头像URL必须是字符串' })
  avatar?: string;

  @ApiProperty({ description: '性别', enum: ['male', 'female', 'unknown'], required: false })
  @IsOptional()
  @IsString({ message: '性别必须是字符串' })
  gender?: 'male' | 'female' | 'unknown';
}

/**
 * 登录响应DTO
 */
export class LoginResponseDto {
  @ApiProperty({ description: '访问令牌' })
  accessToken: string;

  @ApiProperty({ description: '刷新令牌' })
  refreshToken: string;

  @ApiProperty({ description: '令牌类型', example: 'Bearer' })
  tokenType: string;

  @ApiProperty({ description: '访问令牌过期时间（秒）' })
  expiresIn: number;

  @ApiProperty({ description: '用户信息' })
  user: {
    id: string;
    nickname: string;
    avatar?: string;
    points: number;
    level: number;
  };

  @ApiProperty({ description: '是否为新用户' })
  isNewUser: boolean;
}

/**
 * 刷新令牌请求DTO
 */
export class RefreshTokenDto {
  @ApiProperty({ description: '刷新令牌' })
  @IsString({ message: '刷新令牌必须是字符串' })
  @IsNotEmpty({ message: '刷新令牌不能为空' })
  refreshToken: string;
}

/**
 * 会话检查响应DTO
 */
export class SessionCheckResponseDto {
  @ApiProperty({ description: '会话是否有效' })
  valid: boolean;

  @ApiProperty({ description: '用户信息', required: false })
  user?: {
    id: string;
    nickname: string;
    avatar?: string;
    points: number;
    level: number;
  };

  @ApiProperty({ description: '令牌剩余有效时间（秒）', required: false })
  expiresIn?: number;
}

/**
 * JWT载荷DTO
 */
export class JwtPayloadDto {
  @ApiProperty({ description: '用户ID' })
  sub: string; // subject

  @ApiProperty({ description: '微信OpenID' })
  openid: string;

  @ApiProperty({ description: '用户昵称' })
  nickname: string;

  @ApiProperty({ description: '签发时间' })
  iat: number; // issued at

  @ApiProperty({ description: '过期时间' })
  exp: number; // expiration time
}