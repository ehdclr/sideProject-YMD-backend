import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OauthUser } from '../users/entities/oauth-user.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { UsersSerivce } from '../users/users.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Token } from './entities/token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, OauthUser, Token]),

    forwardRef(() => UsersModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersSerivce],
})
export class AuthModule {}
