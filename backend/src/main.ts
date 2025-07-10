import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get('PORT', 3000);
  const apiPrefix = configService.get('API_PREFIX', 'api/v1');
  const corsOrigin = configService.get('CORS_ORIGIN', 'http://localhost:3001');

  // 安全中间件
  app.use(helmet());
  app.use(compression());

  // CORS配置
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // 全局API前缀
  app.setGlobalPrefix(apiPrefix);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger文档配置
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('AI Pet API')
      .setDescription('AI虚拟宠物游戏后端API文档')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('用户管理', '用户注册、登录、个人信息管理')
      .addTag('宠物管理', '宠物创建、状态管理、互动')
      .addTag('互动记录', '用户与宠物的互动历史记录')
      .addTag('签到系统', '每日签到、奖励管理')
      .addTag('商店', '商品购买、购买历史')
      .addTag('认证', '用户认证相关接口')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });

    logger.log(`Swagger文档已启用: http://localhost:${port}/${apiPrefix}/docs`);
  }

  await app.listen(port);
  logger.log(`应用已启动，端口: ${port}`);
  logger.log(`API地址: http://localhost:${port}/${apiPrefix}`);
}

bootstrap().catch((error) => {
  console.error('应用启动失败:', error);
  process.exit(1);
});
