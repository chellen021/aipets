import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  // 应用配置
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10) || 3000,
  apiPrefix: process.env.API_PREFIX || 'api/v1',

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  // 数据库配置
  database: {
    // PostgreSQL
    postgres: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || 'minipet',
    },
    // MongoDB
    mongodb: {
      uri: process.env.MONGO_URI || 'mongodb://localhost:27017/minipet',
    },
    // Redis
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10) || 6379,
      password: process.env.REDIS_PASSWORD || '',
      db: parseInt(process.env.REDIS_DB || '0', 10) || 0,
    },
  },

  // 微信配置
  wechat: {
    appId: process.env.WECHAT_APP_ID,
    appSecret: process.env.WECHAT_APP_SECRET,
  },

  // 对象存储配置
  oss: {
    region: process.env.OSS_REGION,
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    bucket: process.env.OSS_BUCKET,
    endpoint: process.env.OSS_ENDPOINT,
  },

  // AI服务配置
  ai: {
    serviceUrl: process.env.AI_SERVICE_URL,
    apiKey: process.env.AI_SERVICE_API_KEY,
  },

  // RabbitMQ配置
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    queues: {
      notifications: process.env.RABBITMQ_QUEUE_NOTIFICATIONS || 'notifications',
    },
  },

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs',
  },

  // 限流配置
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10) || 60,
    limit: parseInt(process.env.RATE_LIMIT_LIMIT || '100', 10) || 100,
  },

  // 文件上传配置
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10) || 5242880, // 5MB
    allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
    ],
  },

  // 缓存配置
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '300', 10) || 300, // 5分钟
    max: parseInt(process.env.CACHE_MAX || '100', 10) || 100,
  },
}));