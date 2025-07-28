import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/projectService';
import { ProjectSchema, ProjectStatus } from '../models/types';

export class ProjectController {
    /**
     * Get all projects with optional filtering
     */
    static getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { status, startDate, endDate } = req.query;

            const filters = {
                ...(status && { status: status as ProjectStatus }),
                ...(startDate && { startDate: new Date(startDate as string) }),
                ...(endDate && { endDate: new Date(endDate as string) }),
            };

            const projects = await ProjectService.getProjects(filters);
            res.json(projects);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Create a new project
     */
    static createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const projectData = ProjectSchema.parse(req.body);
            const project = await ProjectService.createProject(projectData);
            res.status(201).json(project);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get a project by ID
     */
    static getProjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const project = await ProjectService.getProjectById(id);
            res.json(project);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Update a project
     */
    static updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const projectData = ProjectSchema.partial().parse(req.body);
            const project = await ProjectService.updateProject(id, projectData);
            res.json(project);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Delete a project
     */
    static deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const deletedProject = await ProjectService.deleteProject(id);
            res.status(200).json(deletedProject);
        } catch (error) {
            next(error);
        }
    };
} 