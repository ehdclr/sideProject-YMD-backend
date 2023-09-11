import {
  ConflictException,
  Injectable,
  NotFoundException,
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  IUsersServiceCheckEmail,
  IUsersServiceCreate,
  IUsersServiceUserInfo,
} from './interfaces/users-service.inerface';
import { UserInfo } from './entities/user-info.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(UserInfo)
    private readonly userInfoRepository: Repository<UserInfo>,
  ) {}

  //이메일이 기존에 있는 이메일인지
  async findOneByEmail({ email }: IUsersServiceCheckEmail): Promise<User> {
    return this.usersRepository.findOne({
      where: { email: email, is_tmp: false },
    });
  }

  // local 사용자용 회원가입
  async create(SignupUserDto: IUsersServiceCreate): Promise<object> {
    try {
      const { password, email } = SignupUserDto;

      const user = await this.usersRepository.findOne({
        where: { email: email, is_tmp: true },
      });

      // 이메일 인증 확인
      if (!user.is_verified_email) {
        throw new UnauthorizedException('이메일 인증이 되지 않았습니다!');
      }

      //(휴대폰 인증 추후 추가 Optional)

      const hashedPassword = await bcrypt.hash(password, 10);
      user.email = email;
      user.password_hash = hashedPassword;
      user.is_tmp = false;
      user.provider = 'local';

      await this.usersRepository.save(user);

      return { statusCode: 201, message: '회원가입 성공' };
    } catch (err) {
      throw new NotImplementedException('잘못된 요청입니다');
    }
  }

  //TODO oauth용 사용자 회원가입
  // async oauthSignUp(): Promise<void> {
  //   //등록이 안된 회원이면, 등록을 해야함 oauth login을 하고 , userInfo에 없으면
  //   //해당 api를 요청해서 정보를 입력하고 리턴
  // }

  //TODO oauth local 모두 가입과정에서 필요한 사용자 추가 정보
  async addUserInfo(addUserInfoDto: IUsersServiceUserInfo) {
    try {
      //사용자 아이디 값
      const { userId, nickname, age, sex, phone_number } = addUserInfoDto;
      let user_image = addUserInfoDto.user_image;

      user_image = user_image ? user_image : null;

      if (!userId) {
        throw new NotFoundException('사용자 아이디 값이 없습니다.');
      }

      const user = await this.usersRepository.findOne({
        where: { user_id: userId },
      });

      const checkNickname = await this.userInfoRepository.findOne({
        where: { nickname },
      });

      if (checkNickname) {
        throw new ConflictException('이미 등록된 닉네임입니다!');
      }

      this.userInfoRepository.save({
        nickname,
        age,
        sex,
        user_image,
        phone_number,
        user,
      });

      return {
        statusCode: 201,
        message: '회원가입 사용자 정보 등록 완료.',
      };
    } catch (err) {
      throw new NotImplementedException('잘못된 요청입니다');
    }
  }

  //TODO 사용자 검색 용 api

  //TODO 팔로우 팔로잉용 api
}
