import { IsInt, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateStepDto {
  @IsInt()
  @IsNotEmpty()
  projectId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
