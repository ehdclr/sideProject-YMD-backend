import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  nickname: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  age: number;

  @ApiProperty()
  sex: string;

  @ApiProperty()
  phone_number: string;

  @ApiProperty()
  user_image: string;

  @ApiProperty()
  userId: number;
}
