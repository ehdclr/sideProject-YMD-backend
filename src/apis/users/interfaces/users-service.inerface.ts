export interface IUsersServiceCreate {
  password: string;
  email: string;
}
export interface IUsersServiceCheckEmail {
  email: string;
}

export interface IUsersServiceUserInfo {
  email?: string;
  nickname: string;
  age: number;
  sex: string;
  user_image?: string;
  phone_number: string;
  name: string;
}

export interface IUsersServiceAddFollow {
  userId: number;
  followNickname: string;
}
