import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard
 * Guard pour protéger les routes qui nécessitent un JWT valide
 * 
 * Utilisation :
 * @UseGuards(JwtAuthGuard)
 * @Get('projects')
 * getProjects(@Request() req) {
 *   console.log(req.user); // { address: "0x..." }
 * }
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // AuthGuard('jwt') utilise automatiquement JwtStrategy
  // Si le token est invalide → retourne 401 Unauthorized
  // Si le token est valide → passe à la route avec req.user
}
