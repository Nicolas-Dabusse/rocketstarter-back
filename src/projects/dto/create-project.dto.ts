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
 * DTO pour créer un nouveau projet
 */
export class CreateProjectDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  bank?: string; // DECIMAL stocké en string pour garder la précision

  @IsArray()
  @IsEthereumAddress({ each: true }) // Valide chaque adresse du tableau
  @IsOptional()
  whitelist?: string[];

  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @IsArray()
  @IsNumber({}, { each: true }) // Valide que chaque élément est un nombre
  @IsOptional()
  categoryIds?: number[]; // IDs des catégories à associer
}
