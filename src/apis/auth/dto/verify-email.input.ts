import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SendEmailDto {
  @ApiProperty({ description: '이메일', example: 'test@test.com' })
  @IsEmail()
  email: string;
}
