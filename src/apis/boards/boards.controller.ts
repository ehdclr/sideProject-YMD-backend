import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/commons/decorators/auth.decorator';
import { HttpExceptionFilter } from 'src/commons/filters/http-exception.filter';
import { SuccessInterceptor } from 'src/commons/interceptors/success.interceptor';
import { BoardsService } from './boards.service';
import {
  BoardDetailResponseDto,
  BoardsListResponseDto,
} from './dto/boardList-response.dto';
import { CreateBoardDto } from './dto/create-board.input';
import { UpdateBoardDto } from './dto/update-board.input';

@ApiTags('Boards')
@Controller('boards')
@UseInterceptors(SuccessInterceptor)
@UseFilters(HttpExceptionFilter)
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  //   //TODO 게시물 생성하기
  @UseGuards(AuthGuard('access'))
  @Post('/')
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: '게시물 생성하기' })
  @ApiResponse({ status: 201, description: '게시물 등록에 성공했습니다!' })
  @ApiResponse({
    status: 401,
    description: '제목 혹은 내용 공개여부를 입력해주세요!',
  })
  @ApiResponse({ status: 404, description: '사용자 정보가 없습니다!' })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  async createBoard(
    @CurrentUser() user,
    @Body() createBoardDto: CreateBoardDto,
  ): Promise<object> {
    const user_info_id = user.user_info_id;
    return this.boardsService.createBoard({ user_info_id, ...createBoardDto });
  }

  //TODO 게시글 전체 읽어들이기

  @UseGuards(AuthGuard('access'))
  @Get('/')
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: '모든 게시물 가져오기' })
  @ApiResponse({
    status: 200,
    description: '모든 게시물 가져오기',
    type: BoardsListResponseDto,
  })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  async getBoards(@CurrentUser() user): Promise<object> {
    const curUserId = user.user_info_id;
    return this.boardsService.getBoards(curUserId);
  }

  //TODO 원하는 게시글 읽어들이기
  @UseGuards(AuthGuard('access'))
  @Get('/:board_id')
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: '선택한 게시물 가져오기' })
  @ApiResponse({
    status: 200,
    description: '선택한 게시물 가져오기',
    type: BoardDetailResponseDto,
  })
  @ApiResponse({ status: 401, description: '비공개 글입니다. 볼 수 없습니다.' })
  @ApiResponse({
    status: 401,
    description: '팔로우한 유저의 게시물이 아닙니다.',
  })
  @ApiResponse({ status: 404, description: '해당하는 게시글이 없습니다!' })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  async getBoardDetail(
    @Param('board_id') id: string,
    @CurrentUser() user,
  ): Promise<object> {
    const curUserId = user.user_info_id;
    return this.boardsService.getBoardDetail({ id, curUserId });
  }

  // //TODO 게시글 수정하기
  @UseGuards(AuthGuard('access'))
  @Patch(':board_id')
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: '게시물 수정하기' })
  @ApiResponse({ status: 401, description: '수정 권한이 없는 게시물입니다!' })
  @ApiResponse({ status: 404, description: '수정하려는 게시물이 없습니다!' })
  @ApiResponse({ status: 200, description: '게시물 수정 성공' })
  async updateBoard(
    @Param('board_id') boardId: string,
    @CurrentUser() user,
    @Body() updateBoard: UpdateBoardDto,
  ): Promise<object> {
    const curUserId = user.user_info_id;

    return this.boardsService.updateBoard({
      boardId,
      ...updateBoard,
      curUserId,
    });
  }

  //TODO 게시글 삭제하기
  @UseGuards(AuthGuard('access'))
  @Delete(':board_id')
  @ApiBearerAuth('accessToken')
  @ApiOperation({ summary: '게시물 삭제하기' })
  @ApiResponse({
    status: 401,
    description: '해당 게시물에 삭제 권한이 없는 계정입니다!',
  })
  @ApiResponse({ status: 404, description: '삭제하려는 게시물이 없습니다!' })
  @ApiResponse({ status: 200, description: '게시물이 삭제 되었습니다.' })
  async deleteBoard(
    @Param('board_id') boardId: string,
    @CurrentUser() user,
  ): Promise<object> {
    const curUserId = user.user_info_id;

    return this.boardsService.deleteBoard({
      boardId,
      curUserId,
    });
  }
}
