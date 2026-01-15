import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { RewardsService } from './rewards.service';
import { RewardsController } from './rewards.controller';
import { Reward } from '../models/Reward';
import { Task } from '../models/Task';
import { Project } from '../models/Project';

@Module({
  imports: [SequelizeModule.forFeature([Reward, Task, Project])],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
