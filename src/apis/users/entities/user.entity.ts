import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsNotEmpty, IsEmail, IsString } from 'class-validator';
import { Token } from '../../auth/entities/token.entity';
import { UserInfo } from './user-info.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ nullable: true })
  @IsEmail()
  email: string;

  @Column({ nullable: true })
  @IsString()
  phone_number: string;

  @Column({ nullable: true })
  password_hash: string;

  @Column({ default: false })
  is_tmp: boolean;

  @Column({ default: false })
  is_verified_email: boolean;

  @Column({ default: false })
  is_verified_phone: boolean;

  @Column({ default: 'local', nullable: false })
  provider: string;

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  @OneToOne(() => UserInfo, (info) => info.user)
  user_info: UserInfo;


}
