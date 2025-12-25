import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from '../models/Category';
import { Task } from '../models/Task';
import { TaskCategory } from '../models/TaskCategory';

@Module({
  imports: [SequelizeModule.forFeature([Category, Task, TaskCategory])],
  providers: [CategoriesService],
  controllers: [CategoriesController],
  exports: [CategoriesService],
})
export class CategoriesModule {}
