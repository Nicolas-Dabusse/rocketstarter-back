import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
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
   * Vérifie la signature et définit un cookie httpOnly avec le JWT
   *
   * @param dto - { address: "0x...", signature: "0x..." }
   * @returns { success: true, address: "0x..." }
   */
  @Post('verify')
  verifySignature(
    @Body() dto: VerifySignatureDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken } = this.authService.verifyAndLogin(
      dto.address,
      dto.signature,
    );

    // Définir le cookie httpOnly (sécurisé)
    res.cookie('access_token', accessToken, {
      httpOnly: true, // Inaccessible via JavaScript (XSS protection)
      secure: false, // false en dev pour HTTP local
      sameSite: 'lax', // 'none' en dev pour cross-origin (127.0.0.1 <-> localhost)
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
      path: '/',
      // domain: '.votre-domaine.com', // À décommenter en production pour domaine/sous-domaines
    });

    // Retourner aussi le token dans le body pour compatibilité
    return {
      success: true,
      address: dto.address,
      accessToken, // Optionnel : pour compatibilité avec l'ancien flow
    };
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

  /**
   * POST /auth/logout
   * Déconnecte l'utilisateur en supprimant le cookie httpOnly
   */
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: false,
      sameSite: 'none',
      path: '/',
      // domain: '.votre-domaine.com', // Doit correspondre au cookie original
    });

    return {
      success: true,
      message: 'Logged out successfully',
    };
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
