import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/taskService';
import { ProjectService } from '../services/projectService';
import { TaskStatus } from '../models/types';

export class TaskController {
    constructor(
        private taskService: TaskService,
        private projectService: ProjectService,
    ) { }

    /**
     * Create a new task
     */
    createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Validate project exists
            await this.projectService.validateProjectExists(req.params.projectId);

            const taskData = {
                ...req.body,
                projectId: req.params.projectId,
            };

            const task = await this.taskService.createTask(taskData);
            res.status(201).json(task);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get tasks for a project
     */
    getProjectTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const tasks = await this.taskService.getTasksByProjectId(req.params.projectId);
            res.json(tasks);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get all tasks with optional filtering
     */
    getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const filters = {
                status: req.query.status as TaskStatus | undefined,
                assignedTo: req.query.assignedTo as string | undefined,
                dueDate: req.query.dueDate ? new Date(req.query.dueDate as string) : undefined,
            };

            const tasks = await this.taskService.getTasks(filters);
            res.json(tasks);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get a task by ID
     */
    getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const task = await this.taskService.getTaskById(req.params.id);
            res.json(task);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Update a task
     */
    updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // If projectId is being updated, validate it exists
            if (req.body.projectId) {
                await this.projectService.validateProjectExists(req.body.projectId);
            }

            const task = await this.taskService.updateTask(req.params.id, req.body);
            res.json(task);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Delete a task
     */
    deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await this.taskService.deleteTask(req.params.id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };
} 