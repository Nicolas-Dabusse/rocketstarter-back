import Task from '../models/Task';
import Project from '../models/Project';
// Lister les catégories d'une tâche
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

// Ajouter une catégorie à une tâche (owner uniquement)
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

// Retirer une catégorie d'une tâche (owner uniquement)
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
import { Request, Response } from 'express';
import Category from '../models/Category';

// Lister toutes les catégories
export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.findAll();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
