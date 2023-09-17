import { HttpExceptionFilter } from '../../commons/filters/http-exception.filter';
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendEmailDto } from './dto/verify-email.input';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { loginDto } from './dto/auth.input';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import * as cookie from 'cookie';
@ApiTags('Auth')
@Controller('auth')
@UseInterceptors(SuccessInterceptor)
@UseFilters(HttpExceptionFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({
    status: 201,
    description: '이메일 전송에 성공하였습니다.',
  })
  @ApiResponse({
    status: 409,
    description: '이미 등록된 메일입니다!',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청입니다.',
  })
  @ApiOperation({ summary: '이메일 인증코드 전송' })
  //이메일 보내는 로직
  @Post('send-email')
  async sendEmail(@Body() { email }: SendEmailDto): Promise<object> {
    const result = await this.authService.sendVerificationEmail({
      email,
    });

    return result;
  }

  //이메일 인증 로직
  @ApiResponse({
    status: 200,
    description: '이메일 인증에 성공하였습니다.',
  })
  @ApiResponse({
    status: 401,
    description: '토큰 만료시간이 지났습니다.',
  })
  @ApiResponse({
    status: 404,
    description: '토큰이 존재하지 않습니다.',
  })
  @ApiResponse({
    status: 404,
    description: '유저가 맞지 않습니다.',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청입니다.',
  })
  @ApiBody({
    description: 'token(이메일 인증 토큰)',
    schema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
        },
      },
    },
  })
  @ApiOperation({ summary: '이메일 인증' })
  @Post('verify-email')
  async verifyEmail(@Body('token') token: string): Promise<object> {
    return await this.authService.verifyEmail(token);
  }

  //!login
  @ApiResponse({
    status: 201,
    description: '로그인에 성공하였습니다.',
  })
  @ApiResponse({
    status: 401,
    description: '암호가 틀렸습니다!',
  })
  @ApiResponse({
    status: 404,
    description: '사용자가 없습니다!',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청입니다.',
  })
  @Post('login')
  async login(
    @Body() { email, password }: loginDto,
    @Res() res,
  ): Promise<object> {
    const result = await this.authService.login({ email, password });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      path: '/',
    });

    return res.json({
      statusCode: result.statusCode,
      message: result.message,
      accessToken: result.accessToken,
    });
  }

  //TODO !Oauth로그인
  // @UseGuards(AuthGuard('google'))
  // @Post('oauthlogin')
  // async oauthLogin(@Req() req): Promise<any> {
  //   //
  //   const user = req.user; //로그인된 사용자 정보 가져오기
  //   this.authService.oauthLogin({ user });
  // }

  @ApiResponse({
    status: 201,
    description: '로그아웃에 성공했습니다.',
  })
  @ApiResponse({
    status: 401,
    description: '로그아웃 되지 않았습니다!',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청입니다!',
  })
  @ApiHeader({
    name: 'Cookie',
    description: '헤더 안에 있는 쿠키값 ',
  })
  @UseGuards(AuthGuard('access'))
  @Post('logout')
  async logout(@Req() req: Request): Promise<object> {
    const cookies = cookie.parse(req.headers.cookie || '');
    const refreshToken = cookies['refreshToken'];

    if (!refreshToken) {
      throw new BadRequestException('리프레쉬 토큰이 없습니다.(로그인 안됨)');
    }

    await this.authService.logout({ refreshToken });

    return { StatusCode: 201, message: '로그아웃에 성공했습니다.' };
  }
}
