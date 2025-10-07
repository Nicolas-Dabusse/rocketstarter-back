// This file defines associations to avoid circular import issues
import Step from './Step';
import Task from './Task';
import Project from './Project';

// Define Step-Task associations
Step.hasMany(Task, { foreignKey: 'stepId', as: 'tasks' });

// Add Step to Project associations  
Project.hasMany(Step, { foreignKey: 'projectId', as: 'steps' });

export { Step, Task, Project };