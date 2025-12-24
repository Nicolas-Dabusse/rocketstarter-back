import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from '../models/Task';
import { Project } from '../models/Project';
import { Category } from '../models/Category';
import { TaskCategory } from '../models/TaskCategory';
import { Step } from '../models/Step';

@Module({
  imports: [
    SequelizeModule.forFeature([Task, Project, Category, TaskCategory, Step]),
  ],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
