import { Injectable } from '@nestjs/common';
import { SignupUserDto } from './dto/signup-user.input';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

interface IUsersServiceSingup {
  signupUserDto: SignupUserDto;
}

@Injectable()
export class UsersSerivce {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  //회원가입
  createUser({ singupUserDto }: IUsersServiceSingup) {
    //TODO 사용자 회원가입 로직 


  }
}
