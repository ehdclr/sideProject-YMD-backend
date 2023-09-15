import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PrivacyLevel } from '../entities/board.entity';

export class CreateBoardDto {
  @ApiProperty({
    example: '제목',
    description: '제목',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: '내용',
    description: '내용',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  contents: string;

  @ApiProperty({
    example: '이미지url',
    description: '이미지',
  })
  @IsString()
  @IsOptional()
  board_image: string;

  @ApiProperty({
    example: '모두 공개/비공개/친구에게만 공개',
    description: '공개여부',
    required: true,
  })
  @IsEnum(PrivacyLevel)
  is_private: PrivacyLevel;
}
