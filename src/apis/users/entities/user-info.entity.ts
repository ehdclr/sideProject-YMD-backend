import { IsNotEmpty } from 'class-validator';
import { Board } from 'src/apis/boards/entities/board.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Follow } from './follow.entity';
import { User } from './user.entity';

export enum Sex {
  MAN = '남자',
  WOMAN = '여자',
}

@Entity()
export class UserInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsNotEmpty()
  nickname: string;

  @Column()
  name: string;

  @Column()
  age: number;

  @Column({ type: 'enum', enum: Sex, default: Sex.MAN })
  sex: Sex;

  @Column()
  phone_number: string;

  @Column({ nullable: true })
  user_image: string;

  @OneToOne(() => User, (user) => user.user_info)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @OneToMany(() => Follow, (follow) => follow.follower)
  following: Follow[];

  @OneToMany(() => Follow, (follow) => follow.following)
  followers: Follow[];

  @OneToMany(() => Board, (board) => board.userInfo)
  boards: Board[];
}
