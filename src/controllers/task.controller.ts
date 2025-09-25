import { Request, Response } from 'express';
import { Task, Project, User } from '../models';
import { CreateTaskRequest, UpdateTaskRequest } from '../types';

// Créer une tâche (statut par défaut todo)
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskData: CreateTaskRequest = req.body;
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const task = await Task.create({
      id: taskId,
      ...taskData,
      status: 'todo',
    });
    res.status(201).json({ success: true, data: task, message: 'Task created' });
  } catch (error) {
    res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Lister toutes les tâches (filtrage possible)
export const getAllTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, builder, projectId } = req.query;
    const where: any = {};
    if (status) where.status = status;
    if (builder) where.builder = builder;
    if (projectId) where.projectId = projectId;
    const tasks = await Task.findAll({ where });
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Détail d'une tâche
export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);
    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Modifier une tâche (builder ou owner)
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdateTaskRequest = req.body;
    const task = await Task.findByPk(id);
    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }
    const project = await Project.findByPk(task.projectId);
    const userAddress = req.headers['x-user-address'] as string | undefined;


    // Cas 1 : la tâche n'a pas de builder (null, undefined ou string vide) ET est en 'todo', on autorise l'utilisateur à s'auto-attribuer la tâche
    const noBuilder = !task.builder || task.builder === null || typeof task.builder === 'undefined' || task.builder === '';
    if (noBuilder && task.status === 'todo' && updateData.builder && userAddress && userAddress === updateData.builder) {
      await task.update({ ...updateData, builder: userAddress, status: 'inprogress' });
      res.status(200).json({ success: true, data: task, message: 'Task attributed to builder' });
      return;
    }

    // Cas 2 : la tâche a déjà un builder, seul ce builder ou le owner du projet peut modifier
    if (userAddress && userAddress !== task.builder && userAddress !== project?.owner) {
      res.status(403).json({ success: false, error: 'Forbidden: only builder or owner can update' });
      return;
    }

    await task.update(updateData);
    res.status(200).json({ success: true, data: task, message: 'Task updated' });
  } catch (error) {
    res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Supprimer une tâche (seulement owner du projet)
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);
    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }
    const project = await Project.findByPk(task.projectId);
    const userAddress = req.headers['x-user-address'] as string | undefined;
    if (!userAddress || userAddress !== project?.owner) {
      res.status(403).json({ success: false, error: 'Forbidden: only project owner can delete' });
      return;
    }
    await task.destroy();
    res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
