import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { Sex } from '../entities/user-info.entity';

export class UserResponseDto {
  @ApiProperty({ description: '아이디정보아이디값' })
  @IsNumber()
  id: number;

  @ApiProperty({ description: '닉네임' })
  @IsString()
  nickname: string;

  @ApiProperty({ description: '이름' })
  @IsString()
  name: string;

  @ApiProperty({ description: '나이' })
  @IsNumber()
  age: number;

  @ApiProperty({ description: '성별', enum: Sex })
  @IsEnum(Sex)
  sex: Sex;

  @ApiProperty({ description: '전화번호' })
  phone_number: string;

  @ApiProperty({ description: '유저이미지 url' })
  @IsString()
  user_image: string;

  @ApiProperty({ description: '유저아이디 값 ' })
  @IsNumber()
  userId: number;
}
