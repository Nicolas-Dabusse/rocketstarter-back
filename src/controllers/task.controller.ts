import { Request, Response } from 'express';
import { Task, Project, User, Category } from '../models';
import { CreateTaskRequest, UpdateTaskRequest } from '../types';

// Create a task (default status: todo)
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

// List all tasks (with optional filters)
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

// Get details of a task
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

// Update a task (only builder or project owner)
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


    // Case 1: The task has no builder and is 'todo', allow user to self-assign
    const noBuilder = !task.builder || task.builder === null || typeof task.builder === 'undefined' || task.builder === '';
    if (noBuilder && task.status === 'todo' && updateData.builder && userAddress && userAddress === updateData.builder) {
      await task.update({ ...updateData, builder: userAddress, status: 'inprogress' });
      res.status(200).json({ success: true, data: task, message: 'Task attributed to builder' });
      return;
    }

    // Case 2: The task already has a builder, only builder or project owner can update
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

// Delete a task (only project owner)
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

// Get categories of a task
export const getTaskCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);
    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }
    const categories = await task.getCategories();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Add a category to a task (only project owner)
export const addCategoryToTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { categoryId } = req.body;
    const userAddress = req.headers['x-user-address'] as string | undefined;
    const task = await Task.findByPk(id);
    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }
    const project = await Project.findByPk(task.projectId);
    if (!userAddress || userAddress !== project?.owner) {
      res.status(403).json({ success: false, error: 'Forbidden: only project owner can add category' });
      return;
    }
    const category = await Category.findByPk(categoryId);
    if (!category) {
      res.status(404).json({ success: false, error: 'Category not found' });
      return;
    }
    await task.addCategory(category);
    res.status(200).json({ success: true, message: 'Category added to task' });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Remove a category from a task (only project owner)
export const removeCategoryFromTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, categoryId } = req.params;
    const userAddress = req.headers['x-user-address'] as string | undefined;
    const task = await Task.findByPk(id);
    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }
    const project = await Project.findByPk(task.projectId);
    if (!userAddress || userAddress !== project?.owner) {
      res.status(403).json({ success: false, error: 'Forbidden: only project owner can remove category' });
      return;
    }
    const category = await Category.findByPk(categoryId);
    if (!category) {
      res.status(404).json({ success: false, error: 'Category not found' });
      return;
    }
    await task.removeCategory(category);
    res.status(200).json({ success: true, message: 'Category removed from task' });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
