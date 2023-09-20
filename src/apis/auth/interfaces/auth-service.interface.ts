import { User } from 'src/apis/users/entities/user.entity';

export interface IAuthServiceUsername {
  email: string;
}

export interface IAUthServiceSendEmail {
  email: string;
}

export interface IAuthServiceLogin {
  email: string;
  password: string;
}

export interface IAuthServiceUser {
  user_id: number;
  email: string;
  user_info_id: number;
}

export interface LoginResponse {
  statusCode: number;
  message: string;
  accessToken: string;
  refreshToken: string;
}

export interface IAuthServiceLogoutRefresh {
  refreshToken: string;
}

export interface IAuthServiceOauthLogin {
  provider: string;
  email: string;
}
