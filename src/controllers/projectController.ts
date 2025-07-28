import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/projectService';
import { ProjectStatus } from '../models/types';

export class ProjectController {
    constructor(private projectService: ProjectService) { }

    /**
     * Create a new project
     */
    createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const project = await this.projectService.createProject(req.body);
            res.status(201).json(project);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get all projects with optional filtering
     */
    getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const filters = {
                status: req.query.status as ProjectStatus | undefined,
                startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
            };

            const projects = await this.projectService.getProjects(filters);
            res.json(projects);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get a project by ID
     */
    getProjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const project = await this.projectService.getProjectById(req.params.id);
            res.json(project);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Update a project
     */
    updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const project = await this.projectService.updateProject(req.params.id, req.body);
            res.json(project);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Delete a project
     */
    deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await this.projectService.deleteProject(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
} 