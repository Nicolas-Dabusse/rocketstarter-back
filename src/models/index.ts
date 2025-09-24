import User from './User';
import Project from './Project';
import Task from './Task';
import Category from './Category';
import { sequelize } from '../config/db';

// Import models to ensure they are initialized
// The associations are already defined in each model file

// Define many-to-many relationships for categories
// Project <-> Category
Project.belongsToMany(Category, {
  through: 'ProjectCategory',
  foreignKey: 'projectId',
  otherKey: 'categoryId',
  as: 'categories',
});

Category.belongsToMany(Project, {
  through: 'ProjectCategory',
  foreignKey: 'categoryId',
  otherKey: 'projectId',
  as: 'projects',
});

// Task <-> Category
Task.belongsToMany(Category, {
  through: 'TaskCategory',
  foreignKey: 'taskId',
  otherKey: 'categoryId',
  as: 'categories',
});

Category.belongsToMany(Task, {
  through: 'TaskCategory',
  foreignKey: 'categoryId',
  otherKey: 'taskId',
  as: 'tasks',
});

// Export all models and sequelize instance
export {
  User,
  Project,
  Task,
  Category,
  sequelize
};

// Export a function to initialize all models
export const initializeModels = async (): Promise<void> => {
  try {
    // Sync all models
    await sequelize.sync({ alter: true }); // Use alter: true in development
    console.log('✅ All models synchronized successfully.');
  } catch (error) {
    console.error('❌ Error initializing models:', error);
    throw error;
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