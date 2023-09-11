import { HttpExceptionFilter } from '../../commons/filters/http-exception.filter';
import {
  Body,
  Controller,
  Param,
  Post,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { AddUserInfoDto, SignupUserDto } from './dto/signup-user.input';
import { UsersService } from './users.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';

@ApiTags('User')
@Controller('users')
@UseInterceptors(SuccessInterceptor)
@UseFilters(HttpExceptionFilter)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/signup')
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 401, description: '이메일 인증이 되지 않았습니다!' })
  @ApiResponse({ status: 501, description: '잘못된 요청입니다.' })
  @ApiBody({
    description: '회원가입',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        password: { type: 'string' },
        phone_number: { type: 'string' },
      },
    },
  })
  async signUp(@Body() signupUserDto: SignupUserDto): Promise<object> {
    return this.usersService.create(signupUserDto);
  }

  //TODO Oauth 회원가입 로직
  // @Post('/oauth-signup')
  // @ApiOperation({ summary: 'Oauth 회원가입' })
  // @ApiResponse({ status: 201, description: 'Oauth회원 정보 등록 성공' })
  // @ApiResponse({ status: 409, description: '이메일 인증이 되지 않았습니다!' })
  // @ApiResponse({ status: 501, description: '잘못된 요청입니다.' })
  // async oauthSignUp() {
  //   return this.usersService.oauthSignUp();
  // }

  @Post('/:user-id/userinfo')
  @ApiOperation({ summary: '사용자 추가정보' })
  @ApiResponse({ status: 201, description: '사용자 정보 등록 완료.' })
  @ApiResponse({ status: 404, description: '사용자 아이디 값이 없습니다.' })
  @ApiResponse({ status: 409, description: '이미 등록된 닉네임입니다!' })
  @ApiResponse({ status: 501, description: '잘못된 요청입니다.' })
  async addUserInfo(
    @Param('user-id') userId: number,
    @Body() adduserInfoDto: AddUserInfoDto,
  ): Promise<any> {
    return this.usersService.addUserInfo({ userId, ...adduserInfoDto });
  }

  //TODO 사용자 팔로잉 팔로우 API

  //TODO 사용자 검색 API

  //TODO 사용자 알람 기능
}
