import { Sex } from '../entities/user-info.entity';

export interface IUsersServiceCreate {
  password: string;
  second_password: string;
  email: string;
}
export interface IUsersServiceCheckEmail {
  email: string;
}

export interface IUsersServiceUserInfo {
  email?: string;
  nickname: string;
  age: number;
  sex: Sex;
  user_image?: string;
  phone_number: string;
  name: string;
}

export interface IUsersServiceAddFollow {
  userId: number;
  followNickname: string;
}

export interface IUsersServiceUnFollow {
  userId: number;
  followNickname: string;
}
