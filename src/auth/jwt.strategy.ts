import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as fs from 'fs';
import { getKeyPath } from '../utils/getKeyPath';
import { Request } from 'express';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Extrai o JWT do cookie 'jwt'
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

  async validate(payload): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.findUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }
    if (!user.isConfirmed) {
      throw new UnauthorizedException(
        'Por favor, confirme seu e-mail antes de prosseguir',
      );
    }
    const { password, ...result } = user;
    return result;
  }
}
