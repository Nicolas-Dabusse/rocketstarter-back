import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Category } from '../models/Category';
import { Task } from '../models/Task';
import { TaskCategory } from '../models/TaskCategory';
import { CreateCategoryDto } from './dto/create-category.dto';
import { AddCategoryToTaskDto } from './dto/add-category-to-task.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category)
    private categoryModel: typeof Category,
    @InjectModel(Task)
    private taskModel: typeof Task,
    @InjectModel(TaskCategory)
    private taskCategoryModel: typeof TaskCategory,
  ) {}

  /**
   * Créer une nouvelle catégorie (admin only dans le futur)
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Vérifier si la catégorie existe déjà
    const existing = await this.categoryModel.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existing) {
      throw new BadRequestException(
        `Category "${createCategoryDto.name}" already exists`,
      );
    }

    return await this.categoryModel.create({
      name: createCategoryDto.name,
      type: createCategoryDto.type,
    });
  }

  /**
   * Récupérer toutes les catégories
   */
  async findAll(): Promise<Category[]> {
    return await this.categoryModel.findAll({
      order: [
        ['type', 'ASC'],
        ['name', 'ASC'],
      ],
    });
  }

  /**
   * Récupérer les catégories d'une tâche
   */
  async getTaskCategories(taskId: number): Promise<Category[]> {
    const task = await this.taskModel.findByPk(taskId, {
      include: [{ model: Category, as: 'categories' }],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    return task.categories || [];
  }

  /**
   * Ajouter des catégories à une tâche
   * Seul le taskOwner ou un admin peut modifier
   */
  async addCategoriesToTask(
    taskId: number,
    addCategoryDto: AddCategoryToTaskDto,
    userAddress: string,
  ): Promise<void> {
    const task = await this.taskModel.findByPk(taskId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    // Vérifier que l'utilisateur est le taskOwner
    const userAddr = userAddress.toLowerCase();
    const isTaskOwner = userAddr === task.taskOwner?.toLowerCase();
    if (!isTaskOwner) {
      throw new ForbiddenException('Only the task owner can modify categories');
    }

    // Vérifier que toutes les catégories existent
    for (const categoryId of addCategoryDto.categoryIds) {
      const category = await this.categoryModel.findByPk(categoryId);
      if (!category) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      }
    }

    // Supprimer les anciennes associations
    await this.taskCategoryModel.destroy({ where: { taskId } });

    // Créer les nouvelles associations
    const links = addCategoryDto.categoryIds.map((categoryId) => ({
      taskId,
      categoryId,
    }));
    await this.taskCategoryModel.bulkCreate(links);
  }

  /**
   * Retirer une catégorie d'une tâche
   */
  async removeCategoryFromTask(
    taskId: number,
    categoryId: number,
    userAddress: string,
  ): Promise<void> {
    const task = await this.taskModel.findByPk(taskId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    // Vérifier que l'utilisateur est le taskOwner
    const userAddr = userAddress.toLowerCase();
    const isTaskOwner = userAddr === task.taskOwner?.toLowerCase();
    if (!isTaskOwner) {
      throw new ForbiddenException('Only the task owner can modify categories');
    }

    // Supprimer l'association
    const deleted = await this.taskCategoryModel.destroy({
      where: { taskId, categoryId },
    });

    if (deleted === 0) {
      throw new NotFoundException(
        `Category ${categoryId} is not associated with task ${taskId}`,
      );
    }
  }
}
