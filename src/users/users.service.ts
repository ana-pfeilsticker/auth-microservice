import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private httpService: HttpService,
  ) {}

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        isConfirmed: false,
      },
    });
  }

  async confirmUserEmail(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        isConfirmed: true,
      },
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async generateEmailConfirmationToken(userID: string): Promise<string> {
    const payload = {
      sub: userID,
      purpose: 'email_confirmation',
    };

    return this.jwtService.sign(payload, {
      algorithm: 'RS256',
      expiresIn: '24h',
    });
  }

  async sendConfirmationEmail(email: string, token: string): Promise<void> {
    const confirmationUrl = `http://localhost:3000/confirm-email?token=${token}`;
    const message = {
      email,
      confirmationUrl,
    };

    try {
      const emailServiceUrl =
        'http://localhost:4000/email/send-confirmation-email';

      await lastValueFrom(
        this.httpService.post(emailServiceUrl, message, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    } catch (error) {
      throw new BadRequestException('Erro ao enviar e-mail de confirmação');
    }
  }
}
