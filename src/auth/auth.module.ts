import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SignatureService } from './services/signature.service';
import { NonceService } from './services/nonce.service';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { jwtConfig } from '../config/jwt.config';

@Module({
  imports: [JwtModule.register(jwtConfig)],
  controllers: [AuthController],
  providers: [SignatureService, NonceService, AuthService],
  exports: [SignatureService, NonceService, AuthService],
})
export class AuthModule {}
