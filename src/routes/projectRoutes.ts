import { Router } from 'express';
import { ProjectController } from '@/controllers/projectController';
import { ProjectService } from '@/services/projectService';

const router = Router();
const projectService = new ProjectService();
const projectController = new ProjectController(projectService);

// GET /api/projects - Get all projects
router.get('/', projectController.getProjects);

// POST /api/projects - Create a new project
router.post('/', projectController.createProject);

// GET /api/projects/:id - Get a project by ID
router.get('/:id', projectController.getProjectById);

// PUT /api/projects/:id - Update a project
router.put('/:id', projectController.updateProject);

// DELETE /api/projects/:id - Delete a project
router.delete('/:id', projectController.deleteProject);

export default router; 