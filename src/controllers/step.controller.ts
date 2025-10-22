import { Request, Response } from 'express';
import Step from '../models/Step';
import Project from '../models/Project';
import User from '../models/User';
import Task from '../models/Task';

// Get all steps (Builder: all projects' steps and tasks)
export const getAllSteps = async (req: Request, res: Response): Promise<void> => {
  try {
    const steps = await Step.findAll({
      include: [
        {
          model: Project,
          as: 'project',
          include: [
            {
              model: User,
              as: 'ownerUser',
              attributes: ['address']
            }
          ]
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json(steps);
  } catch (error) {
    console.error('Error fetching all steps:', error);
    res.status(500).json({ error: 'Failed to fetch steps' });
  }
};

// Get steps by project ID (accessible to all for Builders to see project details)
export const getStepsByProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectIdParam = req.params.projectId;
    if (!projectIdParam) {
      res.status(400).json({ error: 'Project ID is required' });
      return;
    }

    const projectId = parseInt(projectIdParam);
    if (isNaN(projectId)) {
      res.status(400).json({ error: 'Invalid project ID' });
      return;
    }

    const steps = await Step.findAll({
      where: { projectId },
      include: [
        {
          model: Task,
          as: 'tasks',
          attributes: ['id', 'title', 'status', 'builder']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json(steps);
  } catch (error) {
    console.error('Error fetching steps by project:', error);
    res.status(500).json({ error: 'Failed to fetch steps' });
  }
};

// Get steps owned by user (Owner: peut voir tous ses projets, steps et tasks)
export const getMySteps = async (req: Request, res: Response): Promise<void> => {
  try {
    const userAddress = req.headers['x-user-address'];

    if (!userAddress) {
      res.status(401).json({ error: 'User address is required' });
      return;
    }

    const steps = await Step.findAll({
      include: [
        {
          model: Project,
          as: 'project',
          where: { owner: userAddress },
          include: [
            {
              model: User,
              as: 'ownerUser',
              attributes: ['address']
            }
          ]
        },
        {
          model: Task,
          as: 'tasks',
          attributes: ['id', 'title', 'status', 'builder']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json(steps);
  } catch (error) {
    console.error('Error fetching user steps:', error);
    res.status(500).json({ error: 'Failed to fetch user steps' });
  }
};

// Get single step by ID
export const getStepById = async (req: Request, res: Response): Promise<void> => {
  try {
    const stepIdParam = req.params.id;
    if (!stepIdParam) {
      res.status(400).json({ error: 'Step ID is required' });
      return;
    }

    const stepId = parseInt(stepIdParam);
    if (isNaN(stepId)) {
      res.status(400).json({ error: 'Invalid step ID' });
      return;
    }

    const step = await Step.findByPk(stepId, {
      include: [
        {
          model: Project,
          as: 'project',
          include: [
            {
              model: User,
              as: 'ownerUser',
              attributes: ['address']
            }
          ]
        },
        {
          model: Task,
          as: 'tasks'
        }
      ]
    });

    if (!step) {
      res.status(404).json({ error: 'Step not found' });
      return;
    }

    res.json(step);
  } catch (error) {
    console.error('Error fetching step:', error);
    res.status(500).json({ error: 'Failed to fetch step' });
  }
};

// Create step (Owner only - ownership verified via project)
export const createStep = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, name, description, progress = 0 } = req.body;
    const userAddress = req.headers['x-user-address'];

    if (!userAddress) {
      res.status(401).json({ error: 'User address is required' });
      return;
    }

    if (!projectId || !name) {
      res.status(400).json({ error: 'Project ID and name are required' });
      return;
    }

    // Verify project ownership
    const project = await Project.findByPk(parseInt(projectId));
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (project.owner !== userAddress) {
      res.status(403).json({ error: 'Only project owner can create steps' });
      return;
    }

    const step = await Step.create({
      projectId: parseInt(projectId),
      name,
      description,
      progress: parseFloat(progress) || 0
    });

    const createdStep = await Step.findByPk(step.id, {
      include: [
        {
          model: Project,
          as: 'project'
        }
      ]
    });

    res.status(201).json(createdStep);
  } catch (error) {
    console.error('Error creating step:', error);
    res.status(500).json({ error: 'Failed to create step' });
  }
};

// Update step (Owner only - ownership verified via project)
export const updateStep = async (req: Request, res: Response): Promise<void> => {
  try {
    const stepIdParam = req.params.id;
    const userAddress = req.headers['x-user-address'];

    if (!userAddress) {
      res.status(401).json({ error: 'Authorization required' });
      return;
    }

    if (!stepIdParam) {
      res.status(400).json({ error: 'Step ID is required' });
      return;
    }

    const stepId = parseInt(stepIdParam);
    if (isNaN(stepId)) {
      res.status(400).json({ error: 'Invalid step ID' });
      return;
    }

    const step = await Step.findByPk(stepId, {
      include: [
        {
          model: Project,
          as: 'project'
        }
      ]
    });

    if (!step) {
      res.status(404).json({ error: 'Step not found' });
      return;
    }

    // Get project to verify ownership
    const project = await Project.findByPk(step.projectId);
    if (!project || project.owner !== userAddress) {
      res.status(403).json({ error: 'Only project owner can update steps' });
      return;
    }

    const { name, description, progress } = req.body;
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (progress !== undefined) updateData.progress = parseFloat(progress);

    await step.update(updateData);

    const updatedStep = await Step.findByPk(stepId, {
      include: [
        {
          model: Project,
          as: 'project'
        }
      ]
    });

    res.json(updatedStep);
  } catch (error) {
    console.error('Error updating step:', error);
    res.status(500).json({ error: 'Failed to update step' });
  }
};

// Delete step (Owner only - ownership verified via project)
export const deleteStep = async (req: Request, res: Response): Promise<void> => {
  try {
    const stepIdParam = req.params.id;
    const userAddress = req.headers['x-user-address'];

    if (!userAddress) {
      res.status(401).json({ error: 'Authorization required' });
      return;
    }

    if (!stepIdParam) {
      res.status(400).json({ error: 'Step ID is required' });
      return;
    }

    const stepId = parseInt(stepIdParam);
    if (isNaN(stepId)) {
      res.status(400).json({ error: 'Invalid step ID' });
      return;
    }

    const step = await Step.findByPk(stepId);

    if (!step) {
      res.status(404).json({ error: 'Step not found' });
      return;
    }

    // Get project to verify ownership
    const project = await Project.findByPk(step.projectId);
    if (!project || project.owner !== userAddress) {
      res.status(403).json({ error: 'Only project owner can delete steps' });
      return;
    }

    await step.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting step:', error);
    res.status(500).json({ error: 'Failed to delete step' });
  }
};