import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PrivacyLevel } from '../entities/board.entity';

export class UpdateBoardDto {
  @ApiProperty({
    example: '제목',
    description: '수정할 제목',
  })
  @IsString()
  @IsOptional()
  update_title?: string;

  @ApiProperty({
    example: '내용',
    description: '수정할 내용',
  })
  @IsString()
  @IsOptional()
  update_contents?: string;

  @ApiProperty({
    example: '이미지url',
    description: '이미지',
  })
  @IsString()
  @IsOptional()
  update_board_image?: string;

  @ApiProperty({
    example: '모두 공개/비공개/친구에게만 공개',
    description: '공개여부 수정',
  })
  @IsEnum(PrivacyLevel)
  @IsOptional()
  update_is_private: PrivacyLevel;
}
