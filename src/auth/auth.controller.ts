import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import * as crypto from 'crypto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UsePipes(new ValidationPipe())
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validadeUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Email ou senha incorretos');
    }

    if (!user.isConfirmed) {
      throw new UnauthorizedException(
        'Por favor valide seu email para liberar a conta',
      );
    }

    const token = await this.authService.login(user);

    res.cookie('jwt', token.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 4 * 60 * 60 * 1000,
    });

    const csrfToken = crypto.randomBytes(24).toString('hex');

    res.cookie('csrf_token', csrfToken, {
      httpOnly: false,
      secure: true,
      sameSite: 'strict',
      maxAge: 14400000,
    });

    return { message: 'Login realizado com sucesso', csrfToken };
  }

  @Get('confirm-email')
  async confirmEmail(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token de confirmação é necessário!');
    }

    try {
      await this.authService.confirmEmail(token);
      return { message: 'E-mail confirmado com sucesso!' };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
