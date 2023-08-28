import { HttpExceptionFilter } from '../../commons/filters/http-exception.filter';
import {
  Body,
  Controller,
  Get,
  Post,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { SignupUserDto } from './dto/signup-user.input';
import { UsersSerivce } from './users.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';

@ApiTags('User')
@Controller('users')
@UseInterceptors(SuccessInterceptor)
@UseFilters(HttpExceptionFilter)
export class UsersController {
  constructor(private readonly usersService: UsersSerivce) {}

  @Post('/signup')
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 409, description: '이미 등록된 메일입니다.' })
  async signUp(@Body() signupUserDto: SignupUserDto): Promise<object> {
    return this.usersService.create(signupUserDto);
  }
}
