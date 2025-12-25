import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Project } from '../models/Project';
import { Category } from '../models/Category';
import { ProjectCategory } from '../models/ProjectCategory';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project)
    private projectModel: typeof Project,
    @InjectModel(Category)
    private categoryModel: typeof Category,
    @InjectModel(ProjectCategory)
    private projectCategoryModel: typeof ProjectCategory,
  ) {}

  /**
   * Créer un nouveau projet
   * @param createProjectDto - Données du projet à créer
   * @param ownerId - Adresse Ethereum du propriétaire (depuis le JWT)
   * @returns Projet créé
   */
  async create(
    createProjectDto: CreateProjectDto,
    ownerId: string,
  ): Promise<Project> {
    // 1. Créer le projet
    const project = await this.projectModel.create({
      name: createProjectDto.name,
      description: createProjectDto.description,
      logoUrl: createProjectDto.logoUrl,
      bank: createProjectDto.bank || '0', // Par défaut : 0
      whitelist: createProjectDto.whitelist || [],
      status: createProjectDto.status || 'Draft', // Par défaut : Draft
      owner: ownerId.toLowerCase(), // Normaliser l'adresse
    });

    // 2. Associer les catégories si fournies
    if (
      createProjectDto.categoryIds &&
      createProjectDto.categoryIds.length > 0
    ) {
      const categoryLinks = createProjectDto.categoryIds.map((categoryId) => ({
        projectId: project.id,
        categoryId: categoryId,
      }));

      await this.projectCategoryModel.bulkCreate(categoryLinks);
    }

    // 3. Recharger le projet avec ses relations
    const reloadedProject = await this.projectModel.findByPk(project.id, {
      include: [{ association: 'ownerUser' }, { association: 'categories' }],
    });

    if (!reloadedProject) {
      throw new NotFoundException(`Project creation failed`);
    }

    return reloadedProject;
  }

  /**
   * Récupérer tous les projets
   * @returns Liste de tous les projets avec leurs relations
   */
  async findAll(): Promise<Project[]> {
    return await this.projectModel.findAll({
      include: [{ association: 'owner' }, { association: 'categories' }],
      order: [['createdAt', 'DESC']],
    });
  }

  /**
   * Récupérer un projet par son ID
   * @param id - UUID du projet
   * @returns Projet avec ses relations
   */
  async findOne(identifier: string): Promise<Project> {
    let project: Project | null;

    // Tenter de parser comme ID numérique
    const id = parseInt(identifier, 10);
    if (!isNaN(id)) {
      // C'est un ID numérique
      project = await this.projectModel.findByPk(id, {
        include: [
          { association: 'owner' },
          { association: 'categories' },
          { association: 'steps' },
        ],
      });
    } else {
      // C'est un slug
      project = await this.projectModel.findOne({
        where: { slug: identifier },
        include: [
          { association: 'owner' },
          { association: 'categories' },
          { association: 'steps' },
        ],
      });
    }

    if (!project) {
      throw new NotFoundException(
        `Project with identifier "${identifier}" not found`,
      );
    }

    return project;
  }

  /**
   * Mettre à jour un projet
   * @param id - UUID du projet
   * @param updateProjectDto - Données à mettre à jour
   * @param userId - Adresse Ethereum de l'utilisateur (pour vérifier ownership)
   * @returns Projet mis à jour
   */
  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
  ): Promise<Project> {
    const project = await this.findOne(id);

    // Vérifier que l'utilisateur est bien le propriétaire
    if (project.owner !== userId.toLowerCase()) {
      throw new ForbiddenException('You are not the owner of this project');
    }

    // Mettre à jour les champs du projet
    await project.update({
      name: updateProjectDto.name,
      description: updateProjectDto.description,
      logoUrl: updateProjectDto.logoUrl,
      whitelist: updateProjectDto.whitelist,
      status: updateProjectDto.status,
    });

    // Mettre à jour les catégories si fournies
    if (updateProjectDto.categoryIds !== undefined) {
      // Supprimer les anciennes associations
      await this.projectCategoryModel.destroy({ where: { projectId: id } });

      // Créer les nouvelles associations
      if (updateProjectDto.categoryIds.length > 0) {
        const categoryLinks = updateProjectDto.categoryIds.map(
          (categoryId) => ({
            projectId: id,
            categoryId: categoryId,
          }),
        );
        await this.projectCategoryModel.bulkCreate(categoryLinks);
      }
    }

    // Recharger le projet avec ses relations
    return await this.findOne(id);
  }

  /**
   * Supprimer un projet
   * @param id - UUID du projet
   * @param userId - Adresse Ethereum de l'utilisateur (pour vérifier ownership)
   */
  async remove(id: string, userId: string): Promise<void> {
    const project = await this.findOne(id);

    // Vérifier que l'utilisateur est bien le propriétaire
    if (project.owner !== userId.toLowerCase()) {
      throw new ForbiddenException('You are not the owner of this project');
    }

    await project.destroy();
  }

  /**
   * Récupérer tous les projets d'un utilisateur
   * @param ownerId - Adresse Ethereum du propriétaire
   * @returns Liste des projets de l'utilisateur
   */
  async findByOwner(ownerId: string): Promise<Project[]> {
    return await this.projectModel.findAll({
      where: { owner: ownerId.toLowerCase() },
      include: [
        { association: 'owner' },
        { association: 'categories' },
        { association: 'steps' },
      ],
      order: [['createdAt', 'DESC']],
    });
  }
}
