import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsEthereumAddress,
} from 'class-validator';

export enum RewardTypeDto {
  TOKEN = 'token',
  NFT = 'nft',
  REPUTATION = 'reputation',
  CUSTOM = 'custom',
}

/**
 * DTO pour créer une récompense (reward)
 * Les rewards sont en draft (onChain=false) jusqu'à publication
 */
export class CreateRewardDto {
  @IsEnum(RewardTypeDto)
  type: RewardTypeDto;

  @IsString()
  value: string; // String pour préserver la précision (crypto amounts)

  @IsOptional()
  @IsEthereumAddress()
  contractAddress?: string;

  @IsOptional()
  @IsString()
  details?: string;

  @IsNumber()
  taskId: number;
}
