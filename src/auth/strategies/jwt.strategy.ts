import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { jwtConfig } from '../../config/jwt.config';

/**
 * Payload du JWT après décodage
 */
export interface JwtPayload {
  address: string; // Adresse Ethereum du wallet
  iat: number; // Issued At (timestamp de création)
  exp: number; // Expiration (timestamp)
}

/**
 * Extracteur custom : lit le JWT depuis le cookie OU le header Authorization
 */
const cookieExtractor = (req: Request): string | null => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['access_token']; // Nom du cookie défini dans auth.controller.ts
  }
  return token;
};

/**
 * JwtStrategy
 * Valide les tokens JWT depuis le cookie httpOnly OU le header Authorization
 *
 * Fonctionnement :
 * 1. Passport extrait le token du cookie (ou du header en fallback)
 * 2. Vérifie la signature avec le secret
 * 3. Vérifie l'expiration
 * 4. Si valide → appelle validate() avec le payload décodé
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Extraire le token du cookie en priorité, sinon du header Authorization
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),

      // Ne pas ignorer l'expiration (rejeter les tokens expirés)
      ignoreExpiration: false,

      // Secret pour vérifier la signature (même que pour la création)
      secretOrKey: jwtConfig.secret,
    });
  }

  /**
   * Méthode appelée automatiquement si le token est valide
   * @param payload - Contenu décodé du JWT
   * @returns Objet user qui sera attaché à req.user
   */
  async validate(payload: JwtPayload) {
    // Ici tu pourrais faire des vérifications supplémentaires :
    // - Vérifier que l'user existe toujours en DB
    // - Vérifier que le compte n'est pas banni
    // Pour l'instant, on retourne simplement l'adresse

    return { address: payload.address };
  }
}
