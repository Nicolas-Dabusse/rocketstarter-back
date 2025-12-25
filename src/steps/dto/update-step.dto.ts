import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class UpdateStepDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  progress?: number;
}
