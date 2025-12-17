import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { ChallengeRequestDto } from './dto/challenge-request.dto';
import { VerifySignatureDto } from './dto/verify-signature.dto';

/**
 * AuthController
 * Gère les endpoints d'authentification Web3
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/challenge
   * Génère un challenge (nonce + message) pour que l'utilisateur le signe
   *
   * @param dto - { address: "0x..." }
   * @returns { message: "Sign this...", nonce: "abc123..." }
   */
  @Post('challenge')
  getChallenge(@Body() dto: ChallengeRequestDto) {
    return this.authService.getChallenge(dto.address);
  }

  /**
   * POST /auth/verify
   * Vérifie la signature et retourne un JWT si valide
   *
   * @param dto - { address: "0x...", signature: "0x..." }
   * @returns { accessToken: "eyJhbGci..." }
   */
  @Post('verify')
  verifySignature(@Body() dto: VerifySignatureDto) {
    return this.authService.verifyAndLogin(dto.address, dto.signature);
  }
}
