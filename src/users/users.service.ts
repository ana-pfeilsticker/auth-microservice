import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private httpService: HttpService,
    @Inject('EMAIL_SERVICE') private readonly emailService: ClientProxy,
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

    this.emailService.emit('send_confirmation_email', message);
  }
}
