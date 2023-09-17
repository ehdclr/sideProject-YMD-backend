import { HttpExceptionFilter } from '../../commons/filters/http-exception.filter';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  AddFollowDto,
  AddUserInfoDto,
  SignupUserDto,
  unFollowDto,
} from './dto/signup-user.input';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/commons/decorators/auth.decorator';
import { UserResponseDto } from './dto/user-response.dto';

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

  @Post('/:email/userinfo')
  @ApiOperation({ summary: '사용자 추가정보' })
  @ApiResponse({ status: 201, description: '사용자 정보 등록 완료.' })
  @ApiResponse({ status: 401, description: '비밀번호가 일치하지 않습니다!' })
  @ApiResponse({ status: 400, description: '사용자 정보를 모두 입력해주세요!' })
  @ApiResponse({
    status: 404,
    description: '해당 이메일을 가진 사용자를 찾을 수 없습니다!',
  })
  @ApiResponse({ status: 404, description: '사용자 아이디 값이 없습니다.' })
  @ApiResponse({ status: 409, description: '이미 등록된 닉네임입니다!' })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  async addUserInfo(
    @Param('email') email: string,
    @Body() adduserInfoDto: AddUserInfoDto,
  ): Promise<any> {
    return this.usersService.addUserInfo({ email, ...adduserInfoDto });
  }

  //TODO 사용자 팔로잉 팔로우 API
  @UseGuards(AuthGuard('access'))
  @Post('/:follow_nickname/follow')
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: '팔로우 추가' })
  @ApiResponse({ status: 201, description: '팔로우 성공!' })
  @ApiResponse({
    status: 404,
    description: '팔로잉할 사람을 찾을 수 없습니다!',
  })
  @ApiResponse({
    status: 404,
    description: '로그인한 사용자의 정보를 찾을 수 없습니다.',
  })
  @ApiResponse({
    status: 401,
    description: '자기 자신을 팔로우 할 수 없습니다!',
  })
  @ApiResponse({
    status: 409,
    description: '이미 팔로우되어 있는 상대입니다!',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청입니다.',
  })
  async addFollow(
    @Param('follow_nickname') followNickname: string,
    @CurrentUser() user,
  ): Promise<object> {
    const userId = user.user_info_id; //로그인한 유저_info_id

    const followInfo: AddFollowDto = { followNickname, userId };
    return this.usersService.addFollow(followInfo);
  }

  //TODO 팔로우 취소 API
  @UseGuards(AuthGuard('access'))
  @Delete('/:follow_nickname/follow')
  @ApiOperation({ summary: '언팔로우 ' })
  @ApiResponse({ status: 200, description: '언팔로우 했습니다!' })
  @ApiResponse({ status: 404, description: '팔로우 대상을 찾을 수 없습니다!' })
  @ApiResponse({
    status: 401,
    description: '본인을 언팔로우 할 수 없습니다!',
  })
  @ApiResponse({
    status: 404,
    description: '이미 팔로우 되어있지 않는 상대입니다.',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청입니다.',
  })
  async unFollow(
    @Param('follow_nickname') followNickname: string,
    @CurrentUser() user,
  ): Promise<object> {
    const userId = user.user_info_id;
    const followInfo: unFollowDto = { followNickname, userId };

    return this.usersService.unFollow(followInfo);
  }

  //TODO 사용자 정보 얻기

  @Get('/:user_nickname/userprofile')
  @UseGuards(AuthGuard('access'))
  @ApiParam({
    name: 'user_nickname',
    description: '닉네임',
    type: 'string',
    example: 'test',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청입니다.',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 정보를 찾았습니다!',
    type: UserResponseDto,
  })
  //메인화면에서 보이는 글
  async getUserProfile(@Param('user_nickname') userNickname: string) {
    return this.usersService.getUserProfile(userNickname);
  }

  //TODO 사용자 검색 API

  //TODO 사용자 알람 기능
}
