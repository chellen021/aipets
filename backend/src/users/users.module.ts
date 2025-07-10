import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UserLoginLog } from './entities/user-login-log.entity';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserLoginLog]),
    UploadModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // 导出服务供其他模块使用
})
export class UsersModule {}