import { ApiProperty } from '@nestjs/swagger';
import { UserInfo } from 'src/apis/users/entities/user-info.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum PrivacyLevel {
  PUBLIC = '모두 공개',
  PRIVATE = '비공개',
  ONLY_FRIENDS = '친구에게만 공개',
}

@Entity()
export class Board {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: '게시물 id값' })
  id: string;

  @Column({ nullable: true })
  @ApiProperty({ description: '게시물에 업로드한 이미지' })
  board_image: string;

  @Column({ length: 100 })
  @ApiProperty({ description: '제목' })
  title: string;

  @Column('text')
  @ApiProperty({ description: '내용' })
  contents: string;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  @ApiProperty({ description: '작성날짜' })
  date: Date;

  @Column({ type: 'enum', enum: PrivacyLevel, default: PrivacyLevel.PUBLIC })
  @ApiProperty({ description: '공개 여부' })
  is_private: PrivacyLevel;

  @ManyToOne(() => UserInfo, (userinfo) => userinfo.boards)
  @JoinColumn({ name: 'user_info_id' })
  userInfo: UserInfo;

  @Column()
  @ApiProperty({ description: '유저 정보 아이디값' })
  user_info_id: string;
}
