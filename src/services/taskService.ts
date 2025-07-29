import { Task } from '@prisma/client';
import prisma from '../config/database';
import { CacheService } from './cacheService';
import { NotFoundError } from '../utils/errors';
import { TaskStatus } from '../models/types';
import { convertTaskDates, convertTaskDatesArray, TaskWithDates } from '../utils/dateUtils';

export class TaskService {
    /**
     * Create a new task
     */
    static async createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<TaskWithDates> {
        const task = await prisma.task.create({ data });

        // Cache invalidation should not fail the operation
        try {
            await CacheService.invalidateTask(task.id, task.projectId);
        } catch (cacheError) {
            console.error('Cache invalidation failed during task creation:', cacheError);
        }

        return task;
    }

    /**
     * Get all tasks with optional filters
     */
    static async getTasks(filters?: {
        status?: TaskStatus;
        assignedTo?: string;
        assigneeName?: string;
        dueDate?: Date;
    }): Promise<TaskWithDates[]> {
        const cacheKey = CacheService.taskKey(undefined, undefined, filters);
        const cached = await CacheService.get<Task[]>(cacheKey);

        if (cached) {
            return convertTaskDatesArray(cached);
        }

        const where = {
            ...(filters?.status && { status: filters.status }),
            ...(filters?.assignedTo && { assignedTo: filters.assignedTo }),
            ...(filters?.assigneeName && { assigneeName: { contains: filters.assigneeName, mode: 'insensitive' as any } }),
            ...(filters?.dueDate && { dueDate: { lte: filters.dueDate } }),
        };

        const tasks = await prisma.task.findMany({ where });
        await CacheService.set(cacheKey, tasks);
        return tasks;
    }

    /**
     * Get tasks by project ID
     */
    static async getTasksByProjectId(projectId: string): Promise<TaskWithDates[]> {
        const cacheKey = CacheService.taskKey(undefined, projectId);
        const cached = await CacheService.get<Task[]>(cacheKey);

        if (cached) {
            return convertTaskDatesArray(cached);
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
    static async getTaskById(id: string): Promise<TaskWithDates> {
        const cacheKey = CacheService.taskKey(id);
        const cached = await CacheService.get<Task>(cacheKey);

        if (cached) {
            return convertTaskDates(cached);
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
    static async updateTask(id: string, data: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<TaskWithDates> {
        try {
            const task = await prisma.task.update({
                where: { id },
                data,
            });

            // Cache invalidation should not fail the operation
            try {
                await CacheService.invalidateTask(id, task.projectId);
            } catch (cacheError) {
                console.error('Cache invalidation failed during task update:', cacheError);
            }

            return task;
        } catch (error: any) {
            if (error.code === 'P2025' || error.message.includes('Record not found')) {
                throw new NotFoundError(`Task with ID ${id} not found`);
            }
            throw error;
        }
    }

    /**
     * Delete a task
     */
    static async deleteTask(id: string): Promise<TaskWithDates> {
        try {
            const task = await prisma.task.delete({
                where: { id },
            });

            // Cache invalidation should not fail the operation
            try {
                await CacheService.invalidateTask(id, task.projectId);
            } catch (cacheError) {
                console.error('Cache invalidation failed during task deletion:', cacheError);
            }

            return task;
        } catch (error: any) {
            if (error.code === 'P2025' || error.message.includes('Record not found')) {
                throw new NotFoundError(`Task with ID ${id} not found`);
            }
            throw error;
        }
    }

    /**
     * Get overdue tasks
     */
    static async getOverdueTasks(): Promise<TaskWithDates[]> {
        const cacheKey = CacheService.taskKey(undefined, undefined, { overdue: true });
        const cached = await CacheService.get<Task[]>(cacheKey);

        if (cached) {
            return convertTaskDatesArray(cached);
        }

        const overdueTasks = await prisma.task.findMany({
            where: {
                dueDate: { lt: new Date() },
                status: { not: TaskStatus.COMPLETED },
            },
        });

        await CacheService.set(cacheKey, overdueTasks);
        return overdueTasks;
    }
} 