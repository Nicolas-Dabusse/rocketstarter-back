import { IsEthereumAddress, IsString, MinLength } from 'class-validator';

/**
 * DTO pour vérifier une signature et obtenir un JWT
 * Le client envoie son adresse + la signature du message
 */
export class VerifySignatureDto {
  @IsEthereumAddress()
  address: string;

  @IsString()
  @MinLength(132) // Une signature Ethereum fait 132 caractères (0x + 130 hex chars)
  signature: string;
}
