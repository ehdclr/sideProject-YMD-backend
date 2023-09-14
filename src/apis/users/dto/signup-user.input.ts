import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsString, Matches } from 'class-validator';

export class SignupUserDto {
  @ApiProperty({
    example: 'qweR1234!',
    description: '사용자 비밀번호',
    required: true,
  })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d~!@#$%^&*()+|=]{8,16}$/, {
    message:
      '최소 8자 및 최대 20자 하나의 소문자, 하나의 숫자 및 하나의 특수문자가 필요합니다.',
  })
  password: string;

  @ApiProperty({
    example: 'test@test.com',
    description: '이메일',
    required: true,
  })
  @IsEmail()
  email: string;
}

export class AddUserInfoDto {
  @ApiProperty({
    example: 'test@test.com',
    description: '이메일',
    required: true,
  })
  @IsEmail()
  email?: string;

  @ApiProperty({ description: '닉네임', example: 'test', required: true })
  @IsString()
  nickname: string;

  @ApiProperty({ description: '나이', example: '17' })
  @IsNumber()
  age: number;

  @ApiProperty({ description: '성별', example: '남자' })
  @IsString()
  sex: string;

  @ApiProperty({ description: '프로필 이미지', example: 'url' })
  user_image?: string;

  @ApiProperty({ description: '전화번호', example: '010-0000-0000' })
  @IsString()
  phone_number: string;

  @ApiProperty({ description: '이름', example: '이현종' })
  @IsString()
  name: string;
}

export class AddFollowDto {
  @ApiProperty({ description: '팔로잉 할 닉네임', example: '배준호' })
  @IsString()
  followNickname: string;

  @ApiProperty({ description: '로그인한 사용자', example: '1' })
  @IsNumber()
  userId: number;
}
