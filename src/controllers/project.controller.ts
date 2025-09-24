import { Request, Response } from 'express';
import { Project, User, Task } from '../models';
import { CreateProjectRequest, UpdateProjectRequest } from '../types';

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectData: CreateProjectRequest = req.body;
    
    // Generate a unique ID for the project
    const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const project = await Project.create({
      id: projectId,
      ...projectData
    });
    
    res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({
      success: false,
      error: errorMessage
    });
  }
};

export const getAllProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const projects = await Project.findAll({
      include: [
        {
          model: User,
          as: 'ownerUser',
          attributes: ['address', 'username', 'role']
        },
        {
          model: Task,
          as: 'tasks'
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
};

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const project = await Project.findByPk(id, {
      include: [
        {
          model: User,
          as: 'ownerUser',
          attributes: ['address', 'username', 'role']
        },
        {
          model: Task,
          as: 'tasks',
          include: [
            {
              model: User,
              as: 'builderUser',
              attributes: ['address', 'username']
            }
          ]
        }
      ]
    });
    
    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: UpdateProjectRequest = req.body;
    
    const [updatedRowsCount] = await Project.update(updateData, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      res.status(404).json({
        success: false,
        error: 'Project not found'
      });
      return;
    }
    
    const updatedProject = await Project.findByPk(id, {
      include: [
        {
          model: User,
          as: 'ownerUser',
          attributes: ['address', 'username', 'role']
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: updatedProject,
      message: 'Project updated successfully'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(400).json({
      success: false,
      error: errorMessage
    });
  }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const deletedRowsCount = await Project.destroy({
      where: { id }
    });
    
    if (deletedRowsCount === 0) {
      res.status(404).json({
        success: false,
        error: 'Project not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
};