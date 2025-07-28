import { Project, ProjectSchema, ProjectStatus } from '../models/types';
import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export class ProjectService {
    /**
     * Create a new project
     */
    async createProject(data: Project): Promise<Project> {
        const validated = ProjectSchema.parse(data);

        return prisma.project.create({
            data: validated,
        });
    }

    /**
     * Get all projects with optional filtering
     */
    async getProjects(filters?: {
        status?: ProjectStatus;
        startDate?: Date;
        endDate?: Date;
    }): Promise<Project[]> {
        const where = {
            ...(filters?.status && { status: filters.status }),
            ...(filters?.startDate && { startDate: { gte: filters.startDate } }),
            ...(filters?.endDate && { endDate: { lte: filters.endDate } }),
        };

        return prisma.project.findMany({
            where,
            include: { tasks: true },
        });
    }

    /**
     * Get a project by ID
     */
    async getProjectById(id: string): Promise<Project> {
        const project = await prisma.project.findUnique({
            where: { id },
            include: { tasks: true },
        });

        if (!project) {
            throw new NotFoundError(`Project with ID ${id} not found`);
        }

        return project;
    }

    /**
     * Update a project
     */
    async updateProject(id: string, data: Partial<Project>): Promise<Project> {
        const validated = ProjectSchema.partial().parse(data);

        try {
            return await prisma.project.update({
                where: { id },
                data: validated,
                include: { tasks: true },
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundError(`Project with ID ${id} not found`);
            }
            throw error;
        }
    }

    /**
     * Delete a project
     */
    async deleteProject(id: string): Promise<void> {
        try {
            await prisma.project.delete({
                where: { id },
            });
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundError(`Project with ID ${id} not found`);
            }
            throw error;
        }
    }

    /**
     * Validate project existence
     */
    async validateProjectExists(id: string): Promise<void> {
        const project = await prisma.project.findUnique({
            where: { id },
        });

        if (!project) {
            throw new ValidationError(`Project with ID ${id} not found`);
        }
    }
} 