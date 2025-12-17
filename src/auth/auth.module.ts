import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SignatureService } from './services/signature.service';
import { NonceService } from './services/nonce.service';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { jwtConfig } from '../config/jwt.config';

@Module({
  imports: [PassportModule, JwtModule.register(jwtConfig)],
  controllers: [AuthController],
  providers: [SignatureService, NonceService, AuthService, JwtStrategy],
  exports: [SignatureService, NonceService, AuthService],
})
export class AuthModule {}
