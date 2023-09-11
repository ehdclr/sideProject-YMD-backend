import { ApiProperty } from '@nestjs/swagger';

export class loginDto {
  @ApiProperty({ description: '사용자 이메일' })
  email: string;
  @ApiProperty({ description: '사용자 비밀번호' })
  password: string;
}

export class accessTokenUser {
  id: string;
}

export class refreshTokenUser {
  id: string;
}
