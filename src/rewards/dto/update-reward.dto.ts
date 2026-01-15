import {
  IsString,
  IsOptional,
  IsEnum,
  IsEthereumAddress,
} from 'class-validator';
import { RewardTypeDto } from './create-reward.dto';

/**
 * DTO pour mettre à jour une récompense
 * Tous les champs sont optionnels
 * Note: Seuls les rewards en draft (onChain=false) sont modifiables
 */
export class UpdateRewardDto {
  @IsOptional()
  @IsEnum(RewardTypeDto)
  type?: RewardTypeDto;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsEthereumAddress()
  contractAddress?: string;

  @IsOptional()
  @IsString()
  details?: string;
}
