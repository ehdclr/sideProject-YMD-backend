export interface IUsersServiceCreate {
  username: string;
  password: string;
  email: string;
  phone_number: string;
}
export interface IUsersServiceCheckEmail {
  email: string;
}