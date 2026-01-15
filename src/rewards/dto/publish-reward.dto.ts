import { IsString, IsNumber, IsOptional, IsDate } from 'class-validator';

/**
 * DTO pour publier une récompense on-chain
 * Appelé après la transaction blockchain réussie
 */
export class PublishRewardDto {
  @IsString()
  transactionHash: string;

  @IsNumber()
  blockNumber: number;

  @IsOptional()
  @IsDate()
  publishedAt?: Date;
}
