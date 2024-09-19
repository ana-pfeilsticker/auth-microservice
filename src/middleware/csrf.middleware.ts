import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const csrfTokenFromCookie = req.cookies['csrf_token'];
    const csrfTokenFromHeader = req.headers['x-csrf-token'];

    if (!csrfTokenFromCookie || csrfTokenFromHeader !== csrfTokenFromCookie) {
      throw new BadRequestException('CSRF token inválido ou ausente');
    }

    next();
  }
}
