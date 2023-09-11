import { ApiProperty } from '@nestjs/swagger';

export class SignupUserDto {
  @ApiProperty({ description: '사용자 비밀번호' })
  password: string;

  @ApiProperty({ description: '이메일' })
  email: string;
}

export class AddUserInfoDto {
  @ApiProperty({ description: ' 사용자 ID' })
  userId?: number;

  @ApiProperty({ description: '닉네임' })
  nickname: string;

  @ApiProperty({ description: '나이' })
  age: number;

  @ApiProperty({ description: '성별' })
  sex: string;

  @ApiProperty({ description: '프로필 이미지' })
  user_image?: string;

  @ApiProperty({ description: '전화번호' })
  phone_number: string;
}
