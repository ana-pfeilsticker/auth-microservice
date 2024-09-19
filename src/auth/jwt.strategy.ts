import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as fs from 'fs';
import { getKeyPath } from '../utils/getKeyPath';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: fs.readFileSync(getKeyPath('public.pem'), 'utf8'),
      algorithms: ['RS256'],
    });
  }
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
