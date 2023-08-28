import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersSerivce } from './users.service';
import { User } from './entities/user.entity';
import { OauthUser } from './entities/oauth-user.entity';
import { Token } from '../auth/entities/token.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, OauthUser, Token]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UsersController],
  providers: [UsersSerivce],
})
export class UsersModule {}
