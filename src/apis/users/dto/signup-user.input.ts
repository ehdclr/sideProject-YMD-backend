import { ApiProperty } from '@nestjs/swagger';

export class SignupUserDto {
  @ApiProperty({ description: '사용자 아이디' })
  username: string;
  @ApiProperty({ description: '사용자 비밀번호' })
  password: string;

  @ApiProperty({ description: '전화번호' })
  phone_number: string;
  @ApiProperty({ description: '이메일' })
  email: string;
}
