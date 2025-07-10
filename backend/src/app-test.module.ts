import { Module } from '@nestjs/common';
import { PetsDemoController } from './pets-demo.controller';

// 简化的测试模块，仅用于API文档展示
@Module({
  imports: [],
  controllers: [PetsDemoController],
  providers: [],
})
export class AppTestModule {}