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
  id: number;

  @ManyToOne(() => UserInfo, (userInfo) => userInfo.following)
  @JoinColumn({ name: 'followerId' })
  follower: UserInfo;

  @Column()
  followerId: number;

  @ManyToOne(() => UserInfo, (userInfo) => userInfo.followers)
  @JoinColumn({ name: 'followingId' })
  following: UserInfo;

  @Column()
  followingId: number;
}
