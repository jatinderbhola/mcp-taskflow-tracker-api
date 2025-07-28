import { Request, Response, NextFunction } from 'express';
import { TaskService } from '@/services/taskService';
import { ProjectService } from '@/services/projectService';
import { TaskSchema, TaskStatus } from '@/models/types';

export class TaskController {
    constructor(
        private readonly taskService: TaskService,
        private readonly projectService: ProjectService,
    ) { }

    /**
     * Get all tasks with optional filtering
     */
    getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { status, assignedTo, dueDate } = req.query;

            const filters = {
                ...(status && { status: status as TaskStatus }),
                ...(assignedTo && { assignedTo: assignedTo as string }),
                ...(dueDate && { dueDate: new Date(dueDate as string) }),
            };

            const tasks = await this.taskService.getTasks(filters);
            res.json(tasks);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Create a new task
     */
    createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const taskData = TaskSchema.parse(req.body);

            // Validate project exists
            await this.projectService.validateProjectExists(taskData.projectId);

            const task = await this.taskService.createTask(taskData);
            res.status(201).json(task);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get a task by ID
     */
    getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const task = await this.taskService.getTaskById(id);
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
            const { id } = req.params;
            const taskData = TaskSchema.partial().parse(req.body);

            // If projectId is being updated, validate new project exists
            if (taskData.projectId) {
                await this.projectService.validateProjectExists(taskData.projectId);
            }

            const task = await this.taskService.updateTask(id, taskData);
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
            const { id } = req.params;
            await this.taskService.deleteTask(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get tasks for a project
     */
    getTasksByProjectId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { projectId } = req.params;

            // Validate project exists
            await this.projectService.validateProjectExists(projectId);

            const tasks = await this.taskService.getTasksByProjectId(projectId);
            res.json(tasks);
        } catch (error) {
            next(error);
        }
    };
} 