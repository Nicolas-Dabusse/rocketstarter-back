import { IsInt, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { Sanitize } from '../../common/decorators/sanitize.decorator';

export class CreateStepDto {
  @IsInt()
  @IsNotEmpty()
  projectId: number;

  @Sanitize()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Sanitize(true)
  @IsString()
  @IsOptional()
  description?: string;
}
