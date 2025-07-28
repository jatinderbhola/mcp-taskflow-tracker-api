import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';
import { ProjectService } from '../services/projectService';

const router = Router();
const projectService = new ProjectService();
const projectController = new ProjectController(projectService);

// Project routes
router.post('/', projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

export default router; 