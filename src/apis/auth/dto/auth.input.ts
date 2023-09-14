import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class loginDto {
  @ApiProperty({ description: '사용자 이메일', example: 'test@test.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @ApiProperty({ description: '사용자 비밀번호', example: 'qweR1234!' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class accessTokenUser {
  id: string;
}

export class refreshTokenUser {
  id: string;
}
