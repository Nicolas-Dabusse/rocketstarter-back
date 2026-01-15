import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { Sanitize } from '../../common/decorators/sanitize.decorator';

export class CreateCategoryDto {
  @Sanitize()
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsIn(['general', 'web3', 'backend', 'frontend', 'documentation'])
  @IsNotEmpty()
  type: string;
}
