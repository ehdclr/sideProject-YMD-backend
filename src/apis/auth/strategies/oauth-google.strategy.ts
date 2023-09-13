// import { validate } from 'class-validator';
// import { Strategy } from 'passport-jwt';
// import { PassportStrategy } from '@nestjs/passport';

// type OauthGooglePayload = {
//   email: string;
//   accessToken: string;
//   refreshToken: string;
//   provider_id: string;
//   profile: any;
// };

// export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
//   constructor() {
//     super({
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: '', //사용하는 주소 end point
//       scope: ['email', 'profile'],
//     });
//   }

//   validate(payload: OauthGooglePayload) {
//     const id = payload.profile.id;

//     return {
//       provider_id: id,
//       email: payload.email,
//       provider: 'google',
//     };
//   }
// }
