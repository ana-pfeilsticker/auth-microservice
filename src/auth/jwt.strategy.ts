import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as fs from 'fs';
import { getKeyPath } from '../utils/getKeyPath';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let token = null;
          if (request && request.cookies) {
            token = request.cookies['jwt'];
          }
          return token;
        },
      ]),
      secretOrKey: fs.readFileSync(getKeyPath('public.pem'), 'utf8'),
      algorithms: ['RS256'],
    });
  }
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
