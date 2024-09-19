import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import * as fs from 'fs';
import { getKeyPath } from '../utils/getKeyPath';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    HttpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule], // Importa o ConfigModule para acessar variáveis de ambiente
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          fs.readFileSync(getKeyPath('public.pem'), 'utf8'),
        signOptions: {
          algorithm: 'RS256',
          expiresIn: '4h',
        },
      }),
    }),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
