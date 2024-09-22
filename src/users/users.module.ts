import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import * as fs from 'fs';
import { getKeyPath } from '../utils/getKeyPath';
import { HttpModule } from '@nestjs/axios';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    PrismaModule,
    HttpModule,
    JwtModule.register({
      privateKey: fs.readFileSync(getKeyPath('private.pem')),

      publicKey: fs.readFileSync(getKeyPath('public.pem')),
      signOptions: {
        algorithm: 'RS256',
        expiresIn: '4h',
      },
    }),
    EmailModule,
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
