import {
  IAuthServiceLogin,
  IAuthServiceLogoutRefresh,
  IAUthServiceSendEmail,
  IAuthServiceUser,
  IAuthServiceUsername,
  LoginResponse,
} from './interfaces/auth-service.interface';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Token)
    private readonly tokensRepository: Repository<Token>,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  //아이디 중복검사하는 로직 -> 데이터베이스 임시 저장 -> 이후 이메일 전화번호 인증을 위해
  async isCheckUsername({ username }: IAuthServiceUsername): Promise<object> {
    const isExistUser = await this.usersRepository.findOne({
      where: { username },
    });
    if (isExistUser) {
      return new ConflictException('이미 있는 유저아이디 입니다.');
    }
    try {
      await this.usersRepository.save({ username, is_tmp: true }); //사용자 임시로 저장
    } catch (error) {
      throw new InternalServerErrorException('유저 정보를 저장 못했습니다.');
    }

    return { message: '사용자 유저아이디 중복확인 완료' };
  }

  async sendVerificationEmail({
    email,
    username,
  }: IAUthServiceSendEmail): Promise<object> {
    const tmpUser = await this.usersRepository.findOne({
      where: { username, is_tmp: true },
    });

    const tokenValue = crypto.randomBytes(3).toString('hex');

    const token = new Token();
    token.token = tokenValue;
    token.type = 'email';
    token.createdAt = new Date();
    token.expiresAt = new Date(Date.now() + 1000 * 60 * 3); //3분 후 만료

    token.user = tmpUser;

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

    try {
      await this.tokensRepository.save(token);
      await transporter.sendMail(mailOptions);
    } catch (error) {
      throw new InternalServerErrorException('이메일 전송에 실패하였습니다!');
    }
    return { message: '이메일 전송에 성공하였습니다.' };
  }

  async verifyEmail(token: string): Promise<object> {
    const tokenVerify = await this.tokensRepository.findOne({
      where: { token: token },
      relations: ['user'],
    });

    if (!tokenVerify) {
      throw new NotFoundException('토큰이 존재하지 않습니다.');
    }

    if (tokenVerify.expiresAt < new Date()) {
      //만료기간이 지난 토큰 제거(입력 시에만 삭제됨)
      await this.tokensRepository.delete({ token: token });
      throw new BadRequestException('토큰 만료시간이 지났습니다.');
    }

    const user = await this.usersRepository.findOne({
      where: {
        username: tokenVerify.user.username,
      },
    });

    if (!user) {
      throw new NotFoundException('유저가 맞지 않습니다.');
    }

    user.is_verified_email = true;
    await this.usersRepository.save(user);

    //사용한 토큰은 삭제
    await this.tokensRepository.remove(tokenVerify);

    return { statusCode: 200, message: '이메일 인증에 성공하였습니다.' };
  }

  //TODO 휴대폰 인증 로직

  //TODO 로그인 로직 - passport validate에서 불러와도됨
  async login({
    username,
    password,
  }: IAuthServiceLogin): Promise<LoginResponse> {
    //로그인 유저 아이디
    const user = await this.usersRepository.findOne({ where: { username } });
    if (!user) {
      throw new UnprocessableEntityException('사용자가 없습니다!');
    }

    const isCheckPassword = await bcrypt.compare(password, user.password_hash);
    if (!isCheckPassword) {
      throw new UnprocessableEntityException('암호가 틀렸습니다!');
    }

    const refreshToken = this.setRefreshToken({ user });

    const accessToken = this.getAccessToken({ user });

    return {
      statusCode: 200,
      message: '로그인에 성공 하였습니다.',
      accessToken: `Bearer ${accessToken}`,
      refreshToken: refreshToken,
    };
  }

  getAccessToken({ user }: IAuthServiceUser): string {
    return this.jwtService.sign(
      {
        sub: user.user_id,
        username: user.username,
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

  //로그아웃 로직
  async logout({ refreshToken }: IAuthServiceLogoutRefresh) {
    //블랙 리스트에 추가 (레디스)
    await this.addBlackList(refreshToken);

    //잘 추가 되었는지 확인
    const isBlacklisted = await this.checkBlackList(refreshToken);
    if (!isBlacklisted) {
      throw new InternalServerErrorException('로그아웃 되지 않았습니다!');
    }
  }

  //로그아웃 했을 때 refresh 토큰을 레디스에저장
  async addBlackList(refreshToken: string): Promise<void> {
    try {
    } catch (error) {
      throw new InternalServerErrorException('로그아웃 할 수 없습니다!');
    }
    const expiresIn: number = 60 * 60 * 24 * 14;
    await this.cacheManager.set(refreshToken, true, expiresIn); //2주
  }

  //
  async checkBlackList(refreshToken: string): Promise<boolean> {
    const result = await this.cacheManager.get(refreshToken);
    return !!result;
  }
}
