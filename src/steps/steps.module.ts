import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { StepsService } from './steps.service';
import { StepsController } from './steps.controller';
import { Step } from '../models/Step';
import { Project } from '../models/Project';

@Module({
  imports: [SequelizeModule.forFeature([Step, Project])],
  providers: [StepsService],
  controllers: [StepsController],
  exports: [StepsService],
})
export class StepsModule {}
