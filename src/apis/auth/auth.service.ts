import {
  IAUthServiceSendEmail,
  IAuthServiceUsername,
} from './interfaces/auth-service.interface';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Token)
    private readonly tokensRepository: Repository<Token>,
  ) {}

  //아이디 중복검사하는 로직 -> 데이터베이스 임시 저장 -> 이후 이메일 전화번호 인증을 위해
  async isCheckUsername({ username }: IAuthServiceUsername): Promise<object> {
    const isExistUser = await this.usersRepository.findOne({
      where: { username },
    });
    if (isExistUser) {
      return new ConflictException('이미 있는 유저아이디 입니다.');
    }
    await this.usersRepository.save({ username, is_tmp: true }); //사용자 임시로 저장

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
    token.expiresAt = new Date(Date.now() + 1000 * 60 * 3); //3분 후 만료'
    token.user = tmpUser;

    this.tokensRepository.save(token);
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
      await transporter.sendMail(mailOptions);
      return { message: '이메일 전송에 성공하였습니다.' };
    } catch (error) {
      throw new InternalServerErrorException('서버 에러!');
    }
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

  //TODO 로그인 로직
}
