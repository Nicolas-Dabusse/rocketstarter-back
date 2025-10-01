import { Request, Response } from 'express';
import { Task, Project, User, Category } from '../models';
import { CreateTaskRequest, UpdateTaskRequest } from '../types';

// Create a task (default status: todo)
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskData: CreateTaskRequest = req.body;
    const userAddress = req.headers['x-user-address'] as string | undefined;
    
    // Create task (id will be auto-generated as INTEGER AUTOINCREMENT)
    // Par défaut status = 0 (todo), priority = 1 (medium)
    const task = await Task.create({
      ...taskData,
      status: typeof taskData.status === 'number' ? taskData.status : 0,
      priority: typeof taskData.priority === 'number' ? taskData.priority : 1,
      builder: typeof taskData.builder === 'string' ? taskData.builder : undefined,
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
    
    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Task ID is required'
      });
      return;
    }
    
    const taskId = parseInt(id, 10);
    
    if (isNaN(taskId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid task ID'
      });
      return;
    }
    
    const task = await Task.findByPk(taskId);
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
    
    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Task ID is required'
      });
      return;
    }
    
    const taskId = parseInt(id, 10);
    
    if (isNaN(taskId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid task ID'
      });
      return;
    }
    
    const task = await Task.findByPk(taskId);
    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }
    const project = await Project.findByPk(task.projectId);
    const userAddress = req.headers['x-user-address'] as string | undefined;


    // Nouveau workflow Kanban
    // status: 0=todo, 1=inprogress, 2=inreview, 3=done
    // priority: 0=low, 1=medium, 2=high
    const noBuilder = !task.builder || typeof task.builder === 'undefined' || task.builder === '';
    const status = typeof updateData.status === 'number' ? updateData.status : task.status;
    // Attribution (todo -> inprogress)
    if (noBuilder && task.status === 0 && updateData.builder && userAddress && userAddress === updateData.builder && status === 1) {
      await task.update({ ...updateData, builder: userAddress, status: 1 });
      res.status(200).json({ success: true, data: task, message: 'Task attributed to builder' });
      return;
    }
    // Relâcher la tâche (inprogress -> todo)
    if (task.status === 1 && status === 0 && userAddress && userAddress === task.builder) {
      await task.update({ ...updateData, builder: undefined, status: 0 });
      res.status(200).json({ success: true, data: task, message: 'Task released to todo' });
      return;
    }
    // Demander une review (inprogress -> inreview)
    if (task.status === 1 && status === 2 && userAddress && userAddress === task.builder) {
      await task.update({ ...updateData, status: 2 });
      res.status(200).json({ success: true, data: task, message: 'Task sent to review' });
      return;
    }
    // Passer en done (inreview -> done) : seul owner ou créateur
    if (task.status === 2 && status === 3 && userAddress && (userAddress === project?.owner || userAddress === task.builder)) {
      await task.update({ ...updateData, status: 3 });
      res.status(200).json({ success: true, data: task, message: 'Task marked as done' });
      return;
    }
    // Modification générique : seul owner ou créateur
    if (userAddress && (userAddress === project?.owner || userAddress === task.builder)) {
      await task.update(updateData);
      res.status(200).json({ success: true, data: task, message: 'Task updated' });
      return;
    }
    res.status(403).json({ success: false, error: 'Forbidden: not allowed to update this task' });
  } catch (error) {
    res.status(400).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Delete a task (only project owner)
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Task ID is required'
      });
      return;
    }
    
    const taskId = parseInt(id, 10);
    
    if (isNaN(taskId)) {
      res.status(400).json({
        success: false,
        error: 'Invalid task ID'
      });
      return;
    }
    
    const task = await Task.findByPk(taskId);
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

