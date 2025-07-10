import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { JwtPayloadDto } from '../dto/auth.dto';

/**
 * JWT认证策略
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const secret = configService.get('app.jwt.secret');
    if (!secret) {
      throw new Error('JWT secret is not configured');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * 验证JWT载荷
   */
  async validate(payload: JwtPayloadDto) {
    // 根据用户ID查找用户
    const user = await this.usersService.findById(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 检查用户状态
    if (user.status !== 'active') {
      throw new UnauthorizedException('用户账户已被禁用');
    }

    // 返回用户信息，会被添加到request.user中
    return {
      id: user.id,
      openid: user.openid,
      nickname: user.nickname,
      avatar: user.avatar,
      points: user.points,
      level: user.level,
      status: user.status,
    };
  }
}