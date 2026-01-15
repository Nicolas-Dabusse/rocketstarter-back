import {
  IsString,
  IsUrl,
  IsOptional,
  IsArray,
  IsEnum,
  IsNumber,
  IsEthereumAddress,
  IsInt,
  IsIn,
  IsDateString,
} from 'class-validator';
import { TaskStatus, TaskPriority } from '../../models/Task';
import { Sanitize, SanitizeUrl } from '../../common/decorators/sanitize.decorator';

/**
 * DTO pour créer une nouvelle tâche
 */
export class CreateTaskDto {
  @IsNumber()
  projectId: number; // Obligatoire : à quel projet appartient la task

  @IsNumber()
  @IsOptional()
  stepId?: number; // Optionnel : à quelle étape appartient la task

  @Sanitize()
  @IsString()
  title: string;

  @Sanitize(true) // Formatage basique autorisé
  @IsString()
  @IsOptional()
  description?: string;

  @SanitizeUrl()
  @IsUrl()
  @IsOptional()
  image?: string;

  @SanitizeUrl()
  @IsUrl()
  @IsOptional()
  link?: string;

  @IsEthereumAddress()
  @IsOptional()
  taskOwner?: string; // Owner de la task (différent du owner du project)

  @IsEthereumAddress()
  @IsOptional()
  builder?: string; // Builder assigné à la task

  @IsInt()
  @IsIn([1, 2, 3, 5, 8, 13]) // Points d'effort Fibonacci
  @IsOptional()
  effort?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string; // Date limite au format ISO

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus; // Par défaut : TODO

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority; // Par défaut : MEDIUM

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  categoryIds?: number[]; // IDs des catégories à associer
}
