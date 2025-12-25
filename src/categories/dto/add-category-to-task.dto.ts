import { IsInt, IsNotEmpty, IsArray, ArrayMinSize } from 'class-validator';

export class AddCategoryToTaskDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @IsNotEmpty()
  categoryIds: number[];
}
