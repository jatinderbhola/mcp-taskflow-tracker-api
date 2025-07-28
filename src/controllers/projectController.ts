import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '@/services/projectService';
import { ProjectSchema, ProjectStatus } from '@/models/types';

export class ProjectController {
    constructor(private readonly projectService: ProjectService) { }

    /**
     * Get all projects with optional filtering
     */
    getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { status, startDate, endDate } = req.query;

            const filters = {
                ...(status && { status: status as ProjectStatus }),
                ...(startDate && { startDate: new Date(startDate as string) }),
                ...(endDate && { endDate: new Date(endDate as string) }),
            };

            const projects = await this.projectService.getProjects(filters);
            res.json(projects);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Create a new project
     */
    createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const projectData = ProjectSchema.parse(req.body);
            const project = await this.projectService.createProject(projectData);
            res.status(201).json(project);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get a project by ID
     */
    getProjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const project = await this.projectService.getProjectById(id);
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
            const { id } = req.params;
            const projectData = ProjectSchema.partial().parse(req.body);
            const project = await this.projectService.updateProject(id, projectData);
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
            const { id } = req.params;
            await this.projectService.deleteProject(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
} 