import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
  Body,
  Get,
  Param,
  Res,
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
import { Response } from 'express';
import { UploadService, UploadResult } from './upload.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';
import { BaseResponseDto } from '../common/dto/base-response.dto';
import * as path from 'path';
import * as fs from 'fs';

@ApiTags('文件上传')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * 上传头像
   */
  @ApiOperation({ summary: '上传用户头像', description: '上传并处理用户头像图片' })
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
    description: '上传成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            filename: { type: 'string' },
            originalName: { type: 'string' },
            size: { type: 'number' },
            mimetype: { type: 'string' },
            url: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: '文件格式不支持或文件过大' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @User('id') userId: string,
  ): Promise<BaseResponseDto<UploadResult>> {
    if (!file) {
      throw new BadRequestException('请选择要上传的头像文件');
    }

    const result = await this.uploadService.uploadAvatar(file, userId);
    return BaseResponseDto.success(result, '头像上传成功');
  }

  /**
   * 上传通用文件
   */
  @ApiOperation({ summary: '上传通用文件', description: '上传通用文件到指定分类目录' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: '文件和分类信息',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '要上传的文件（最大 10MB）',
        },
        category: {
          type: 'string',
          description: '文件分类（如：pets, general 等）',
          default: 'general',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 200,
    description: '上传成功',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            filename: { type: 'string' },
            originalName: { type: 'string' },
            size: { type: 'number' },
            mimetype: { type: 'string' },
            url: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: '文件过大或上传失败' })
  @ApiResponse({ status: 401, description: '未授权访问' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('category') category: string = 'general',
  ): Promise<BaseResponseDto<UploadResult>> {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    const result = await this.uploadService.uploadFile(file, category);
    return BaseResponseDto.success(result, '文件上传成功');
  }

  /**
   * 获取上传的文件
   */
  @ApiOperation({ summary: '获取上传的文件', description: '通过文件路径获取上传的文件' })
  @ApiResponse({ status: 200, description: '文件获取成功' })
  @ApiResponse({ status: 404, description: '文件不存在' })
  @Get('files/*')
  async getFile(@Param('0') filePath: string, @Res() res: Response): Promise<void> {
    try {
      // 构建完整的文件路径
      const fullPath = path.join(process.cwd(), 'uploads', filePath);
      
      // 检查文件是否存在
      if (!fs.existsSync(fullPath)) {
        res.status(404).json({ message: '文件不存在' });
        return;
      }

      // 获取文件信息
      const stats = fs.statSync(fullPath);
      if (!stats.isFile()) {
        res.status(404).json({ message: '请求的不是文件' });
        return;
      }

      // 设置响应头
      const ext = path.extname(fullPath).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain',
        '.json': 'application/json',
      };

      const mimeType = mimeTypes[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', stats.size);
      
      // 对于图片文件，设置缓存头
      if (mimeType.startsWith('image/')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1年
      }

      // 发送文件
      res.sendFile(fullPath);
    } catch (error) {
      res.status(500).json({ message: '文件读取失败' });
    }
  }
}