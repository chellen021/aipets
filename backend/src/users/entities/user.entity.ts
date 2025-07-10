import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 用户实体
 */
@Entity('users')
export class User {
  @ApiProperty({ description: '用户ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '微信OpenID' })
  @Column({ unique: true, length: 100 })
  openid: string;

  @ApiProperty({ description: '微信UnionID', required: false })
  @Column({ nullable: true, length: 100 })
  unionid?: string;

  @ApiProperty({ description: '用户昵称' })
  @Column({ length: 50 })
  nickname: string;

  @ApiProperty({ description: '用户头像URL', required: false })
  @Column({ nullable: true, length: 500 })
  avatar?: string;

  @ApiProperty({ description: '性别', enum: ['male', 'female', 'unknown'] })
  @Column({ type: 'varchar', length: 20, default: 'unknown' })
  gender: 'male' | 'female' | 'unknown';

  @ApiProperty({ description: '生日', required: false })
  @Column({ type: 'date', nullable: true })
  birthday?: Date;

  @ApiProperty({ description: '用户积分' })
  @Column({ type: 'int', default: 0 })
  @Index()
  points: number;

  @ApiProperty({ description: '用户等级' })
  @Column({ type: 'int', default: 1 })
  level: number;

  @ApiProperty({ description: '经验值' })
  @Column({ type: 'int', default: 0 })
  experience: number;

  @ApiProperty({ description: '连续签到天数' })
  @Column({ type: 'int', default: 0 })
  consecutiveCheckins: number;

  @ApiProperty({ description: '总签到天数' })
  @Column({ type: 'int', default: 0 })
  totalCheckins: number;

  @ApiProperty({ description: '最后签到时间', required: false })
  @Column({ type: 'datetime', nullable: true })
  lastCheckinAt?: Date;

  @ApiProperty({ description: '是否启用通知' })
  @Column({ type: 'boolean', default: true })
  notificationsEnabled: boolean;

  @ApiProperty({ description: '隐私设置' })
  @Column({ type: 'json', default: '{}' })
  privacySettings: Record<string, any>;

  @ApiProperty({ description: '用户状态', enum: ['active', 'inactive', 'banned'] })
  @Column({ type: 'varchar', length: 20, default: 'active' })
  @Index()
  status: 'active' | 'inactive' | 'banned';

  @ApiProperty({ description: '最后登录时间', required: false })
  @Column({ type: 'datetime', nullable: true })
  lastLoginAt?: Date;

  @ApiProperty({ description: '最后登录IP', required: false })
  @Column({ nullable: true, length: 45 })
  lastLoginIp?: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * 计算下一级所需经验值
   */
  getNextLevelExperience(): number {
    return this.level * 100;
  }

  /**
   * 检查是否可以升级
   */
  canLevelUp(): boolean {
    return this.experience >= this.getNextLevelExperience();
  }

  /**
   * 升级
   */
  levelUp(): void {
    if (this.canLevelUp()) {
      this.experience -= this.getNextLevelExperience();
      this.level += 1;
    }
  }

  /**
   * 添加经验值
   */
  addExperience(exp: number): void {
    this.experience += exp;
    while (this.canLevelUp()) {
      this.levelUp();
    }
  }

  /**
   * 添加积分
   */
  addPoints(points: number): void {
    this.points += points;
  }

  /**
   * 扣除积分
   */
  deductPoints(points: number): boolean {
    if (this.points >= points) {
      this.points -= points;
      return true;
    }
    return false;
  }
}