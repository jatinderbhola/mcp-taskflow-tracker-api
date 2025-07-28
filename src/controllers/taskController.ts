import { Request, Response, NextFunction } from 'express';
import { TaskService } from '@/services/taskService';
import { ProjectService } from '@/services/projectService';
import { TaskSchema, TaskStatus } from '@/models/types';

export class TaskController {
    /**
     * Get all tasks with optional filtering
     */
    static getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { status, assignedTo, dueDate } = req.query;

            const filters = {
                ...(status && { status: status as TaskStatus }),
                ...(assignedTo && { assignedTo: assignedTo as string }),
                ...(dueDate && { dueDate: new Date(dueDate as string) }),
            };

            const tasks = await TaskService.getTasks(filters);
            res.json(tasks);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Create a new task
     */
    static createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const taskData = TaskSchema.parse(req.body);

            // Validate project exists
            await ProjectService.validateProjectExists(taskData.projectId);

            const task = await TaskService.createTask(taskData);
            res.status(201).json(task);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get a task by ID
     */
    static getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const task = await TaskService.getTaskById(id);
            res.json(task);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Update a task
     */
    static updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            const taskData = TaskSchema.partial().parse(req.body);

            // If projectId is being updated, validate new project exists
            if (taskData.projectId) {
                await ProjectService.validateProjectExists(taskData.projectId);
            }

            const task = await TaskService.updateTask(id, taskData);
            res.json(task);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Delete a task
     */
    static deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            await TaskService.deleteTask(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    };

    /**
     * Get tasks for a project
     */
    static getTasksByProjectId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { projectId } = req.params;

            // Validate project exists
            await ProjectService.validateProjectExists(projectId);

            const tasks = await TaskService.getTasksByProjectId(projectId);
            res.json(tasks);
        } catch (error) {
            next(error);
        }
    };
} 