import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * 宠物性别枚举
 */
export enum PetGender {
  MALE = 'male',
  FEMALE = 'female',
  UNKNOWN = 'unknown',
}

/**
 * 宠物状态枚举
 */
export enum PetStatus {
  HEALTHY = 'healthy',
  SICK = 'sick',
  HUNGRY = 'hungry',
  TIRED = 'tired',
  HAPPY = 'happy',
  SAD = 'sad',
}

/**
 * 宠物类型枚举
 */
export enum PetType {
  CAT = 'cat',
  DOG = 'dog',
  RABBIT = 'rabbit',
  HAMSTER = 'hamster',
  BIRD = 'bird',
  FISH = 'fish',
  OTHER = 'other',
}

/**
 * 宠物实体
 */
@Entity('pets')
export class Pet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'cat',
  })
  type: PetType;

  @Column({ type: 'varchar', length: 50, nullable: true })
  breed: string; // 品种

  @Column({
    type: 'varchar',
    length: 20,
    default: 'unknown',
  })
  gender: PetGender;

  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @Column({ type: 'text', nullable: true })
  avatar: string; // 头像URL

  @Column({ type: 'text', nullable: true })
  description: string; // 描述

  // 宠物属性
  @Column({ type: 'int', default: 100 })
  health: number; // 健康值 (0-100)

  @Column({ type: 'int', default: 100 })
  happiness: number; // 快乐值 (0-100)

  @Column({ type: 'int', default: 100 })
  energy: number; // 精力值 (0-100)

  @Column({ type: 'int', default: 100 })
  hunger: number; // 饥饿值 (0-100，100表示很饱)

  @Column({ type: 'int', default: 0 })
  experience: number; // 经验值

  @Column({ type: 'int', default: 1 })
  level: number; // 等级

  @Column({
    type: 'varchar',
    length: 20,
    default: 'healthy',
  })
  status: PetStatus;

  // 互动统计
  @Column({ type: 'int', default: 0 })
  totalFeedings: number; // 总喂食次数

  @Column({ type: 'int', default: 0 })
  totalPlayings: number; // 总游戏次数

  @Column({ type: 'int', default: 0 })
  totalCarings: number; // 总照顾次数

  // 时间记录
  @Column({ type: 'datetime', nullable: true })
  lastFeedTime: Date; // 最后喂食时间

  @Column({ type: 'datetime', nullable: true })
  lastPlayTime: Date; // 最后游戏时间

  @Column({ type: 'datetime', nullable: true })
  lastCareTime: Date; // 最后照顾时间

  @Column({ type: 'datetime', nullable: true })
  lastInteractionTime: Date; // 最后互动时间

  // 关联关系
  @Column({ type: 'uuid' })
  ownerId: string;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  // 时间戳
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * 计算宠物年龄（月数）
   */
  getAge(): number {
    if (!this.birthday) return 0;
    const now = new Date();
    const birthdayDate = this.birthday instanceof Date ? this.birthday : new Date(this.birthday);
    const diffTime = Math.abs(now.getTime() - birthdayDate.getTime());
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
    return diffMonths;
  }

  /**
   * 检查是否需要照顾
   */
  needsCare(): boolean {
    return (
      this.health < 50 ||
      this.happiness < 50 ||
      this.energy < 30 ||
      this.hunger < 30
    );
  }

  /**
   * 获取宠物整体状态评分
   */
  getOverallScore(): number {
    return Math.round((this.health + this.happiness + this.energy + this.hunger) / 4);
  }

  /**
   * 检查是否可以升级
   */
  canLevelUp(): boolean {
    const requiredExp = this.level * 100; // 简单的升级公式
    return this.experience >= requiredExp;
  }

  /**
   * 升级
   */
  levelUp(): void {
    if (this.canLevelUp()) {
      const requiredExp = this.level * 100;
      this.experience -= requiredExp;
      this.level += 1;
      
      // 升级奖励：恢复部分属性
      this.health = Math.min(100, this.health + 10);
      this.happiness = Math.min(100, this.happiness + 10);
      this.energy = Math.min(100, this.energy + 10);
    }
  }

  /**
   * 更新宠物状态（基于属性值）
   */
  updateStatus(): void {
    if (this.health < 30) {
      this.status = PetStatus.SICK;
    } else if (this.hunger < 30) {
      this.status = PetStatus.HUNGRY;
    } else if (this.energy < 30) {
      this.status = PetStatus.TIRED;
    } else if (this.happiness < 30) {
      this.status = PetStatus.SAD;
    } else if (this.happiness > 80 && this.health > 80) {
      this.status = PetStatus.HAPPY;
    } else {
      this.status = PetStatus.HEALTHY;
    }
  }

  /**
   * 随时间自然衰减属性
   */
  naturalDecay(): void {
    const now = new Date();
    const lastInteraction = this.lastInteractionTime || this.createdAt;
    const hoursPassed = Math.floor(
      (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60)
    );

    if (hoursPassed > 0) {
      // 每小时衰减
      this.hunger = Math.max(0, this.hunger - hoursPassed * 2);
      this.energy = Math.max(0, this.energy - hoursPassed * 1);
      this.happiness = Math.max(0, this.happiness - hoursPassed * 1);
      
      // 如果饥饿或精力过低，影响健康
      if (this.hunger < 20 || this.energy < 20) {
        this.health = Math.max(0, this.health - hoursPassed * 1);
      }
      
      this.updateStatus();
    }
  }
}