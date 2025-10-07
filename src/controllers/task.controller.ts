import { Request, Response } from 'express';
import { Task, Project, User, Category } from '../models';
import { CreateTaskRequest, UpdateTaskRequest } from '../types';

// Create a task (default status: todo)
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const taskData: CreateTaskRequest = req.body;
    
  // RULE: Any created task starts with status = 0 (todo) and builder = null
  // Ignore any builder provided in the body to prevent injection
    const task = await Task.create({
      projectId: taskData.projectId,
      stepId: taskData.stepId,
      title: taskData.title,
      description: taskData.description,
      link: taskData.link,
      effort: taskData.effort,
      priority: typeof taskData.priority === 'number' ? taskData.priority : 1,
      status: 0, 
      builder: undefined,
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


  // Strict Kanban workflow
  // Status: 0=todo, 1=inprogress, 2=inreview, 3=done
  // The authority source is x-user-address in the headers
    
    const newStatus = typeof updateData.status === 'number' ? updateData.status : task.status;
    const isOwner = userAddress && userAddress === project?.owner;
    const isAssignedBuilder = userAddress && userAddress === task.builder;
    const isTaskFree = !task.builder || task.builder === '';

  // R1: Builder claims a free task (0 → 1)
  // Simplified: use x-user-address to know who acts
    if (task.status === 0 && isTaskFree && newStatus === 1 && userAddress) {
      await task.update({ builder: userAddress, status: 1 });
      res.status(200).json({ 
        success: true, 
        data: task, 
        message: 'Task claimed by builder' 
      });
      return;
    }

  // R2: Builder releases their task (1 → 0)
    if (task.status === 1 && newStatus === 0 && isAssignedBuilder) {
      await task.update({ builder: undefined, status: 0 });
      res.status(200).json({ 
        success: true, 
        data: task, 
        message: 'Task released back to todo' 
      });
      return;
    }

  // R3: Builder sends to review (1 → 2)
    if (task.status === 1 && newStatus === 2 && isAssignedBuilder) {
      await task.update({ status: 2 });
      res.status(200).json({ 
        success: true, 
        data: task, 
        message: 'Task sent to review' 
      });
      return;
    }

  // R4: Owner validates (2 → 3)
    if (task.status === 2 && newStatus === 3 && isOwner) {
      await task.update({ status: 3 });
      res.status(200).json({ 
        success: true, 
        data: task, 
        message: 'Task validated and marked as done' 
      });
      return;
    }

  // R5: Owner rejects (2 → 1)
    if (task.status === 2 && newStatus === 1 && isOwner) {
      await task.update({ status: 1 });
      res.status(200).json({ 
        success: true, 
        data: task, 
        message: 'Task rejected, back to in progress' 
      });
      return;
    }

  // R6: Owner resets a finished task (3 → 0)
    if (task.status === 3 && newStatus === 0 && isOwner) {
      await task.update({ builder: undefined, status: 0 });
      res.status(200).json({ 
        success: true, 
        data: task, 
        message: 'Task reset to todo' 
      });
      return;
    }

  // R7: Owner can manually reassign the builder
    if (isOwner && updateData.builder !== undefined) {
      await task.update({ builder: updateData.builder || undefined });
      res.status(200).json({ 
        success: true, 
        data: task, 
        message: 'Task builder updated' 
      });
      return;
    }

  // R8: Content modifications (title, description, etc.)
  // Allowed for Owner or assigned Builder
    if (userAddress && (isOwner || isAssignedBuilder)) {
      const { status: _, builder: __, ...safeUpdateData } = updateData;
      if (Object.keys(safeUpdateData).length > 0) {
        await task.update(safeUpdateData);
        res.status(200).json({ 
          success: true, 
          data: task, 
          message: 'Task updated' 
        });
        return;
      }
    }

  // No rule matches
    res.status(403).json({ 
      success: false, 
      error: 'Forbidden: workflow rule violation or unauthorized' 
    });
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

