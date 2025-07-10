import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Pet } from '../../pets/entities/pet.entity';

/**
 * 互动类型枚举
 */
export enum InteractionType {
  FEED = 'feed',
  PLAY = 'play',
  CARE = 'care',
  CLEAN = 'clean',
  MEDICINE = 'medicine',
  EXERCISE = 'exercise',
  SLEEP = 'sleep',
  BATH = 'bath',
  TRAINING = 'training',
  PHOTO = 'photo',
}

/**
 * 互动结果枚举
 */
export enum InteractionResult {
  SUCCESS = 'success',
  FAILED = 'failed',
  PARTIAL = 'partial',
}

/**
 * 互动实体
 */
@Entity('interactions')
@Index(['userId', 'createdAt'])
@Index(['petId', 'createdAt'])
@Index(['type', 'createdAt'])
export class Interaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  type: InteractionType;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'success',
  })
  result: InteractionResult;

  @Column({ type: 'varchar', length: 100, nullable: true })
  item: string; // 使用的物品（如食物、玩具等）

  @Column({ type: 'int', default: 5 })
  intensity: number; // 互动强度（1-10）

  @Column({ type: 'int', default: 0 })
  experienceGained: number; // 获得的经验值

  @Column({ type: 'int', default: 0 })
  pointsGained: number; // 获得的积分

  @Column({ type: 'int', default: 0 })
  duration: number; // 互动持续时间（秒）

  // 属性变化记录
  @Column({ type: 'json', nullable: true })
  attributeChanges: {
    health?: number;
    happiness?: number;
    energy?: number;
    hunger?: number;
  };

  // 互动前的宠物状态
  @Column({ type: 'json', nullable: true })
  petStateBefore: {
    health: number;
    happiness: number;
    energy: number;
    hunger: number;
    level: number;
  };

  // 互动后的宠物状态
  @Column({ type: 'json', nullable: true })
  petStateAfter: {
    health: number;
    happiness: number;
    energy: number;
    hunger: number;
    level: number;
  };

  @Column({ type: 'text', nullable: true })
  notes: string; // 备注

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string; // IP地址

  @Column({ type: 'text', nullable: true })
  userAgent: string; // 用户代理

  @Column({ type: 'varchar', length: 50, nullable: true })
  deviceType: string; // 设备类型

  @Column({ type: 'boolean', default: false })
  levelUpOccurred: boolean; // 是否发生了升级

  @Column({ type: 'int', nullable: true })
  newLevel: number; // 升级后的等级

  // 关联关系
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  petId: string;

  @ManyToOne(() => Pet, (pet) => pet.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'petId' })
  pet: Pet;

  // 时间戳
  @CreateDateColumn()
  createdAt: Date;

  /**
   * 计算互动效果评分
   */
  getEffectivenessScore(): number {
    if (!this.attributeChanges) return 0;
    
    const changes = this.attributeChanges;
    let score = 0;
    
    // 正面变化加分
    if (changes.health && changes.health > 0) score += changes.health;
    if (changes.happiness && changes.happiness > 0) score += changes.happiness;
    if (changes.energy && changes.energy > 0) score += changes.energy;
    if (changes.hunger && changes.hunger > 0) score += changes.hunger;
    
    // 负面变化扣分（但不会让总分为负）
    if (changes.health && changes.health < 0) score += changes.health * 0.5;
    if (changes.happiness && changes.happiness < 0) score += changes.happiness * 0.5;
    if (changes.energy && changes.energy < 0) score += changes.energy * 0.3;
    if (changes.hunger && changes.hunger < 0) score += changes.hunger * 0.3;
    
    // 升级额外加分
    if (this.levelUpOccurred) score += 50;
    
    return Math.max(0, Math.round(score));
  }

  /**
   * 检查是否为有效互动
   */
  isEffective(): boolean {
    return this.result === InteractionResult.SUCCESS && this.getEffectivenessScore() > 0;
  }

  /**
   * 获取互动类型的中文名称
   */
  getTypeDisplayName(): string {
    const typeNames = {
      [InteractionType.FEED]: '喂食',
      [InteractionType.PLAY]: '游戏',
      [InteractionType.CARE]: '照顾',
      [InteractionType.CLEAN]: '清洁',
      [InteractionType.MEDICINE]: '治疗',
      [InteractionType.EXERCISE]: '运动',
      [InteractionType.SLEEP]: '休息',
      [InteractionType.BATH]: '洗澡',
      [InteractionType.TRAINING]: '训练',
      [InteractionType.PHOTO]: '拍照',
    };
    return typeNames[this.type] || this.type;
  }
}