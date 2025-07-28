import { Router } from 'express';
import { TaskController } from '@/controllers/taskController';
import { TaskService } from '@/services/taskService';
import { ProjectService } from '@/services/projectService';

const router = Router();
const taskService = new TaskService();
const projectService = new ProjectService();
const taskController = new TaskController(taskService, projectService);

// GET /api/tasks - Get all tasks
router.get('/', taskController.getTasks);

// POST /api/tasks - Create a new task
router.post('/', taskController.createTask);

// GET /api/tasks/:id - Get a task by ID
router.get('/:id', taskController.getTaskById);

// PUT /api/tasks/:id - Update a task
router.put('/:id', taskController.updateTask);

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', taskController.deleteTask);

// GET /api/tasks/project/:projectId - Get tasks for a project
router.get('/project/:projectId', taskController.getTasksByProjectId);

export default router; 