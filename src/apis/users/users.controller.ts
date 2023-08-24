import { HttpExceptionFilter } from '../../commons/filters/http-exception.filter';
import { Body, Controller, Get, Post, UseFilters } from '@nestjs/common';
import { SignupUserDto } from './dto/signup-user.input';
import { UsersSerivce } from './users.service';

@Controller('users')
@UseFilters(HttpExceptionFilter)
export class UsersController {
  constructor(private readonly usersService: UsersSerivce) {}

  @Post('/signup')
  signUp(@Body() signupUserDto: SignupUserDto) {
    this.usersService.createUser({
      signupUserDto,
    });
  }
}
