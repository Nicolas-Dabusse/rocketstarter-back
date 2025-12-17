import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { NonceService } from './nonce.service';
import { SignatureService } from './signature.service';

/**
 * AuthService - Orchestrate l'authentification Web3 avec JWT
 *
 * Flux d'authentification :
 * 1. Client demande un challenge → getChallenge(address)
 * 2. Client signe le message avec son wallet
 * 3. Client envoie la signature → verifyAndLogin(address, signature)
 * 4. Si signature valide → JWT token
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly nonceService: NonceService,
    private readonly signatureService: SignatureService,
    private readonly jwtService: JwtService, // ← Fourni automatiquement par JwtModule !
  ) {}

  /**
   * Étape 1 : Générer un challenge pour l'utilisateur
   * @param address - Adresse Ethereum du wallet
   * @returns Message à signer + nonce
   */
  getChallenge(address: string): { message: string; nonce: string } {
    // Valider le format de l'adresse
    if (!this.signatureService.isValidAddress(address)) {
      throw new UnauthorizedException('Invalid Ethereum address format');
    }

    // Créer un nonce unique (expire dans 5 minutes)
    const nonce = this.nonceService.create(address);

    // Générer le message à signer (même format que votre ancien code)
    const message = this.signatureService.generateMessage(nonce);

    return { message, nonce };
  }

  /**
   * Étape 2 : Vérifier la signature et générer un JWT
   * @param address - Adresse Ethereum du wallet
   * @param signature - Signature du message par le wallet
   * @returns JWT access token
   */
  verifyAndLogin(address: string, signature: string): { accessToken: string } {
    // Récupérer le nonce (sans le supprimer encore)
    const nonce = this.nonceService.get(address);
    if (!nonce) {
      throw new UnauthorizedException(
        'No valid challenge found. Please request a new challenge.',
      );
    }

    // Regénérer le message original
    const message = this.signatureService.generateMessage(nonce);

    // Vérifier que la signature correspond bien au message + address
    const result = this.signatureService.verify(message, signature);
    if (!result.isValid || result.recoveredAddress !== address.toLowerCase()) {
      throw new UnauthorizedException('Invalid signature');
    }

    // ✅ Signature valide ! Supprimer le nonce pour éviter les replays
    this.nonceService.consume(address);

    // Créer un JWT token
    // Payload : { address, iat (issued at), exp (expiration) }
    const payload = { address };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }
}
