import { PrivacyLevel } from '../entities/board.entity';

export interface IBoardsServiceGetBoardDetail {
  id: number;
  curUserId: number;
}

export interface IBoardsServiceCreateBoard {
  user_info_id: number;
  title: string;
  contents: string;
  board_image?: string;
  is_private: PrivacyLevel;
}

export interface IBoardsServiceUpdateBoard {
  boardId: number;
  update_title?: string;
  update_contents?: string;
  update_board_image?: string;
  update_is_private?: PrivacyLevel;
  curUserId: number;
}

export interface IBoardsServiceDeleteBoard {
  boardId: number;
  curUserId: number;
}
