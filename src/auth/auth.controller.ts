import { Body, Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { ChallengeRequestDto } from './dto/challenge-request.dto';
import { VerifySignatureDto } from './dto/verify-signature.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';

/**
 * AuthController
 * Gère les endpoints d'authentification Web3
 */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

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

  /**
   * GET /auth/me
   * Retourne les informations de l'utilisateur connecté
   * Protégé par JWT
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req: any) {
    return await this.usersService.findOne(req.user.address);
  }

  // ⚠️ ENDPOINT DE TEST - Décommenter uniquement pour les tests sans wallet
  // À SUPPRIMER EN PRODUCTION !
  // @Post('test-token')
  // getTestToken(@Body() dto: ChallengeRequestDto) {
  //   const payload = { address: dto.address };
  //   const accessToken = this.authService['jwtService'].sign(payload);
  //   return { accessToken };
  // }
}
