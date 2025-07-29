import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';

const router = Router();

// GET /api/projects - Get all projects
router.get('/', ProjectController.getProjects);

// POST /api/projects - Create a new project
router.post('/', ProjectController.createProject);

// GET /api/projects/:id - Get a project by ID
router.get('/:id', ProjectController.getProjectById);

// PUT /api/projects/:id - Update a project
router.put('/:id', ProjectController.updateProject);

// DELETE /api/projects/:id - Delete a project
router.delete('/:id', ProjectController.deleteProject);

// GET /api/projects/:projectId/risk - Get risk assessment for project
router.get('/:projectId/risk', ProjectController.getRiskAssessment);

export default router; 