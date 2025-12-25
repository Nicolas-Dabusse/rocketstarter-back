import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { AddCategoryToTaskDto } from './dto/add-category-to-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('tasks/:taskId')
  getTaskCategories(@Param('taskId') taskId: string) {
    return this.categoriesService.getTaskCategories(+taskId);
  }

  @Post('tasks/:taskId')
  addCategoriesToTask(
    @Param('taskId') taskId: string,
    @Body() addCategoryDto: AddCategoryToTaskDto,
    @Request() req: any,
  ) {
    return this.categoriesService.addCategoriesToTask(
      +taskId,
      addCategoryDto,
      req.user.address,
    );
  }

  @Delete('tasks/:taskId/categories/:categoryId')
  async removeCategoryFromTask(
    @Param('taskId') taskId: string,
    @Param('categoryId') categoryId: string,
    @Request() req: any,
  ) {
    await this.categoriesService.removeCategoryFromTask(
      +taskId,
      +categoryId,
      req.user.address,
    );
    return { message: 'Category removed from task successfully' };
  }
}
