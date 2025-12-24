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

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  image?: string;

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
