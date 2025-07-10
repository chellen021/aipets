import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { WechatLoginDto, LoginResponseDto, JwtPayloadDto } from './dto/auth.dto';
import { User } from '../users/entities/user.entity';
import axios from 'axios';

/**
 * 微信API响应接口
 */
interface WechatApiResponse {
  openid?: string;
  session_key?: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * 微信登录
   */
  async wechatLogin(
    loginDto: WechatLoginDto,
    ipAddress: string,
    userAgent?: string,
  ): Promise<LoginResponseDto> {
    try {
      // 1. 调用微信API获取用户信息
      const wechatUserInfo = await this.getWechatUserInfo(loginDto.code);
      
      // 2. 查找或创建用户
      if (!wechatUserInfo.openid) {
        throw new BadRequestException('获取微信用户openid失败');
      }
      
      let user = await this.usersService.findByOpenId(wechatUserInfo.openid!);
      let isNewUser = false;
      
      if (!user) {
        // 创建新用户
        user = await this.usersService.create({
          openid: wechatUserInfo.openid!,
          unionid: wechatUserInfo.unionid,
          nickname: loginDto.nickname || '微信用户',
          avatar: loginDto.avatar,
          gender: loginDto.gender || 'unknown',
        });
        isNewUser = true;
        this.logger.log(`新用户注册: ${user.id}`);
      } else {
        // 更新现有用户信息（如果提供了新信息）
        if (loginDto.nickname || loginDto.avatar || loginDto.gender) {
          await this.usersService.update(user.id, {
            nickname: loginDto.nickname || user.nickname,
            gender: loginDto.gender || user.gender,
          });
          
          if (loginDto.avatar) {
            await this.usersService.updateAvatar(user.id, loginDto.avatar);
          }
          
          // 重新获取更新后的用户信息
          const updatedUser = await this.usersService.findById(user.id);
          if (!updatedUser) {
            throw new UnauthorizedException('用户信息更新失败');
          }
          user = updatedUser;
        }
      }

      // 确保用户存在
      if (!user) {
        throw new UnauthorizedException('用户创建失败');
      }

      // 3. 记录登录日志
      await this.usersService.logLogin(user.id, ipAddress, userAgent, 'success');
      
      // 4. 更新最后登录信息
      await this.usersService.updateLastLogin(user.id, ipAddress);
      
      // 5. 生成JWT令牌
      const tokens = await this.generateTokens(user);
      
      return {
        ...tokens,
        user: {
          id: user.id,
          nickname: user.nickname || '',
          avatar: user.avatar || '',
          points: user.points || 0,
          level: user.level || 1,
        },
        isNewUser,
      };
    } catch (error) {
      this.logger.error(`微信登录失败: ${error.message}`, error.stack);
      
      // 记录失败日志
      if (error.openid) {
        const user = await this.usersService.findByOpenId(error.openid);
        if (user) {
          await this.usersService.logLogin(
            user.id,
            ipAddress,
            userAgent,
            'failed',
            error.message,
          );
        }
      }
      
      throw new UnauthorizedException('登录失败，请重试');
    }
  }

  /**
   * 刷新令牌
   */
  async refreshToken(refreshToken: string): Promise<LoginResponseDto> {
    try {
      // 验证刷新令牌
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('app.jwt.refreshSecret') || 'default-refresh-secret',
      });
      
      // 获取用户信息
      const user = await this.usersService.findById(payload.sub);
      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('用户不存在或已被禁用');
      }
      
      // 生成新的令牌
      const tokens = await this.generateTokens(user);
      
      return {
        ...tokens,
        user: {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          points: user.points,
          level: user.level,
        },
        isNewUser: false,
      };
    } catch (error) {
      this.logger.error(`刷新令牌失败: ${error.message}`);
      throw new UnauthorizedException('刷新令牌无效或已过期');
    }
  }

  /**
   * 验证访问令牌
   */
  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);
      
      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('用户不存在或已被禁用');
      }
      
      return {
        valid: true,
        user: {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          points: user.points,
          level: user.level,
        },
        expiresIn: payload.exp - Math.floor(Date.now() / 1000),
      };
    } catch (error) {
      return {
        valid: false,
      };
    }
  }

  /**
   * 调用微信API获取用户信息
   */
  private async getWechatUserInfo(code: string): Promise<WechatApiResponse> {
    const appId = this.configService.get('app.wechat.appId');
    const appSecret = this.configService.get('app.wechat.appSecret');
    const nodeEnv = this.configService.get('app.nodeEnv');
    
    // 开发环境模拟微信登录
    if (nodeEnv === 'development' && (appId === 'wx1234567890abcdef' || !appId || !appSecret)) {
      this.logger.log('开发环境：使用模拟微信登录');
      return {
        openid: `dev_openid_${code}_${Date.now()}`,
        session_key: 'dev_session_key',
        unionid: `dev_unionid_${code}`,
      };
    }
    
    if (!appId || !appSecret) {
      throw new BadRequestException('微信配置未设置');
    }
    
    const url = 'https://api.weixin.qq.com/sns/jscode2session';
    const params = {
      appid: appId,
      secret: appSecret,
      js_code: code,
      grant_type: 'authorization_code',
    };
    
    try {
      const response = await axios.get(url, { params });
      const data: WechatApiResponse = response.data;
      
      if (data.errcode) {
        this.logger.error(`微信API错误: ${data.errcode} - ${data.errmsg}`);
        throw new BadRequestException(`微信登录失败: ${data.errmsg}`);
      }
      
      if (!data.openid) {
        throw new BadRequestException('获取微信用户信息失败');
      }
      
      return data;
    } catch (error) {
      if (error.response) {
        this.logger.error(`微信API请求失败: ${error.response.status} - ${error.response.data}`);
      } else {
        this.logger.error(`微信API请求失败: ${error.message}`);
      }
      throw new BadRequestException('微信服务暂时不可用，请稍后重试');
    }
  }

  /**
   * 生成JWT令牌
   */
  private async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
  }> {
    const payload = {
      sub: user.id,
      openid: user.openid || '',
      nickname: user.nickname || '',
      iat: Math.floor(Date.now() / 1000),
    };
    
    // 生成访问令牌
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('app.jwt.secret') || 'default-secret',
      expiresIn: this.configService.get('app.jwt.expiresIn') || '7d',
    });
    
    // 生成刷新令牌
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.get('app.jwt.refreshSecret') || 'default-refresh-secret',
        expiresIn: this.configService.get('app.jwt.refreshExpiresIn') || '30d',
      },
    );
    
    // 计算过期时间（秒）
    const expiresIn = this.parseExpirationTime(this.configService.get('app.jwt.expiresIn') || '7d');
    
    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn,
    };
  }

  /**
   * 解析过期时间字符串为秒数
   */
  private parseExpirationTime(expiresIn: string): number {
    const match = expiresIn.match(/(\d+)([smhd]?)/);
    if (!match) return 3600; // 默认1小时
    
    const value = parseInt(match[1]);
    const unit = match[2] || 's';
    
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return value;
    }
  }
}