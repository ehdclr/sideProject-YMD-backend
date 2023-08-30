import { HttpExceptionFilter } from '../../commons/filters/http-exception.filter';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  Response,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendEmailDto, SendPhoneDto } from './dto/verify-email.input';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { loginDto } from './dto/auth.input';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/commons/decorators/auth.decorator';
import { Request } from 'express';
import * as cookie from 'cookie';
@ApiTags('Auth')
@Controller('auth')
@UseInterceptors(SuccessInterceptor)
@UseFilters(HttpExceptionFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({
    status: 200,
    description: '사용자 유저아이디 중복확인 완료.',
  })
  @ApiResponse({
    status: 409,
    description: '이미 있는 유저아이디 입니다.',
  })
  @ApiBody({
    description: ' username(사용자 아이디)',
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
        },
      },
    },
  })
  @ApiOperation({ summary: '사용자 아이디 중복체크' })
  @Post('check-username')
  async checkUsername(@Body('username') username: string): Promise<object> {
    const result = await this.authService.isCheckUsername({ username });
    return result;
  }

  @ApiResponse({
    status: 200,
    description: '이메일 전송에 성공하였습니다.',
  })
  @ApiResponse({
    status: 409,
    description: '이미 있는 유저아이디 입니다.',
  })
  @ApiOperation({ summary: '이메일 인증코드 전송' })
  //이메일 보내는 로직
  @Post('send-email')
  async sendEmail(@Body() { email, username }: SendEmailDto): Promise<object> {
    const result = await this.authService.sendVerificationEmail({
      email,
      username,
    });

    return result;
  }

  //이메일 인증 로직
  @ApiResponse({
    status: 200,
    description: '이메일 인증에 성공하였습니다.',
  })
  @ApiResponse({
    status: 404,
    description: '유저가 맞지 않습니다.',
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

  //TODO 추후 추가
  // @Post('send-phone')
  // async sendPhone(
  //   @Body() { phone_number, username }: SendPhoneDto,
  // ): Promise<void> {
  //   const result = await this.authService.sendVerificationPhone({
  //     phone_number,
  //     username,
  //   });

  //   return result;
  // }

  //!login
  @Post('login')
  async login(
    @Body() { username, password }: loginDto,
    @Res() res,
  ): Promise<object> {
    const result = await this.authService.login({ username, password });

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

  @UseGuards(AuthGuard('access'))
  @Post('logout')
  async logout(@Req() req: Request): Promise<object> {
    const cookies = cookie.parse(req.headers.cookie || '');
    const refreshToken = cookies['refreshToken'];

    if (!refreshToken) {
      throw new BadRequestException('리프레쉬 토큰이 없습니다.(로그인 안됨)');
    }

    this.authService.logout({ refreshToken });

    return { StatusCode: 200, message: '로그아웃에 성공했습니다.' };
  }
}
