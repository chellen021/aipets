import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';

export interface UploadResult {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  url: string;
  path: string;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.get('UPLOAD_DIR', './uploads');
    this.baseUrl = this.configService.get('BASE_URL', 'http://localhost:3000');
    
    // 确保上传目录存在
    this.ensureUploadDir();
  }

  /**
   * 上传头像
   */
  async uploadAvatar(file: Express.Multer.File, userId: string): Promise<UploadResult> {
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('不支持的文件类型，请上传 JPEG、PNG、GIF 或 WebP 格式的图片');
    }

    // 验证文件大小（5MB）
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('文件大小不能超过 5MB');
    }

    const avatarDir = path.join(this.uploadDir, 'avatars');
    this.ensureDir(avatarDir);

    const fileExtension = this.getFileExtension(file.originalname);
    const filename = `${userId}_${uuidv4()}.${fileExtension}`;
    const filePath = path.join(avatarDir, filename);

    try {
      // 使用 sharp 处理图片：压缩和调整大小
      await sharp(file.buffer)
        .resize(200, 200, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 80 })
        .toFile(filePath);

      const url = `${this.baseUrl}/uploads/avatars/${filename}`;

      this.logger.log(`头像上传成功: ${filename}`);

      return {
        filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url,
        path: filePath,
      };
    } catch (error) {
      this.logger.error(`头像上传失败: ${error.message}`);
      throw new BadRequestException('文件上传失败');
    }
  }

  /**
   * 上传通用文件
   */
  async uploadFile(file: Express.Multer.File, category: string = 'general'): Promise<UploadResult> {
    // 验证文件大小（10MB）
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('文件大小不能超过 10MB');
    }

    const categoryDir = path.join(this.uploadDir, category);
    this.ensureDir(categoryDir);

    const fileExtension = this.getFileExtension(file.originalname);
    const filename = `${uuidv4()}.${fileExtension}`;
    const filePath = path.join(categoryDir, filename);

    try {
      await fs.promises.writeFile(filePath, file.buffer);

      const url = `${this.baseUrl}/uploads/${category}/${filename}`;

      this.logger.log(`文件上传成功: ${filename}`);

      return {
        filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url,
        path: filePath,
      };
    } catch (error) {
      this.logger.error(`文件上传失败: ${error.message}`);
      throw new BadRequestException('文件上传失败');
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        this.logger.log(`文件删除成功: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`文件删除失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 根据URL删除文件
   */
  async deleteFileByUrl(url: string): Promise<boolean> {
    try {
      // 从URL中提取文件路径
      const urlPath = url.replace(this.baseUrl, '');
      const filePath = path.join(process.cwd(), urlPath);
      return this.deleteFile(filePath);
    } catch (error) {
      this.logger.error(`根据URL删除文件失败: ${error.message}`);
      return false;
    }
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(filePath: string): Promise<any> {
    try {
      const stats = await fs.promises.stat(filePath);
      return {
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
      };
    } catch (error) {
      this.logger.error(`获取文件信息失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 确保上传目录存在
   */
  private ensureUploadDir(): void {
    this.ensureDir(this.uploadDir);
    this.ensureDir(path.join(this.uploadDir, 'avatars'));
    this.ensureDir(path.join(this.uploadDir, 'pets'));
    this.ensureDir(path.join(this.uploadDir, 'general'));
  }

  /**
   * 确保目录存在
   */
  private ensureDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      this.logger.log(`创建目录: ${dirPath}`);
    }
  }

  /**
   * 获取文件扩展名
   */
  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || 'bin';
  }

  /**
   * 验证图片文件
   */
  private isImageFile(mimetype: string): boolean {
    return mimetype.startsWith('image/');
  }

  /**
   * 生成缩略图
   */
  async generateThumbnail(
    inputPath: string,
    outputPath: string,
    width: number = 150,
    height: number = 150,
  ): Promise<void> {
    try {
      await sharp(inputPath)
        .resize(width, height, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: 70 })
        .toFile(outputPath);

      this.logger.log(`缩略图生成成功: ${outputPath}`);
    } catch (error) {
      this.logger.error(`缩略图生成失败: ${error.message}`);
      throw new BadRequestException('缩略图生成失败');
    }
  }
}