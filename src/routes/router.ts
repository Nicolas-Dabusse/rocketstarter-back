import * as categoryController from '../controllers/category.controller';
import { Router } from 'express';
import { healthCheck, databaseTest, apiInfo } from '../controllers/health.controller';
import * as userController from '../controllers/user.controller';
import * as projectController from '../controllers/project.controller';
import * as taskController from '../controllers/task.controller';

const router = Router();

// Health endpoints
router.get('/health', healthCheck);
router.get('/db-test', databaseTest);
router.get('/api/v1', apiInfo);

// User endpoints
router.post('/api/v1/users', userController.createUser);
router.get('/api/v1/users', userController.getAllUsers);
router.get('/api/v1/users/:address', userController.getUserByAddress);
router.put('/api/v1/users/:address', userController.updateUser);
router.delete('/api/v1/users/:address', userController.deleteUser);

// Project endpoints
router.post('/api/v1/projects', projectController.createProject);
router.get('/api/v1/projects', projectController.getAllProjects);
router.get('/api/v1/projects/:id', projectController.getProjectById);
router.put('/api/v1/projects/:id', projectController.updateProject);
router.delete('/api/v1/projects/:id', projectController.deleteProject);

// Task endpoints
router.post('/api/v1/tasks', taskController.createTask);
router.get('/api/v1/tasks', taskController.getAllTasks);
router.get('/api/v1/tasks/:id', taskController.getTaskById);
router.put('/api/v1/tasks/:id', taskController.updateTask);
router.delete('/api/v1/tasks/:id', taskController.deleteTask);

// Category endpoints
router.get('/api/v1/categories', categoryController.getAllCategories);
router.get('/api/v1/tasks/:id/categories', categoryController.getTaskCategories);
router.post('/api/v1/tasks/:id/categories', categoryController.addCategoryToTask);
router.delete('/api/v1/tasks/:id/categories/:categoryId', categoryController.removeCategoryFromTask);

export default router;