import { Request, Response } from 'express';
import { Task, Project, User, Category } from '../models';
import { CreateTaskRequest, UpdateTaskRequest } from '../types';

// Create a task (default status: todo)
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskData: CreateTaskRequest = req.body;
    const userAddress = req.headers['x-user-address'] as string | undefined;

    // Vérification : l'utilisateur doit être authentifié
    if (!userAddress) {
      res.status(401).json({
        success: false,
        error: 'User address required in x-user-address header'
      });
      return;
    }

    // Vérification : le projet existe
    const project = await Project.findByPk(taskData.projectId);
    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found'
      });
      return;
    }

    // NOUVELLE RÈGLE : Le créateur de la task devient automatiquement taskOwner
    // La task commence toujours en status 0 (todo), builder est null
    const task = await Task.create({
      projectId: taskData.projectId,
      stepId: taskData.stepId,
      title: taskData.title,
      contractAddress: taskData.contractAddress,
      image: taskData.image,
      description: taskData.description,
      link: taskData.link,
      taskOwner: userAddress,
      builder: undefined,
      effort: taskData.effort,
      priority: typeof taskData.priority === 'number' ? taskData.priority : 1,
      status: 0,
      duration: taskData.duration,
      dueDate: taskData.dueDate,
      dueDateStatus: taskData.dueDateStatus
    });

    res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully. You are now the task owner.'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({
      success: false,
      error: errorMessage
    });
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
    
    // CONSISTENCY CHECK: Ensure tasks with status=0 have builder=null
    const cleanedTasks = tasks.map(task => {
      if (task.status === 0 && task.builder) {
        // Fix inconsistent data
        task.update({ builder: undefined });
        return { ...task.toJSON(), builder: null };
      }
      return task;
    });
    
    res.status(200).json({ success: true, data: cleanedTasks });
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

// Delete a task (project owner or task owner)
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
    
    if (!userAddress) {
      res.status(401).json({ success: false, error: 'User address required' });
      return;
    }
    
    const isProjectOwner = userAddress === project?.owner;
    const isTaskOwner = userAddress === task.taskOwner;
    
    if (!isProjectOwner && !isTaskOwner) {
      res.status(403).json({ 
        success: false, 
        error: 'Forbidden: only project owner or task owner can delete' 
      });
      return;
    }
    
    await task.destroy();
    res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

