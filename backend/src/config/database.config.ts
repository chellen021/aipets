import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

/**
 * PostgreSQL数据库配置
 */
export const getPostgresConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('app.database.postgres.host'),
  port: configService.get('app.database.postgres.port'),
  username: configService.get('app.database.postgres.username'),
  password: configService.get('app.database.postgres.password'),
  database: configService.get('app.database.postgres.database'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: configService.get('app.nodeEnv') === 'development',
  logging: configService.get('app.nodeEnv') === 'development',
  ssl: configService.get('app.nodeEnv') === 'production' ? { rejectUnauthorized: false } : false,
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  migrationsRun: false,
  migrationsTableName: 'migrations',
});

/**
 * MongoDB数据库配置
 */
export const getMongoConfig = (
  configService: ConfigService,
): MongooseModuleOptions => ({
  uri: configService.get('app.database.mongodb.uri'),
});

/**
 * Redis配置
 */
export const getRedisConfig = (configService: ConfigService) => ({
  host: configService.get('app.database.redis.host'),
  port: configService.get('app.database.redis.port'),
  password: configService.get('app.database.redis.password') || undefined,
  db: configService.get('app.database.redis.db'),
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
});