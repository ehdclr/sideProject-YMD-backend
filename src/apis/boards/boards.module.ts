import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UserInfo } from '../users/entities/user-info.entity';
import { BoardsController } from './boards.controller';
import { Board } from './entities/board.entity';
import { BoardsService } from './boards.service';
import { Follow } from '../users/entities/follow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board, UserInfo, Follow])],
  controllers: [BoardsController],
  providers: [BoardsService],
})
export class BoardsModule {}
