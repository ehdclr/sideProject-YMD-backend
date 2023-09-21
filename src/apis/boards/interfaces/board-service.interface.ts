import { PrivacyLevel } from '../entities/board.entity';

export interface IBoardsServiceGetBoardDetail {
  id: string;
  curUserId: string;
}

export interface IBoardsServiceCreateBoard {
  user_info_id: string;
  title: string;
  contents: string;
  board_image?: string;
  is_private: PrivacyLevel;
}

export interface IBoardsServiceUpdateBoard {
  boardId: string;
  update_title?: string;
  update_contents?: string;
  update_board_image?: string;
  update_is_private?: PrivacyLevel;
  curUserId: string;
}

export interface IBoardsServiceDeleteBoard {
  boardId: string;
  curUserId: string;
}
