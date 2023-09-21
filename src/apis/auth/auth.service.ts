import runInTransaction from 'src/commons/utils/transaction.util';
import {
  IAuthServiceLogin,
  IAuthServiceLogoutRefresh,
  IAuthServiceOauthLogin,
  IAUthServiceSendEmail,
  IAuthServiceUser,
  LoginResponse,
} from './interfaces/auth-service.interface';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { DataSource, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UserInfo } from '../users/entities/user-info.entity';
import sendEmail from 'src/commons/utils/email.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Token)
    private readonly tokensRepository: Repository<Token>,
    @InjectRepository(UserInfo)
    private readonly userInfoRepository: Repository<UserInfo>,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly dataSource: DataSource,
  ) {}

  async sendVerificationEmail({
    email,
  }: IAUthServiceSendEmail): Promise<object> {
    return runInTransaction(this.dataSource, async (manager) => {
      try {
        //임시 메일
        let isExist = await manager.findOne(User, {
          where: { email, is_tmp: true },
        });

        const emailVerifyUser = await manager.findOne(User, {
          where: { email, is_tmp: false, is_verified_email: true },
        });

        if (emailVerifyUser) {
          throw new ConflictException('이미 등록된 메일입니다!');
        }

        const tokenValue = crypto.randomBytes(3).toString('hex');

        //임시 아이디 없으면, 다시 재할당
        if (!isExist) {
          isExist = await manager.save(User, {
            email,
            is_tmp: true,
          });
        }

        const token = new Token();
        token.token = tokenValue;
        token.type = 'email';
        token.createdAt = new Date();
        token.expiresAt = new Date(Date.now() + 1000 * 60 * 3); //3분 후 만료

        token.user = isExist;

        await manager.save(token);
        await sendEmail(
          email,
          '이메일 인증입니다.',
          `<h1>이메일 코드입니다.</h1>
        <br>
        <p>이메일 인증을 원하시면 코드를 입력해주세요.</p>
        <h3>${tokenValue}</h3>

`,
        );
      } catch (err) {
        throw err;
      }

      return { statusCode: 200, message: '이메일 전송에 성공하였습니다.' };
    });
  }

  async verifyEmail(token: string): Promise<object> {
    return runInTransaction(this.dataSource, async (manager) => {
      try {
        const tokenVerify = await manager.findOne(Token, {
          where: { token: token },
          relations: ['user'],
        });

        if (!tokenVerify) {
          throw new NotFoundException('토큰이 존재하지 않습니다.');
        }

        if (tokenVerify.expiresAt < new Date()) {
          //만료기간이 지난 토큰 제거(입력 시에만 삭제됨)
          await manager.delete(Token, { token: token });
          throw new UnauthorizedException('토큰 만료시간이 지났습니다.');
        }

        const user = await manager.findOne(User, {
          where: {
            email: tokenVerify.user.email,
          },
        });

        if (!user) {
          throw new NotFoundException('유저가 맞지 않습니다.');
        }

        user.is_verified_email = true;
        await manager.save(user);

        //사용한 토큰은 삭제
        await manager.remove(tokenVerify);
      } catch (err) {
        throw err;
      }
      return { statusCode: 201, message: '이메일 인증에 성공하였습니다.' };
    });
  }

  //TODO 휴대폰 인증 로직

  //TODO 로그인 로직 - passport validate에서 불러와도됨
  async login({ email, password }: IAuthServiceLogin): Promise<LoginResponse> {
    try {
      //로그인 유저 아이디
      const user = await this.usersRepository.findOne({
        where: { email },
        relations: ['user_info'],
      });
      if (!user || !user.user_info) {
        throw new NotFoundException('사용자가 없습니다!');
      }

      const isCheckPassword = await bcrypt.compare(
        password,
        user.password_hash,
      );
      if (!isCheckPassword) {
        throw new UnauthorizedException('암호가 틀렸습니다!');
      }

      const userPayload: IAuthServiceUser = {
        user_id: user.id,
        email: user.email,
        user_info_id: user.user_info.id,
      };

      const refreshToken = this.setRefreshToken(userPayload.user_id);

      const accessToken = this.getAccessToken(userPayload);

      return {
        statusCode: 201,
        message: '로그인에 성공 하였습니다.',
        accessToken: `Bearer ${accessToken}`,
        refreshToken: refreshToken,
      };
    } catch (err) {
      if (!(err instanceof BadRequestException)) {
        throw err;
      }
      throw new BadRequestException('잘못된 요청입니다.');
    }
  }

  getAccessToken({ user_id, email, user_info_id }: IAuthServiceUser): string {
    return this.jwtService.sign(
      {
        sub: user_id,
        email: email,
        user_info_id: user_info_id,
      },
      { secret: process.env.JWT_ACCESS_TOKEN_KEY, expiresIn: '10m' },
    );
  }

  setRefreshToken(user_id: string): string {
    return this.jwtService.sign(
      { sub: user_id },
      { secret: process.env.JWT_REFRESH_TOKEN_KEY, expiresIn: '2w' },
    );
  }

  //TODO 트랜잭션 만들어줘야함
  async oauthLogin(user: IAuthServiceOauthLogin) {
    //oauth 유저가 있지만, userProfile이 없다면, 로그인요청 하고, 가입
    const { email, provider } = user;
    const oauthUser = await this.usersRepository.findOne({
      where: { email: email },
      relations: ['user_info'],
    });
    if (!oauthUser) {
      const signupUser = this.usersRepository.create({
        email: email,
        is_verified_email: true,
        provider: provider,
      });

      await this.usersRepository.save(signupUser);

      return {
        status: 201,
        firstLogin: true,
        message: 'Oauth 첫 로그인 입니다.',
      };
    }
    // if (!oauthUser.user_info.id) {
    //   throw new HttpException(
    //     {
    //       statusCode: HttpStatus.UNAUTHORIZED,
    //       message: '추가 회원가입을 진행해주세요',
    //       firstLogin: false,
    //     },
    //     HttpStatus.UNAUTHORIZED,
    //   );
    // }
    const userPayload = {
      user_id: oauthUser.id,
      email: oauthUser.email,
      user_info_id: oauthUser.user_info.id,
    };
    //리턴으로 리다이렉션
    const accessToken = this.getAccessToken(userPayload);
    const refreshToken = this.setRefreshToken(userPayload.user_info_id);
    return {
      statusCode: 200,
      message: '로그인에 성공 하였습니다.',
      firstLogin: false,
      accessToken: `Bearer ${accessToken}`,
      refreshToken: refreshToken,
    };
  }

  //로그아웃 로직
  async logout({ refreshToken }: IAuthServiceLogoutRefresh) {
    try {
      //블랙 리스트에 추가 (레디스)
      await this.addBlackList(refreshToken);

      //잘 추가 되었는지 확인
      const isBlacklisted = await this.checkBlackList(refreshToken);
      if (!isBlacklisted) {
        throw new UnauthorizedException('로그아웃 되지 않았습니다!');
      }
    } catch (err) {
      if (!(err instanceof BadRequestException)) {
        throw err;
      }
      throw new BadRequestException('잘못된 요청입니다.');
    }
  }

  //로그아웃 했을 때 refresh 토큰을 레디스에저장
  async addBlackList(refreshToken: string): Promise<void> {
    try {
      const expiresIn: number = 60 * 60 * 24 * 14;
      await this.cacheManager.set(refreshToken, true, expiresIn); //2주
    } catch (err) {
      if (!(err instanceof BadRequestException)) {
        throw err;
      }
      throw new BadRequestException('잘못된 요청입니다!');
    }
  }

  //
  async checkBlackList(refreshToken: string): Promise<boolean> {
    try {
      const result = await this.cacheManager.get(refreshToken);
      return !!result;
    } catch (err) {
      if (!(err instanceof BadRequestException)) {
        throw err;
      }
      throw new BadRequestException('잘못된 요청입니다.');
    }
  }
}
