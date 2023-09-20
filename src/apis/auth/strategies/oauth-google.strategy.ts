import { Strategy } from 'passport-google-oauth20';
import { PassportStrategy } from '@nestjs/passport';

export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/login/google', //사용하는 주소 end point
      scope: ['email', 'profile'],
    });
  }

  validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (error: any, user: any) => void,
  ) {
    return {
      email: profile.emails[0].value,
      provider: 'google',
    };
  }
}
