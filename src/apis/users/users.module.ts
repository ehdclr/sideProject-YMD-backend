import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersSerivce } from './users.service';
import { User } from './entities/user.entity';
import { OauthUser } from './entities/oauth-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, OauthUser])],
  controllers: [UsersController],
  providers: [UsersSerivce],
})
export class UsersModule {}
