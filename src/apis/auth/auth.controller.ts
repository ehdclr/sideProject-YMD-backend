import { HttpExceptionFilter } from '../../commons/filters/http-exception.filter';
import {
  Body,
  Controller,
  Get,
  Post,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendEmailDto, SendPhoneDto } from './dto/verify-email.input';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

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
}
