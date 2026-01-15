import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Sanitize } from '../../common/decorators/sanitize.decorator';

export class UpdateStepDto {
  @Sanitize()
  @IsString()
  @IsOptional()
  name?: string;

  @Sanitize(true)
  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;
}
