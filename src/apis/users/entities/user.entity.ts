import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty, IsEmail, IsString } from 'class-validator';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column()
  @IsNotEmpty()
  username: string;

  @Column()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @Column()
  @IsNotEmpty()
  password_hash: string;

  @Column({ default: false })
  is_verified_email: boolean;

  @Column({ default: false })
  is_verified_phone: boolean;
}
