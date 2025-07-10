import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InteractionsController } from './interactions.controller';
import { InteractionsService } from './interactions.service';
import { Interaction } from './entities/interaction.entity';
import { PetsModule } from '../pets/pets.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Interaction]),
    PetsModule,
    UsersModule,
  ],
  controllers: [InteractionsController],
  providers: [InteractionsService],
  exports: [InteractionsService],
})
export class InteractionsModule {}