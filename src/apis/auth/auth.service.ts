import {
  IAuthServiceLogin,
  IAuthServiceLogoutRefresh,
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
  NotImplementedException,
  UnauthorizedException,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //임시 메일
      let isExist = await queryRunner.manager.findOne(User, {
        where: { email, is_tmp: true },
      });

      const emailVerifyUser = await queryRunner.manager.findOne(User, {
        where: { email, is_tmp: false, is_verified_email: true },
      });

      if (emailVerifyUser) {
        throw new ConflictException('이미 등록된 메일입니다!');
      }

      const tokenValue = crypto.randomBytes(3).toString('hex');

      //임시 아이디 없으면, 다시 재할당
      if (!isExist) {
        isExist = await queryRunner.manager.save(User, { email, is_tmp: true });
      }

      const token = new Token();
      token.token = tokenValue;
      token.type = 'email';
      token.createdAt = new Date();
      token.expiresAt = new Date(Date.now() + 1000 * 60 * 3); //3분 후 만료

      token.user = isExist;

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: `${process.env.ADMIN_EMAIL}`,
          pass: `${process.env.ADMIN_EMAIL_PASS}`,
        },
      });

      const mailOptions = {
        to: email,
        subject: '이메일 인증입니다.',
        html: `<h1>이메일 코드입니다.</h1>
                <br>
                <p>이메일 인증을 원하시면 코드를 입력해주세요.</p>
                <h3>${tokenValue}</h3>
        
        `,
      };

      await queryRunner.manager.save(token);
      await queryRunner.commitTransaction();
      await transporter.sendMail(mailOptions);
      return { statusCode: 201, message: '이메일 전송에 성공하였습니다.' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (!(err instanceof NotImplementedException)) {
        throw err;
      }
      throw new NotImplementedException('잘못된 요청입니다');
    } finally {
      await queryRunner.release();
    }
  }

  async verifyEmail(token: string): Promise<object> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tokenVerify = await queryRunner.manager.findOne(Token, {
        where: { token: token },
        relations: ['user'],
      });

      if (!tokenVerify) {
        throw new NotFoundException('토큰이 존재하지 않습니다.');
      }

      if (tokenVerify.expiresAt < new Date()) {
        //만료기간이 지난 토큰 제거(입력 시에만 삭제됨)
        await queryRunner.manager.delete(Token, { token: token });
        throw new BadRequestException('토큰 만료시간이 지났습니다.');
      }

      const user = await queryRunner.manager.findOne(User, {
        where: {
          email: tokenVerify.user.email,
        },
      });

      if (!user) {
        throw new NotFoundException('유저가 맞지 않습니다.');
      }

      user.is_verified_email = true;
      await queryRunner.manager.save(user);

      //사용한 토큰은 삭제
      await queryRunner.manager.remove(tokenVerify);
      await queryRunner.commitTransaction();
      return { statusCode: 201, message: '이메일 인증에 성공하였습니다.' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      if (!(err instanceof NotImplementedException)) {
        throw err;
      }
      throw new NotImplementedException('잘못된 요청입니다.');
    } finally {
      await queryRunner.release();
    }
  }

  //TODO 휴대폰 인증 로직

  //TODO 로그인 로직 - passport validate에서 불러와도됨
  async login({ email, password }: IAuthServiceLogin): Promise<LoginResponse> {
    try {
      //로그인 유저 아이디
      const user = await this.usersRepository.findOne({ where: { email } });
      if (!user) {
        throw new NotFoundException('사용자가 없습니다!');
      }

      const isCheckPassword = await bcrypt.compare(
        password,
        user.password_hash,
      );
      if (!isCheckPassword) {
        throw new UnauthorizedException('암호가 틀렸습니다!');
      }

      const refreshToken = this.setRefreshToken({ user });

      const accessToken = this.getAccessToken({ user });

      return {
        statusCode: 201,
        message: '로그인에 성공 하였습니다.',
        accessToken: `Bearer ${accessToken}`,
        refreshToken: refreshToken,
      };
    } catch (err) {
      if (!(err instanceof NotImplementedException)) {
        throw err;
      }
      throw new NotImplementedException('잘못된 요청입니다.');
    }
  }

  getAccessToken({ user }: IAuthServiceUser): string {
    return this.jwtService.sign(
      {
        sub: user.user_id,
        email: user.email,
      },
      { secret: process.env.JWT_ACCESS_TOKEN_KEY, expiresIn: '10m' },
    );
  }

  setRefreshToken({ user }: IAuthServiceUser): string {
    return this.jwtService.sign(
      { sub: user.user_id },
      { secret: process.env.JWT_REFRESH_TOKEN_KEY, expiresIn: '2w' },
    );
  }

  //!Oauth로그인 서비스 (마지막)
  // async oauthLogin({ user }: IContext) {
  //   //oauth 유저가 있지만, userProfile이 없다면, 로그인요청 하고, 가입
  //   //리턴으로 리다이렉션
  //   const oauthuser = await this.oauthUsersRepository.save();
  // }

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
      if (!(err instanceof NotImplementedException)) {
        throw err;
      }
      throw new NotImplementedException('잘못된 요청입니다.');
    }
  }

  //로그아웃 했을 때 refresh 토큰을 레디스에저장
  async addBlackList(refreshToken: string): Promise<void> {
    try {
      const expiresIn: number = 60 * 60 * 24 * 14;
      await this.cacheManager.set(refreshToken, true, expiresIn); //2주
    } catch (err) {
      if (!(err instanceof NotImplementedException)) {
        throw err;
      }
      throw new NotImplementedException('잘못된 요청입니다!');
    }
  }

  //
  async checkBlackList(refreshToken: string): Promise<boolean> {
    try {
      const result = await this.cacheManager.get(refreshToken);
      return !!result;
    } catch (err) {
      if (!(err instanceof NotImplementedException)) {
        throw err;
      }
      throw new NotImplementedException('잘못된 요청입니다.');
    }
  }
}
