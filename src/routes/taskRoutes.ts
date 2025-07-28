import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { TaskService } from '../services/taskService';
import { ProjectService } from '../services/projectService';

const router = Router();
const taskService = new TaskService();
const projectService = new ProjectService();
const taskController = new TaskController(taskService, projectService);

// Task routes
router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTaskById);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

// Project-specific task routes
router.post('/projects/:projectId/tasks', taskController.createTask);
router.get('/projects/:projectId/tasks', taskController.getProjectTasks);

export default router; 