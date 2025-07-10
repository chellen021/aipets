import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * 签到类型枚举
 */
export enum CheckInType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  SPECIAL = 'special', // 特殊活动签到
}

/**
 * 签到状态枚举
 */
export enum CheckInStatus {
  COMPLETED = 'completed',
  MISSED = 'missed',
  BONUS = 'bonus', // 连续签到奖励
}

/**
 * 签到实体
 */
@Entity('check_ins')
@Index(['userId', 'checkInDate'])
@Index(['checkInDate'])
@Unique(['userId', 'checkInDate']) // 确保每个用户每天只能签到一次
export class CheckIn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'daily',
  })
  type: CheckInType;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'completed',
  })
  status: CheckInStatus;

  @Column({ type: 'date' })
  checkInDate: Date; // 签到日期（只保留日期部分）

  @Column({ type: 'int', default: 0 })
  pointsEarned: number; // 获得的积分

  @Column({ type: 'int', default: 0 })
  experienceEarned: number; // 获得的经验

  @Column({ type: 'int', default: 1 })
  consecutiveDays: number; // 连续签到天数

  @Column({ type: 'boolean', default: false })
  isBonusDay: boolean; // 是否为奖励日（如连续签到7天）

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 1.0 })
  multiplier: number; // 奖励倍数

  @Column({ type: 'json', nullable: true })
  rewards: {
    points?: number;
    experience?: number;
    items?: string[];
    badges?: string[];
    specialRewards?: any[];
  }; // 获得的奖励详情

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string; // 签到IP地址

  @Column({ type: 'text', nullable: true })
  userAgent: string; // 用户代理

  @Column({ type: 'varchar', length: 50, nullable: true })
  deviceType: string; // 设备类型

  @Column({ type: 'text', nullable: true })
  notes: string; // 备注

  // 关联关系
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  // 时间戳
  @CreateDateColumn()
  createdAt: Date;

  /**
   * 检查是否为连续签到奖励日
   */
  isConsecutiveBonus(): boolean {
    return this.consecutiveDays > 0 && this.consecutiveDays % 7 === 0;
  }

  /**
   * 计算奖励倍数
   */
  calculateMultiplier(): number {
    if (this.consecutiveDays >= 30) return 3;
    if (this.consecutiveDays >= 14) return 2.5;
    if (this.consecutiveDays >= 7) return 2;
    if (this.consecutiveDays >= 3) return 1.5;
    return 1;
  }

  /**
   * 获取签到奖励描述
   */
  getRewardDescription(): string {
    const descriptions: string[] = [];
    
    if (this.pointsEarned > 0) {
      descriptions.push(`${this.pointsEarned} 积分`);
    }
    
    if (this.experienceEarned > 0) {
      descriptions.push(`${this.experienceEarned} 经验`);
    }
    
    if (this.rewards?.items && this.rewards.items.length > 0) {
      descriptions.push(`物品: ${this.rewards.items.join(', ')}`);
    }
    
    if (this.rewards?.badges && this.rewards.badges.length > 0) {
      descriptions.push(`徽章: ${this.rewards.badges.join(', ')}`);
    }
    
    if (this.isBonusDay) {
      descriptions.push('连续签到奖励');
    }
    
    return descriptions.length > 0 ? descriptions.join(', ') : '基础签到奖励';
  }

  /**
   * 获取签到状态描述
   */
  getStatusDescription(): string {
    switch (this.status) {
      case CheckInStatus.COMPLETED:
        return this.isBonusDay ? '签到成功（奖励日）' : '签到成功';
      case CheckInStatus.MISSED:
        return '未签到';
      case CheckInStatus.BONUS:
        return '连续签到奖励';
      default:
        return '未知状态';
    }
  }

  /**
   * 检查是否为今日签到
   */
  isToday(): boolean {
    const today = new Date();
    const checkInDate = new Date(this.checkInDate);
    return (
      today.getFullYear() === checkInDate.getFullYear() &&
      today.getMonth() === checkInDate.getMonth() &&
      today.getDate() === checkInDate.getDate()
    );
  }

  /**
   * 检查是否为本周签到
   */
  isThisWeek(): boolean {
    const today = new Date();
    const checkInDate = new Date(this.checkInDate);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return checkInDate >= startOfWeek && checkInDate <= endOfWeek;
  }

  /**
   * 检查是否为本月签到
   */
  isThisMonth(): boolean {
    const today = new Date();
    const checkInDate = new Date(this.checkInDate);
    return (
      today.getFullYear() === checkInDate.getFullYear() &&
      today.getMonth() === checkInDate.getMonth()
    );
  }
}