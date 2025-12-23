import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from '../models/Project';
import { Category } from '../models/Category';
import { ProjectCategory } from '../models/ProjectCategory';

@Module({
  imports: [
    // Enregistrer les modèles pour l'injection
    SequelizeModule.forFeature([Project, Category, ProjectCategory]),
  ],
  providers: [ProjectsService],
  controllers: [ProjectsController],
  exports: [ProjectsService], // Exporter pour utiliser dans d'autres modules
})
export class ProjectsModule {}
