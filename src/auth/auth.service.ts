import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validadeUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findUserByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: Omit<User, 'password'>) {
    const payload = {
      sub: user.id,
      email: user.email,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async confirmEmail(token: string): Promise<void> {
    try {
      const payload = this.jwtService.verify(token, { algorithms: ['RS256'] });

      if (payload.purpose !== 'email_confirmation') {
        throw new BadRequestException('Propósito do token inválido');
      }

      const userId = payload.sub;
      const user = await this.usersService.findUserById(userId);

      if (!user) {
        throw new BadRequestException('Usuário não encontrado');
      }

      if (user.isConfirmed) {
        throw new BadRequestException('E-mail já foi confirmado');
      }

      await this.usersService.confirmUserEmail(userId);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('Token de confirmação expirado');
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Token de confirmação inválido');
    }
  }
}
