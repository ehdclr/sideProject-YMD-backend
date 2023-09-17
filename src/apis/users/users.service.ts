import runInTransaction from 'src/commons/utils/transaction.utils';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  IUsersServiceAddFollow,
  IUsersServiceCheckEmail,
  IUsersServiceCreate,
  IUsersServiceUnFollow,
  IUsersServiceUserInfo,
} from './interfaces/users-service.inerface';
import { UserInfo } from './entities/user-info.entity';
import { Follow } from './entities/follow.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(UserInfo)
    private readonly userInfoRepository: Repository<UserInfo>,
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    private readonly datasource: DataSource,
  ) {}

  //이메일이 기존에 있는 이메일인지
  async findOneByEmail({ email }: IUsersServiceCheckEmail): Promise<User> {
    return this.usersRepository.findOne({
      where: { email: email, is_tmp: false },
    });
  }

  // local 사용자용 회원가입
  async create(SignupUserDto: IUsersServiceCreate): Promise<object> {
    return runInTransaction(this.datasource, async (manager) => {
      const { password, second_password, email } = SignupUserDto;

      if (password != second_password) {
        throw new UnauthorizedException('비밀번호가 일치하지 않습니다!');
      }
      try {
        const user = await manager.findOne(User, {
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

        await manager.save(user);
      } catch (err) {
        throw err;
      }

      return { statusCode: 201, message: '회원가입 성공' };
    });
  }

  //TODO oauth용 사용자 회원가입
  // async oauthSignUp(): Promise<void> {
  //   //등록이 안된 회원이면, 등록을 해야함 oauth login을 하고 , userInfo에 없으면
  //   //해당 api를 요청해서 정보를 입력하고 리턴
  // }

  //TODO oauth local 모두 가입과정에서 필요한 사용자 추가 정보
  async addUserInfo(addUserInfoDto: IUsersServiceUserInfo): Promise<object> {
    return runInTransaction(this.datasource, async (manager) => {
      //사용자 아이디 값
      const { email, nickname, age, sex, phone_number, name } = addUserInfoDto;
      const user_image = addUserInfoDto.user_image || null;

      if (!email || !nickname || !age || !sex) {
        throw new BadRequestException('사용자 정보를 모두 입력해주세요!');
      }

      try {
        const user = await manager.findOne(User, {
          where: { email: email },
        });

        if (!user) {
          throw new NotFoundException(
            '해당 이메일을 가진 사용자를 찾을 수 없습니다!',
          );
        }

        const checkNickname = await manager.findOne(UserInfo, {
          where: { nickname },
        });

        if (checkNickname) {
          throw new ConflictException('이미 등록된 닉네임입니다!');
        }

        const userInfo = this.userInfoRepository.create({
          nickname,
          age,
          sex,
          user_image,
          phone_number,
          user,
          name,
        });

        await manager.save(userInfo);
      } catch (err) {
        throw err;
      }

      return {
        statusCode: 201,
        message: '회원가입 사용자 정보 등록 완료.',
      };
    });
  }
  //TODO 팔로우 팔로잉용 api
  async addFollow({
    userId,
    followNickname,
  }: IUsersServiceAddFollow): Promise<object> {
    return runInTransaction(this.datasource, async (manager) => {
      try {
        const followUserInfo = await manager.findOne(UserInfo, {
          where: { nickname: followNickname },
        });

        if (!followUserInfo) {
          throw new NotFoundException('팔로잉할 사람을 찾을 수 없습니다!');
        }

        const followerUserInfo = await manager.findOne(UserInfo, {
          where: { id: userId },
        });

        if (!followerUserInfo) {
          throw new NotFoundException(
            '로그인한 사용자의 정보를 찾을 수 없습니다!',
          );
        }
        if (followerUserInfo.nickname == followNickname) {
          throw new UnauthorizedException('자기 자신을 팔로우 할 수 없습니다!');
        }

        //이미 팔로워한 사용자도 이미 팔로우한 사람이라고 해야함
        const isExistFollow = await manager.findOne(Follow, {
          where: {
            followerId: followerUserInfo.id,
            followingId: followUserInfo.id,
          },
        });
        if (isExistFollow) {
          throw new ConflictException('이미 팔로우되어 있는 상대입니다!');
        }

        const followInfo = this.followRepository.create({
          follower: followerUserInfo, //본인
          following: followUserInfo,
        });

        await manager.save(followInfo);
      } catch (err) {
        throw err;
      }

      return { statusCode: 201, message: '팔로우 성공!' };
    });
  }

  //TODO 언팔로우 API
  async unFollow({ userId, followNickname }: IUsersServiceUnFollow) {
    return runInTransaction(this.datasource, async (manager) => {
      try {
        const targetUser = await manager.findOne(UserInfo, {
          where: { nickname: followNickname },
        });

        if (!targetUser) {
          throw new NotFoundException('팔로우 대상을 찾을 수 없습니다!');
        }

        if (targetUser.id == userId) {
          throw new UnauthorizedException('본인을 언팔로우 할 수 없습니다!');
        }

        const isCheckFollow = await manager.findOne(Follow, {
          where: {
            followerId: userId,
            followingId: targetUser.id,
          },
        });

        if (!isCheckFollow) {
          throw new NotFoundException('이미 팔로우 되어있지 않는 상대입니다.');
        }

        await manager.delete(Follow, {
          followerId: userId,
          followingId: targetUser.id,
        });
      } catch (err) {
        throw err;
      }

      return { status: 200, message: '언팔로우 했습니다!' };
    });
  }

  //TODO 사용자별 정보 얻기 (이후 프론트랑 추가 수정 )
  async getUserProfile(userNickname: string): Promise<object> {
    const user = await this.userInfoRepository.findOne({
      where: { nickname: userNickname },
    });

    if (!user) {
      throw new NotFoundException('사용자 정보가 없습니다.');
    }

    return {
      statusCode: 200,
      message: '사용자 정보를 찾았습니다!',
      user,
    };
  }

  //TODO 사용자 검색 용 api
}
