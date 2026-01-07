import {
  IsString,
  IsUrl,
  IsOptional,
  IsArray,
  IsEnum,
  IsNumber,
  IsEthereumAddress,
} from 'class-validator';
import { ProjectStatus } from '../../models/Project';

/**
 * DTO pour mettre à jour un projet
 * Note : Le champ "bank" n'est PAS modifiable ici
 * → Il est synchronisé automatiquement depuis la blockchain
 */
export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  // ❌ bank n'est PAS ici ! Synchronisé depuis blockchain uniquement

  @IsArray()
  @IsEthereumAddress({ each: true })
  @IsOptional()
  whitelist?: string[];

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  categoryIds?: number[];
  // slug supprimé : généré automatiquement
}
