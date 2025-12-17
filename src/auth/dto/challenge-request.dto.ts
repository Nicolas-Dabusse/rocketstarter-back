import { IsEthereumAddress } from 'class-validator';

/**
 * DTO pour demander un challenge d'authentification
 * Le client envoie son adresse Ethereum
 */
export class ChallengeRequestDto {
  @IsEthereumAddress()
  address: string;
}
