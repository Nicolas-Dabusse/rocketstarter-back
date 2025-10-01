import { Request, Response } from 'express';
import Task from '../models/Task';
import Project from '../models/Project';
import Category from '../models/Category';
// Lister les catégories d'une tâche
export const getTaskCategories = async (req: Request, res: Response): Promise<void> => {
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
    const categories = await task.getCategories();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

// Ajouter une catégorie à une tâche (owner uniquement)
export const addCategoryToTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { categoryId } = req.body;
    const userAddress = req.headers['x-user-address'] as string | undefined;
    
    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Task ID is required'
      });
      return;
    }
    
    const taskId = parseInt(id, 10);
    const categoryIdInt = parseInt(categoryId, 10);
    
    if (isNaN(taskId) || isNaN(categoryIdInt)) {
      res.status(400).json({
        success: false,
        error: 'Invalid task ID or category ID'
      });
      return;
    }
    
    const task = await Task.findByPk(taskId);
    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }
    const project = await Project.findByPk(task.projectId);
    if (!userAddress || userAddress !== project?.owner) {
      res.status(403).json({ success: false, error: 'Forbidden: only project owner can add category' });
      return;
    }
    const category = await Category.findByPk(categoryIdInt);
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

// Retirer une catégorie d'une tâche (owner uniquement)
export const removeCategoryFromTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, categoryId } = req.params;
    const userAddress = req.headers['x-user-address'] as string | undefined;
    
    if (!id || !categoryId) {
      res.status(400).json({
        success: false,
        error: 'Task ID and Category ID are required'
      });
      return;
    }
    
    const taskId = parseInt(id, 10);
    const categoryIdInt = parseInt(categoryId, 10);
    
    if (isNaN(taskId) || isNaN(categoryIdInt)) {
      res.status(400).json({
        success: false,
        error: 'Invalid task ID or category ID'
      });
      return;
    }
    
    const task = await Task.findByPk(taskId);
    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }
    const project = await Project.findByPk(task.projectId);
    if (!userAddress || userAddress !== project?.owner) {
      res.status(403).json({ success: false, error: 'Forbidden: only project owner can remove category' });
      return;
    }
    const category = await Category.findByPk(categoryIdInt);
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

// Lister toutes les catégories
export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.findAll();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
