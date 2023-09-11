export interface IUsersServiceCreate {
  password: string;
  email: string;
}
export interface IUsersServiceCheckEmail {
  email: string;
}

export interface IUsersServiceUserInfo {
  userId?: number;
  nickname: string;
  age: number;
  sex: string;
  user_image?: string;
  phone_number: string;
}
