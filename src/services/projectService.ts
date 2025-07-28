import { Project, ProjectStatus } from '@prisma/client';
import prisma from '../config/database';
import { NotFoundError } from '../utils/errors';
import { CacheService } from './cacheService';

export class ProjectService {
    /**
     * Create a new project
     */
    static async createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
        const project = await prisma.project.create({ data });
        await CacheService.invalidateProject(project.id);
        return project;
    }

    /**
     * Get all projects with optional filters
     */
    static async getProjects(filters?: {
        status?: ProjectStatus;
        startDate?: Date;
        endDate?: Date;
    }): Promise<Project[]> {
        const cacheKey = CacheService.projectKey(undefined, filters);
        const cached = await CacheService.get<Project[]>(cacheKey);

        if (cached) {
            return cached;
        }

        const where = {
            ...(filters?.status && { status: filters.status }),
            ...(filters?.startDate && { startDate: { gte: filters.startDate } }),
            ...(filters?.endDate && { endDate: { lte: filters.endDate } }),
        };

        const projects = await prisma.project.findMany({ where });
        await CacheService.set(cacheKey, projects);
        return projects;
    }

    /**
     * Get a project by ID
     */
    static async getProjectById(id: string): Promise<Project> {
        const cacheKey = CacheService.projectKey(id);
        const cached = await CacheService.get<Project>(cacheKey);

        if (cached) {
            return cached;
        }

        const project = await prisma.project.findUnique({ where: { id } });
        if (!project) {
            throw new NotFoundError(`Project with ID ${id} not found`);
        }

        await CacheService.set(cacheKey, project);
        return project;
    }

    /**
     * Update a project
     */
    static async updateProject(id: string, data: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Project> {
        const project = await prisma.project.update({
            where: { id },
            data,
        });

        await CacheService.invalidateProject(id);
        return project;
    }

    /**
     * Delete a project
     */
    static async deleteProject(id: string): Promise<Project> {
        const project = await prisma.project.delete({
            where: { id },
        });

        await CacheService.invalidateProject(id);
        return project;
    }

    /**
     * Validate project exists
     */
    static async validateProjectExists(id: string): Promise<void> {
        const exists = await prisma.project.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!exists) {
            throw new NotFoundError(`Project with ID ${id} not found`);
        }
    }
} 