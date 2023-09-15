import { PrivacyLevel } from './../entities/board.entity';
import { ApiProperty } from '@nestjs/swagger';

class boardResult {
  @ApiProperty({ description: '게시글 제목' })
  title: string;
  @ApiProperty({ description: '게시글 내용' })
  contents: string;
  @ApiProperty({ description: '작성 날짜' })
  date: Date;
  @ApiProperty({ description: '공개 여부', enum: PrivacyLevel })
  is_private: PrivacyLevel;
  @ApiProperty({ description: '작성자 닉네임' })
  author: string;
  @ApiProperty({ description: '작성자 사용자 정보 아이디 값' })
  user_info_id: number;
}

export class BoardsListResponseDto {
  @ApiProperty({ type: [boardResult], description: '게시물 리스트' })
  boardsList: boardResult[];
}

export class BoardDetailResponseDto {
  @ApiProperty({ type: boardResult, description: '선택한 게시물' })
  board: boardResult;
}
