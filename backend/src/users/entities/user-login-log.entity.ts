import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

/**
 * 用户登录日志实体
 */
@Entity('user_login_logs')
@Index(['userId', 'createdAt'])
export class UserLoginLog {
  @ApiProperty({ description: '日志ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '用户ID' })
  @Column('uuid')
  @Index()
  userId: string;

  @ApiProperty({ description: '登录IP地址' })
  @Column({ length: 45 })
  ipAddress: string;

  @ApiProperty({ description: '用户代理信息' })
  @Column({ type: 'text', nullable: true })
  userAgent?: string;

  @ApiProperty({ description: '登录设备类型', enum: ['mobile', 'desktop', 'tablet', 'unknown'] })
  @Column({ type: 'varchar', length: 20, default: 'unknown' })
  deviceType: 'mobile' | 'desktop' | 'tablet' | 'unknown';

  @ApiProperty({ description: '操作系统' })
  @Column({ length: 50, nullable: true })
  operatingSystem?: string;

  @ApiProperty({ description: '浏览器信息' })
  @Column({ length: 100, nullable: true })
  browser?: string;

  @ApiProperty({ description: '登录状态', enum: ['success', 'failed'] })
  @Column({ type: 'varchar', length: 20 })
  status: 'success' | 'failed';

  @ApiProperty({ description: '失败原因', required: false })
  @Column({ length: 200, nullable: true })
  failureReason?: string;

  @ApiProperty({ description: '会话ID', required: false })
  @Column({ length: 100, nullable: true })
  sessionId?: string;

  @ApiProperty({ description: '登录时间' })
  @CreateDateColumn()
  createdAt: Date;

  // 关联关系
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}