import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Token } from '../auth/entities/token.entity';
import { UserInfo } from './entities/user-info.entity';
import { Follow } from './entities/follow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Token, UserInfo, Follow])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
