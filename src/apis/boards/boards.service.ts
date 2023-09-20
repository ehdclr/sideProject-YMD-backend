import { DataSource, In, Not, Repository } from 'typeorm';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Board, PrivacyLevel } from './entities/board.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserInfo } from '../users/entities/user-info.entity';
import runInTransaction from 'src/commons/utils/transaction.utils';
import { Follow } from '../users/entities/follow.entity';
import {
  IBoardsServiceCreateBoard,
  IBoardsServiceDeleteBoard,
  IBoardsServiceGetBoardDetail,
  IBoardsServiceUpdateBoard,
} from './interfaces/board-service.interface';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private readonly boardRepository: Repository<Board>,
    @InjectRepository(UserInfo)
    private readonly userInfoRepository: Repository<UserInfo>,
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    private readonly dataSource: DataSource,
  ) {}

  async createBoard(createBoard: IBoardsServiceCreateBoard): Promise<object> {
    return runInTransaction(this.dataSource, async (manager) => {
      const { user_info_id, title, contents, board_image, is_private } =
        createBoard;
      if (!title || !contents || !is_private) {
        throw new UnauthorizedException(
          '제목 혹은 내용 공개여부를 입력해주세요!',
        );
      }

      const userInfo = await manager.findOne(UserInfo, {
        where: { id: user_info_id },
      });
      if (!userInfo) {
        throw new NotFoundException('사용자 정보가 없습니다!');
      }
      const board = this.boardRepository.create({
        title,
        contents,
        board_image,
        is_private,
        userInfo,
      });
      await manager.save(board);
      return { statusCode: 201, message: '게시물 등록에 성공했습니다!' };
    });
  }

  //모든 게시글 볼때 (메인화면, 맞팔인 친구 글도 보여야함)
  //맞팔 상태가 아니면 공개글만 보임
  async getBoards(curUserId: number): Promise<object> {
    return runInTransaction(this.dataSource, async (manager) => {
      const boardsList = [];

      //모두에게 공개된 것
      const publicBoards = await manager.find(Board, {
        where: { is_private: PrivacyLevel.PUBLIC },
        relations: ['userInfo'],
        order: {
          date: 'DESC',
        },
      });

      boardsList.push(
        ...publicBoards.map((el) => {
          return {
            title: el.title,
            contents: el.contents,
            date: el.date,
            is_private: el.is_private,
            author: el.userInfo.nickname,
            user_info_id: el.user_info_id,
          };
        }),
      );

      // 팔로우한 계정 정보 찾기

      const mutualFollows = await manager.find(Follow, {
        where: [{ followerId: curUserId }, { followingId: curUserId }],
      });

      //맞팔인 사용자 id 값
      const mutualUserIds = mutualFollows.map((follow) => follow.followingId);

      const friendsBoards = await manager.find(Board, {
        where: {
          is_private: PrivacyLevel.ONLY_FRIENDS,
          user_info_id: In(mutualUserIds),
        },
        relations: ['userInfo'],
        order: {
          date: 'DESC',
        },
      });

      boardsList.push(
        ...friendsBoards.map((el) => {
          return {
            title: el.title,
            contents: el.contents,
            date: el.date,
            is_private: el.is_private,
            author: el.userInfo.nickname,
            user_info_id: el.user_info_id,
          };
        }),
      );
      const result = boardsList.sort((a, b) => {
        if (a.date > b.date) return -1;
        else if (a.date < b.date) return 1;
        else return 0;
      });
      // .filter((el) => el.user_info_id !== curUserId); //본인 게시물 빼고

      //TODO 좋아요수 , 댓글 수 가져와야함

      return { statusCode: 200, message: '모든 게시물 가져오기', result };
    });
  }

  //TODO 원하는 게시물 눌러보기
  async getBoardDetail({
    id,
    curUserId,
  }: IBoardsServiceGetBoardDetail): Promise<object> {
    return runInTransaction(this.dataSource, async (manager) => {
      const board = await manager.findOne(Board, {
        where: { id },
        relations: ['userInfo'],
      });
      const result = {
        title: board.title,
        contents: board.contents,
        date: board.date,
        is_private: board.is_private,
        author: board.userInfo.nickname,
        user_info_id: board.user_info_id,
      };

      const author = board.user_info_id; //해당 게시글 작성자 아이디값
      if (!board) {
        throw new NotFoundException('해당하는 게시글이 없습니다!');
      }
      //자신의 글을 본것이라면 그냥 봐도됨
      if (author == curUserId) {
        return { statusCode: 200, message: '게시물 가져오기', result };
      } //
      else {
        //해당 게시물에서 가져온 것이기 때문에, 만약 친구만 공개인 글이라면, url로 침투하면 해당 내용을
        //볼 수도 있다.

        //<악의적으로 url 치는 경우 >
        //해당 게시글이 비밀글이면, 보면 안된다는 오류처리
        if (board.is_private == '모두 공개') {
          return { statusCode: 200, message: '게시물 가져오기', result };
        }

        if (board.is_private == '비공개') {
          throw new UnauthorizedException('비공개 글입니다. 볼 수 없습니다');
        }

        //1. 팔로우 하면 선택한 게시물 보게 하기(v)
        //2. 맞팔 해야지만 게시물 보게하기

        const checkUserFollowsAuthor = await manager.find(Follow, {
          where: [{ followerId: curUserId }, { followingId: author }],
        });

        // const checkAuthorFollowsUser = await manager.find(Follow, {
        //   where: [{ followerId: author }, { followingId: curUserId }],
        // });

        if (!checkUserFollowsAuthor.length) {
          throw new UnauthorizedException('팔로우한 유저의 게시물이 아닙니다.');
        }

        //TODO 댓글 좋아요 수 이런 정보들 추가적으로 가져와야야함

        return { statusCode: 200, message: '게시물 가져오기', result };
      }
    });
  }

  //TODO 게시글 수정하기
  async updateBoard(updateBoard: IBoardsServiceUpdateBoard): Promise<object> {
    const {
      boardId,
      curUserId,
      update_title,
      update_contents,
      update_board_image,
      update_is_private,
    } = updateBoard;

    return runInTransaction(this.dataSource, async (manager) => {
      try {
        const updateTarget = await manager.findOne(Board, {
          where: { id: boardId },
        });

        if (!updateTarget) {
          throw new NotFoundException('수정하려는 게시물이 없습니다!');
        }

        if (curUserId !== updateTarget.user_info_id) {
          throw new UnauthorizedException('수정 권한이 없는 게시물입니다!');
        }

        await manager.update(
          Board,
          { id: boardId },
          {
            ...updateTarget,
            title: update_title,
            contents: update_contents,
            board_image: update_board_image,
            is_private: update_is_private,
          },
        );
      } catch (err) {
        throw err;
      }

      return { statusCode: 200, message: '게시물 수정 성공' };
    });
  }

  //TODO 게시물 삭제하기
  async deleteBoard(deleteBoard: IBoardsServiceDeleteBoard): Promise<object> {
    const { boardId, curUserId } = deleteBoard;

    return runInTransaction(this.dataSource, async (manager) => {
      try {
        const targetBoard = await manager.findOne(Board, {
          where: { id: boardId },
        });

        if (!targetBoard) {
          throw new NotFoundException('삭제하려는 게시물이 없습니다!');
        }

        if (curUserId !== targetBoard.user_info_id) {
          throw new UnauthorizedException(
            '해당 게시물에 삭제 권한이 없는 계정입니다!',
          );
        }

        await manager.delete(Board, { id: boardId });
      } catch (err) {
        throw err;
      }

      return { statusCode: 200, message: '게시물이 삭제 되었습니다!' };
    });
  }
}
