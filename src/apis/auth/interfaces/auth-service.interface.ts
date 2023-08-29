import { User } from 'src/apis/users/entities/user.entity';

export interface IAuthServiceUsername {
  username: string;
}

export interface IAUthServiceSendEmail {
  email: string;
  username: string;
}

export interface IAuthServiceLogin {
  username: string;
  password: string;
}

export interface IAuthServiceUser {
  user: User;
}

export interface LoginResponse {
  statusCode: number;
  message: string;
  accessToken: string;
  refreshToken: string;
}
