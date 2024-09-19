import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import * as fs from 'fs';
import { getKeyPath } from '../utils/getKeyPath';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      privateKey: fs.readFileSync(getKeyPath('private.pem')),

      publicKey: fs.readFileSync(getKeyPath('public.pem')),
      signOptions: {
        algorithm: 'RS256',
        expiresIn: '4h',
      },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
