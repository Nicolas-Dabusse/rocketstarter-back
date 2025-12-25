import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsIn(['general', 'web3', 'backend', 'frontend', 'documentation'])
  @IsNotEmpty()
  type: string;
}
