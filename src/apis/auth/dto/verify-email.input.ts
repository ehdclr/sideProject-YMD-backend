import { ApiProperty } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiProperty({ description: '이메일' })
  email: string;
  @ApiProperty({ description: '사용자 아이디' })
  username: string;
}

export class SendPhoneDto {
  @ApiProperty({ description: '전화번호' })
  phone_number: string;
  @ApiProperty({ description: '사용자 아이디' })
  username: string;
}
