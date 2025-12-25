import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Step } from '../models/Step';
import { Project } from '../models/Project';
import { CreateStepDto } from './dto/create-step.dto';
import { UpdateStepDto } from './dto/update-step.dto';

@Injectable()
export class StepsService {
  constructor(
    @InjectModel(Step)
    private stepModel: typeof Step,
    @InjectModel(Project)
    private projectModel: typeof Project,
  ) {}

  /**
   * Créer une nouvelle étape
   * Seul le propriétaire du projet peut créer des étapes
   */
  async create(
    createStepDto: CreateStepDto,
    userAddress: string,
  ): Promise<Step> {
    // Vérifier que le projet existe
    const project = await this.projectModel.findByPk(createStepDto.projectId);
    if (!project) {
      throw new NotFoundException(
        `Project with ID ${createStepDto.projectId} not found`,
      );
    }

    // Vérifier que l'utilisateur est le propriétaire du projet
    const userAddr = userAddress.toLowerCase();
    const isOwner = userAddr === project.owner?.toLowerCase();
    if (!isOwner) {
      throw new ForbiddenException('Only the project owner can create steps');
    }

    // Créer l'étape
    const step = await this.stepModel.create({
      projectId: createStepDto.projectId,
      name: createStepDto.name,
      description: createStepDto.description,
      progress: 0,
    });

    return step;
  }

  /**
   * Récupérer toutes les étapes
   */
  async findAll(): Promise<Step[]> {
    return await this.stepModel.findAll({
      include: [{ model: Project, as: 'project' }],
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Récupérer les étapes des projets dont je suis owner
   */
  async findMySteps(userAddress: string): Promise<Step[]> {
    const userAddr = userAddress.toLowerCase();

    return await this.stepModel.findAll({
      include: [
        {
          model: Project,
          as: 'project',
          where: { owner: userAddr },
        },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Récupérer toutes les étapes d'un projet
   */
  async findByProject(projectId: number): Promise<Step[]> {
    const project = await this.projectModel.findByPk(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    return await this.stepModel.findAll({
      where: { projectId },
      include: [{ model: Project, as: 'project' }],
      order: [['createdAt', 'ASC']],
    });
  }

  /**
   * Récupérer une étape par son ID
   */
  async findOne(id: number): Promise<Step> {
    const step = await this.stepModel.findByPk(id, {
      include: [{ model: Project, as: 'project' }],
    });

    if (!step) {
      throw new NotFoundException(`Step with ID ${id} not found`);
    }

    return step;
  }

  /**
   * Mettre à jour une étape
   * Seul le propriétaire du projet peut modifier
   */
  async update(
    id: number,
    updateStepDto: UpdateStepDto,
    userAddress: string,
  ): Promise<Step> {
    const step = await this.findOne(id);

    // Récupérer le projet pour vérifier le propriétaire
    const project = await this.projectModel.findByPk(step.projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Vérifier que l'utilisateur est le propriétaire du projet
    const userAddr = userAddress.toLowerCase();
    const isOwner = userAddr === project.owner?.toLowerCase();
    if (!isOwner) {
      throw new ForbiddenException('Only the project owner can update steps');
    }

    // Mettre à jour
    await step.update(updateStepDto);
    return await this.findOne(id);
  }

  /**
   * Supprimer une étape
   * Seul le propriétaire du projet peut supprimer
   */
  async remove(id: number, userAddress: string): Promise<void> {
    const step = await this.findOne(id);

    // Récupérer le projet pour vérifier le propriétaire
    const project = await this.projectModel.findByPk(step.projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Vérifier que l'utilisateur est le propriétaire du projet
    const userAddr = userAddress.toLowerCase();
    const isOwner = userAddr === project.owner?.toLowerCase();
    if (!isOwner) {
      throw new ForbiddenException('Only the project owner can delete steps');
    }

    await step.destroy();
  }
}
