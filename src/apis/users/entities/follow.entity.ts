import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserInfo } from './user-info.entity';

@Entity()
export class Follow {
  @PrimaryGeneratedColumn()
  follow_id: number;

  @ManyToOne(() => UserInfo, (userInfo) => userInfo.following)
  @JoinColumn({ name: 'followerId' })
  follower: number;

  @ManyToOne(() => UserInfo, (userInfo) => userInfo.followers)
  @JoinColumn({ name: 'followingId' })
  following: number;
}
