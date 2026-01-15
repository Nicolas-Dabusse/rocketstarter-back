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
 * DTO pour mettre à jour une tâche
 */
export class UpdateTaskDto {
  @IsNumber()
  @IsOptional()
  projectId?: number;

  @IsNumber()
  @IsOptional()
  stepId?: number;

  @Sanitize()
  @IsString()
  @IsOptional()
  title?: string;

  @Sanitize(true)
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
  taskOwner?: string;

  @IsEthereumAddress()
  @IsOptional()
  builder?: string;

  @IsInt()
  @IsIn([1, 2, 3, 5, 8, 13])
  @IsOptional()
  effort?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  categoryIds?: number[];
}
