import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

@Entity()
export class OauthUser {
  @PrimaryGeneratedColumn()
  oauth_user_id: number;

  @Column()
  @IsString()
  @IsNotEmpty()
  username: string;

  @Column({ nullable: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  provider: string;

  @Column()
  @IsNotEmpty()
  provider_id: string;

  @Column({ nullable: true })
  access_token: string;

  @Column({ nullable: true })
  refresh_token: string;
}
