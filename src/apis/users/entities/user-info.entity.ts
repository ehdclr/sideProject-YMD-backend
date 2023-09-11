import { IsNotEmpty } from 'class-validator';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Follow } from './follow.entity';
import { User } from './user.entity';

@Entity()
export class UserInfo {
  @PrimaryGeneratedColumn()
  userprofile_id: number;

  @Column({ unique: true })
  @IsNotEmpty()
  nickname: string;

  @Column()
  name: string;

  @Column()
  age: number;

  @Column()
  sex: string;

  @Column()
  phone_number: string;

  @Column({ nullable: true })
  user_image: string;

  @OneToOne(() => User, (user) => user.user_info)
  user: User;

  @OneToMany(() => Follow, (follow) => follow.follower)
  following: Follow[];

  @OneToMany(() => Follow, (follow) => follow.following)
  followers: Follow[];
}
