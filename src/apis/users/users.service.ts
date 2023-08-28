import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  IUsersServiceCheckEmail,
  IUsersServiceCreate,
} from './interfaces/users-service.inerface';

@Injectable()
export class UsersSerivce {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  //이메일이 기존에 있는 이메일인지
  async findOneByEmail({ email }: IUsersServiceCheckEmail): Promise<User> {
    return this.usersRepository.findOne({
      where: { email: email },
    });
  }

  async create(SignupUserDto: IUsersServiceCreate): Promise<object> {
    const { username, password, phone_number, email } = SignupUserDto;

    const userInfo = await this.usersRepository.findOne({
      where: { username: username, is_tmp: true },
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    userInfo.password_hash = hashedPassword;
    userInfo.is_tmp = false;

    const isExistEmail = await this.findOneByEmail({ email });

    if (isExistEmail) throw new ConflictException('이미 등록된 메일입니다.');

    //사용자 마지막 최종 제출하면 is_tmp 을 false;로 바꿔줘야함

    await this.usersRepository.save(userInfo);

    return { statusCode: 200, message: '회원가입 성공' };
  }
}
