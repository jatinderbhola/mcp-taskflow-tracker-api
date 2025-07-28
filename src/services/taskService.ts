import { Task, TaskStatus } from '@prisma/client';
import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import { CacheService } from './cacheService';

export class TaskService {
    /**
     * Create a new task
     */
    static async createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
        const task = await prisma.task.create({ data });
        await CacheService.invalidateTask(task.id, task.projectId);
        return task;
    }

    /**
     * Get all tasks with optional filters
     */
    static async getTasks(filters?: {
        status?: TaskStatus;
        assignedTo?: string;
        dueDate?: Date;
    }): Promise<Task[]> {
        const cacheKey = CacheService.taskKey(undefined, undefined, filters);
        const cached = await CacheService.get<Task[]>(cacheKey);

        if (cached) {
            return cached;
        }

        const where = {
            ...(filters?.status && { status: filters.status }),
            ...(filters?.assignedTo && { assignedTo: filters.assignedTo }),
            ...(filters?.dueDate && { dueDate: { lte: filters.dueDate } }),
        };

        const tasks = await prisma.task.findMany({ where });
        await CacheService.set(cacheKey, tasks);
        return tasks;
    }

    /**
     * Get tasks by project ID
     */
    static async getTasksByProjectId(projectId: string): Promise<Task[]> {
        const cacheKey = CacheService.taskKey(undefined, projectId);
        const cached = await CacheService.get<Task[]>(cacheKey);

        if (cached) {
            return cached;
        }

        const tasks = await prisma.task.findMany({
            where: { projectId },
        });

        await CacheService.set(cacheKey, tasks);
        return tasks;
    }

    /**
     * Get a task by ID
     */
    static async getTaskById(id: string): Promise<Task> {
        const cacheKey = CacheService.taskKey(id);
        const cached = await CacheService.get<Task>(cacheKey);

        if (cached) {
            return cached;
        }

        const task = await prisma.task.findUnique({ where: { id } });
        if (!task) {
            throw new NotFoundError(`Task with ID ${id} not found`);
        }

        await CacheService.set(cacheKey, task);
        return task;
    }

    /**
     * Update a task
     */
    static async updateTask(id: string, data: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Task> {
        const task = await prisma.task.update({
            where: { id },
            data,
        });

        await CacheService.invalidateTask(id, task.projectId);
        return task;
    }

    /**
     * Delete a task
     */
    static async deleteTask(id: string): Promise<Task> {
        const task = await prisma.task.delete({
            where: { id },
        });

        await CacheService.invalidateTask(id, task.projectId);
        return task;
    }

    /**
     * Get overdue tasks
     */
    static async getOverdueTasks(): Promise<Task[]> {
        const cacheKey = CacheService.taskKey(undefined, undefined, { overdue: true });
        const cached = await CacheService.get<Task[]>(cacheKey);

        if (cached) {
            return cached;
        }

        const tasks = await prisma.task.findMany({
            where: {
                dueDate: { lt: new Date() },
                status: { not: TaskStatus.COMPLETED },
            },
        });

        await CacheService.set(cacheKey, tasks, 300); // Cache for 5 minutes only
        return tasks;
    }
} 