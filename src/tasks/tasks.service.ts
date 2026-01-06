import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Task, TaskStatus } from '../models/Task';
import { Project } from '../models/Project';
import { Category } from '../models/Category';
import { TaskCategory } from '../models/TaskCategory';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task)
    private taskModel: typeof Task,
    @InjectModel(Project)
    private projectModel: typeof Project,
    @InjectModel(Category)
    private categoryModel: typeof Category,
    @InjectModel(TaskCategory)
    private taskCategoryModel: typeof TaskCategory,
  ) {}

  /**
   * Créer une nouvelle tâche
   * Le créateur devient automatiquement taskOwner
   * Status initial = TODO, builder = null
   * @param createTaskDto - Données de la tâche
   * @param userAddress - Adresse du créateur (depuis JWT)
   */
  async create(
    createTaskDto: CreateTaskDto,
    userAddress: string,
  ): Promise<Task> {
    // Vérifier que le projet existe
    const project = await this.projectModel.findByPk(createTaskDto.projectId);
    if (!project) {
      throw new NotFoundException(
        `Project with ID ${createTaskDto.projectId} not found`,
      );
    }

    // Créer la tâche (les hooks du modèle forceront status=TODO et builder=null)
    const task = await this.taskModel.create({
      projectId: createTaskDto.projectId,
      stepId: createTaskDto.stepId,
      title: createTaskDto.title,
      description: createTaskDto.description,
      image: createTaskDto.image,
      link: createTaskDto.link,
      taskOwner: userAddress.toLowerCase(), // Créateur = taskOwner
      builder: null, // Toujours null au départ
      effort: createTaskDto.effort,
      dueDate: createTaskDto.dueDate
        ? new Date(createTaskDto.dueDate)
        : undefined,
      status: 0, // TODO (le hook BeforeCreate le forcera aussi)
      priority: createTaskDto.priority || 1, // MEDIUM par défaut
    });

    // Associer les catégories si fournies
    if (createTaskDto.categoryIds && createTaskDto.categoryIds.length > 0) {
      const categoryLinks = createTaskDto.categoryIds.map((categoryId) => ({
        taskId: task.id,
        categoryId: categoryId,
      }));
      await this.taskCategoryModel.bulkCreate(categoryLinks);
    }

    // Recharger avec relations
    const reloadedTask = await this.taskModel.findByPk(task.id, {
      include: [
        { association: 'parentProject' },
        { association: 'ownerUser' },
        { association: 'categories' },
      ],
    });

    if (!reloadedTask) {
      throw new NotFoundException('Task creation failed');
    }

    return reloadedTask;
  }

  async findAll(): Promise<Task[]> {
    return await this.taskModel.findAll({
      include: [
        { association: 'parentProject' },
        { association: 'ownerUser' },
        { association: 'categories' },
      ],
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: number): Promise<Task> {
    const task = await this.taskModel.findByPk(id, {
      include: [
        { association: 'parentProject' },
        { association: 'ownerUser' },
        { association: 'categories' },
      ],
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  /**
   * Mettre à jour une tâche (avec règles métier complexes)
   * @param id - ID de la tâche
   * @param updateTaskDto - Données à mettre à jour
   * @param userAddress - Adresse de l'utilisateur (depuis JWT)
   */
  async update(
 
    id: number,
    updateTaskDto: UpdateTaskDto,
    userAddress: string,
  ): Promise<Task> {
    const task = await this.findOne(id);
    const projectId = task.get('projectId');
    const project = await this.projectModel.findByPk(projectId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const currentStatus = task.status;
    const newStatus = updateTaskDto.status;
    const currentBuilder = task.builder;
    const userAddr = userAddress.toLowerCase();

    // AUTO-FIX: Si task status=0 mais a un builder, nettoyer
    if (currentStatus === TaskStatus.TODO && currentBuilder) {
      await task.update({ builder: null, claimedAt: null });
      // Recharger après l'auto-fix
      await task.reload();
    }

    // Mise à jour de currentBuilder après auto-fix
    const cleanedBuilder = task.builder;

    // Vérifier les rôles
    const isTaskOwner = userAddr === task.taskOwner?.toLowerCase();
    const isAssignedBuilder = userAddr === currentBuilder?.toLowerCase();

    // ==================== TRANSITIONS DE STATUT ======================================

    // RÈGLE 1: Builder claim free task (0 → 1)
    // ✅ SÉCURITÉ: Vérifier que la task est VRAIMENT libre (builder === null)
    if (
      currentStatus === TaskStatus.TODO &&
      newStatus === TaskStatus.IN_PROGRESS
    ) {
      // Protection : la task doit être libre
      if (cleanedBuilder !== null) {
        throw new ForbiddenException(
          'Task is already assigned to another builder',
        );
      }

      await task.update({
        builder: userAddr,
        status: TaskStatus.IN_PROGRESS,
        claimedAt: new Date(),
      });
      return await this.findOne(id);
    }

    // RÈGLE 2: Builder releases task (1 → 0)
    if (
      currentStatus === TaskStatus.IN_PROGRESS &&
      isAssignedBuilder &&
      newStatus === TaskStatus.TODO
    ) {
      await task.update({
        builder: null,
        status: 0,
        claimedAt: null,
      });
      // Double vérification : s'assurer que builder est bien NULL
      await task.reload();
      if (task.builder !== null) {
        throw new Error('Failed to release task: builder not set to null');
      }
      return await this.findOne(id);
    }

    // RÈGLE 3: Builder sends to review (1 → 2)
    if (
      currentStatus === TaskStatus.IN_PROGRESS &&
      isAssignedBuilder &&
      newStatus === TaskStatus.IN_REVIEW
    ) {
      await task.update({ status: TaskStatus.IN_REVIEW });
      return await this.findOne(id);
    }

    // RÈGLE 4: Builder reject review (2 → 1)
    if (
      currentStatus === TaskStatus.IN_REVIEW &&
      isAssignedBuilder &&
      newStatus === TaskStatus.IN_PROGRESS
    ) {
      await task.update({ status: TaskStatus.IN_PROGRESS });
      return await this.findOne(id);
    }

    // RÈGLE 5: Builder releases from review (2 → 0)
    if (
      currentStatus === TaskStatus.IN_REVIEW &&
      isAssignedBuilder &&
      newStatus === TaskStatus.TODO
    ) {
      await task.update({
        builder: null,
        status: TaskStatus.TODO,
        claimedAt: null,
      });
      // Double vérification : s'assurer que builder est bien NULL
      await task.reload();
      if (task.builder !== null) {
        throw new Error('Failed to release task: builder not set to null');
      }
      return await this.findOne(id);
    }

    // RÈGLE 6: TaskOwner validates task (2 → 3) avec calcul durée
    if (
      currentStatus === TaskStatus.IN_REVIEW &&
      isTaskOwner &&
      newStatus === TaskStatus.DONE
    ) {
      let durationHours = task.duration;
      if (task.claimedAt) {
        const start = new Date(task.claimedAt).getTime();
        const diffMs = Date.now() - start;
        durationHours = Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));
      }
      await task.update({ status: TaskStatus.DONE, duration: durationHours });
      return await this.findOne(id);
    }

    // RÈGLE 7: TaskOwner rejects review (2 → 1)
    if (
      currentStatus === TaskStatus.IN_REVIEW &&
      isTaskOwner &&
      newStatus === TaskStatus.IN_PROGRESS
    ) {
      await task.update({ status: TaskStatus.IN_PROGRESS });
      return await this.findOne(id);
    }

    // ==================== PROTECTIONS ====================

    // LOCK: Status 2 (IN_REVIEW) est LOCKED au builder
    if (
      currentStatus === TaskStatus.IN_REVIEW &&
      !isAssignedBuilder &&
      !isTaskOwner
    ) {
      throw new ForbiddenException(
        'Task in review is locked to assigned builder',
      );
    }

    // LOCK: TaskOwner ne peut pas réassigner pendant review
    if (
      currentStatus === TaskStatus.IN_REVIEW &&
      isTaskOwner &&
      updateTaskDto.builder !== undefined
    ) {
      throw new ForbiddenException(
        'Cannot reassign task while in review - must validate (2→3) or reject (2→1) first',
      );
    }

    // PROTECTION: Pas de skip workflow (1→3 direct interdit)
    if (
      isTaskOwner &&
      currentStatus === TaskStatus.IN_PROGRESS &&
      newStatus === TaskStatus.DONE
    ) {
      throw new ForbiddenException(
        'Cannot skip review process - task must go from in-progress (1) to review (2) first',
      );
    }

    // ==================== AUTRES MISES À JOUR ====================

    // RÈGLE 8: TaskOwner réassigne builder (sauf si en review)
    if (
      isTaskOwner &&
      updateTaskDto.builder !== undefined &&
      currentStatus !== TaskStatus.IN_REVIEW
    ) {
      await task.update({ builder: updateTaskDto.builder || null });
      return await this.findOne(id);
    }

    // RÈGLE 9: TaskOwner force changement de status (admin override)
    if (
      isTaskOwner &&
      newStatus !== undefined &&
      newStatus !== currentStatus &&
      currentStatus !== TaskStatus.IN_REVIEW &&
      !(
        currentStatus === TaskStatus.IN_PROGRESS &&
        newStatus === TaskStatus.DONE
      )
    ) {
      const updateData: { status: number; builder?: null; claimedAt?: null } = {
        status: newStatus,
      };
      if (newStatus === TaskStatus.TODO) {
        updateData.builder = null;
        updateData.claimedAt = null;
      }
      await task.update(updateData);
      return await this.findOne(id);
    }

    // RÈGLE 10: Mise à jour du contenu (title, description, etc.)
    if (isTaskOwner || isAssignedBuilder) {
      // Extraire seulement les champs de contenu (pas status/builder)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { status, builder, categoryIds, ...contentUpdates } = updateTaskDto;

      if (Object.keys(contentUpdates).length > 0) {
        await task.update(contentUpdates);
      }

      // Gérer les catégories si fournies
      if (categoryIds !== undefined) {
        await this.taskCategoryModel.destroy({ where: { taskId: id } });
        if (categoryIds.length > 0) {
          const categoryLinks = categoryIds.map((categoryId) => ({
            taskId: id,
            categoryId: categoryId,
          }));
          await this.taskCategoryModel.bulkCreate(categoryLinks);
        }
      }

      return await this.findOne(id);
    }

    // Action non autorisée
    throw new ForbiddenException(
      'Forbidden: workflow rule violation or unauthorized',
    );
  }

  async remove(id: number, userAddress: string): Promise<void> {
    const task = await this.findOne(id);
    const project = await this.projectModel.findByPk(task.projectId);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const userAddr = userAddress.toLowerCase();
    const isProjectOwner = userAddr === project.owner?.toLowerCase();
    const isTaskOwner = userAddr === task.taskOwner?.toLowerCase();

    // Seul le propriétaire du projet ou le propriétaire de la tâche peut supprimer
    if (!isProjectOwner && !isTaskOwner) {
      throw new ForbiddenException(
        'You are not authorized to delete this task',
      );
    }

    await task.destroy();
  }
}
