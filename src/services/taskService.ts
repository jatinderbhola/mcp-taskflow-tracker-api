import { Task, TaskSchema, TaskStatus } from '../models/types';
import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export class TaskService {
    /**
     * Create a new task
     */
    async createTask(data: Task): Promise<Task> {
        const validated = TaskSchema.parse(data);

        try {
            return await prisma.task.create({
                data: validated,
                include: { project: true },
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2003') {
                throw new NotFoundError(`Project with ID ${data.projectId} not found`);
            }
            throw error;
        }
    }

    /**
     * Get tasks for a project
     */
    async getTasksByProjectId(projectId: string): Promise<Task[]> {
        return prisma.task.findMany({
            where: { projectId },
            include: { project: true },
        });
    }

    /**
     * Get all tasks with optional filtering
     */
    async getTasks(filters?: {
        status?: TaskStatus;
        assignedTo?: string;
        dueDate?: Date;
    }): Promise<Task[]> {
        const where = {
            ...(filters?.status && { status: filters.status }),
            ...(filters?.assignedTo && { assignedTo: filters.assignedTo }),
            ...(filters?.dueDate && { dueDate: { lte: filters.dueDate } }),
        };

        return prisma.task.findMany({
            where,
            include: { project: true },
        });
    }

    /**
     * Get a task by ID
     */
    async getTaskById(id: string): Promise<Task> {
        const task = await prisma.task.findUnique({
            where: { id },
            include: { project: true },
        });

        if (!task) {
            throw new NotFoundError(`Task with ID ${id} not found`);
        }

        return task;
    }

    /**
     * Update a task
     */
    async updateTask(id: string, data: Partial<Task>): Promise<Task> {
        const validated = TaskSchema.partial().parse(data);

        try {
            return await prisma.task.update({
                where: { id },
                data: validated,
                include: { project: true },
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new NotFoundError(`Task with ID ${id} not found`);
                }
                if (error.code === 'P2003') {
                    throw new NotFoundError(`Project with ID ${data.projectId} not found`);
                }
            }
            throw error;
        }
    }

    /**
     * Delete a task
     */
    async deleteTask(id: string): Promise<void> {
        try {
            await prisma.task.delete({
                where: { id },
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundError(`Task with ID ${id} not found`);
            }
            throw error;
        }
    }
} 