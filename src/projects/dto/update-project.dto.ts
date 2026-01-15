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
import {
  Sanitize,
  SanitizeUrl,
} from '../../common/decorators/sanitize.decorator';

/**
 * DTO pour mettre à jour un projet
 * Note : Le champ "bank" n'est PAS modifiable ici
 * → Il est synchronisé automatiquement depuis la blockchain
 */
export class UpdateProjectDto {
  @Sanitize()
  @IsString()
  @IsOptional()
  name?: string;

  @Sanitize(true)
  @IsString()
  @IsOptional()
  description?: string;

  @SanitizeUrl()
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
