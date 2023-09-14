import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

type RefreshPayload = {
  sub: string;
};

export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor() {
    super({
      jwtFromRequest: (req) => {
        const cookie = req.headers.cookie;
        const refreshToken = cookie.replace('refreshToken=', '');
        return refreshToken;
      },
      secretOrKey: process.env.JWT_REFRESH_TOKEN_KEY,
    });
  }

  validate(payload: RefreshPayload) {
    return {
      id: payload.sub,
    };
  }
}
