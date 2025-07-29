import { Router } from 'express';
import { TaskController } from '../controllers/taskController';

const router = Router();

// GET /api/tasks - Get all tasks
router.get('/', TaskController.getTasks);

// POST /api/tasks - Create a new task
router.post('/', TaskController.createTask);

// GET /api/tasks/:id - Get a task by ID
router.get('/:id', TaskController.getTaskById);

// PUT /api/tasks/:id - Update a task
router.put('/:id', TaskController.updateTask);

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', TaskController.deleteTask);

// GET /api/tasks/project/:projectId - Get tasks for a project
router.get('/project/:projectId', TaskController.getTasksByProjectId);

// GET /api/workload/:assignee - Get workload analysis for assignee
router.get('/workload/:assignee', TaskController.getWorkloadAnalysis);

export default router; 