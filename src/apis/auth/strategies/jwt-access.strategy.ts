import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

type Payload = {
  sub: string;
  email: string;
  user_info_id: string;
};

export class JwtAccessStrategy extends PassportStrategy(Strategy, 'access') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_TOKEN_KEY,
    });
  }

  validate(payload: Payload): object {
    return {
      // id: payload.sub,
      user_info_id: payload.user_info_id,
      email: payload.email,
    };
  }
}
