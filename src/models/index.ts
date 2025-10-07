import User from './User';
import Project from './Project';
import Task from './Task';
import Step from './Step';
import Category from './Category';
import Reward from './Reward';
import { ProjectCategory, TaskCategory } from './JunctionTables';
import { sequelize } from '../config/db';
import './associations';

// Import models to ensure they are initialized
// The associations are already defined in each model file

// Define many-to-many relationships for categories
// Project <-> Category
Project.belongsToMany(Category, {
  through: ProjectCategory,
  foreignKey: 'projectId',
  otherKey: 'categoryId',
  as: 'categories',
});

Category.belongsToMany(Project, {
  through: ProjectCategory,
  foreignKey: 'categoryId',
  otherKey: 'projectId',
  as: 'projects',
});

// Task <-> Category
Task.belongsToMany(Category, {
  through: TaskCategory,
  foreignKey: 'taskId',
  otherKey: 'categoryId',
  as: 'categories',
});

Category.belongsToMany(Task, {
  through: TaskCategory,
  foreignKey: 'categoryId',
  otherKey: 'taskId',
  as: 'tasks',
});

// Export all models and sequelize instance
export {
  User,
  Project,
  Task,
  Step,
  Category,
  Reward,
  ProjectCategory,
  TaskCategory,
  sequelize
};

// Export a function to initialize all models
export const initializeModels = async (): Promise<void> => {
  try {
    // En développement, utilise seulement sync sans alter pour éviter les erreurs
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ All models synchronized successfully.');
  } catch (error) {
    console.error('❌ Error initializing models:', error);
    // Ne pas throw pour éviter le crash du serveur en dev
    if (process.env.NODE_ENV !== 'development') throw error;
  }
};

export default {
  User,
  Project,
  Task,
  Category,
  sequelize,
  initializeModels
};