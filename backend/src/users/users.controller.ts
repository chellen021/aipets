import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto, UserDto, UserStatsDto, UserSettingsDto } from './dto/user.dto';
import { BaseResponseDto } from '../common/dto/base-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';

@ApiTags('用户管理')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: '获取用户信息' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: BaseResponseDto<UserDto>,
  })
  async getProfile(@User('id') userId: string): Promise<BaseResponseDto<UserDto>> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new BadRequestException('用户不存在');
    }
    
    const userDto = this.usersService.toDto(user);
    return BaseResponseDto.success(userDto, '获取用户信息成功');
  }

  @Put('profile')
  @ApiOperation({ summary: '更新用户信息' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    type: BaseResponseDto<UserDto>,
  })
  async updateProfile(
    @User('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<BaseResponseDto<UserDto>> {
    const user = await this.usersService.update(userId, updateUserDto);
    const userDto = this.usersService.toDto(user);
    return BaseResponseDto.success(userDto, '更新用户信息成功');
  }

  @Put('avatar')
  @ApiOperation({ summary: '更新用户头像' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '头像文件',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '头像图片文件（支持 JPEG、PNG、GIF、WebP 格式，最大 5MB）',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    type: BaseResponseDto<{ avatarUrl: string }>,
  })
  @ApiResponse({ status: 400, description: '文件格式不支持或文件过大' })
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatar(
    @User('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<BaseResponseDto<{ avatarUrl: string }>> {
    if (!file) {
      throw new BadRequestException('请选择头像文件');
    }

    const user = await this.usersService.uploadAndUpdateAvatar(userId, file);
    
    return BaseResponseDto.success({ avatarUrl: user.avatar || '' }, '头像更新成功');
  }

  @Get('stats')
  @ApiOperation({ summary: '获取用户统计信息' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: BaseResponseDto<UserStatsDto>,
  })
  async getUserStats(@User('id') userId: string): Promise<BaseResponseDto<UserStatsDto>> {
    const stats = await this.usersService.getUserStats(userId);
    return BaseResponseDto.success(stats, '获取用户统计信息成功');
  }

  @Put('settings')
  @ApiOperation({ summary: '更新用户设置' })
  @ApiResponse({
    status: 200,
    description: '更新成功',
    type: BaseResponseDto<UserDto>,
  })
  async updateSettings(
    @User('id') userId: string,
    @Body() settingsDto: UserSettingsDto,
  ): Promise<BaseResponseDto<UserDto>> {
    const user = await this.usersService.updateSettings(userId, settingsDto);
    const userDto = this.usersService.toDto(user);
    return BaseResponseDto.success(userDto, '设置更新成功');
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取用户信息（管理员功能）' })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    type: BaseResponseDto<UserDto>,
  })
  async getUserById(@Param('id') id: string): Promise<BaseResponseDto<UserDto>> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new BadRequestException('用户不存在');
    }
    
    const userDto = this.usersService.toDto(user);
    return BaseResponseDto.success(userDto, '获取用户信息成功');
  }
}