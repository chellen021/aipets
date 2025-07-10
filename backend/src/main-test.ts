import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppTestModule } from './app-test.module';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppTestModule);

  // 安全中间件
  app.use(helmet());
  app.use(compression());

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS配置
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Swagger文档配置
  const config = new DocumentBuilder()
    .setTitle('萌宠伙伴 API (测试版)')
    .setDescription('萌宠伙伴微信小程序后端API文档 - 测试版本')
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
    .addTag('upload', '文件上传')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`测试应用运行在: http://localhost:${port}`);
  console.log(`Swagger文档地址: http://localhost:${port}/api/v1/docs`);
}

bootstrap();