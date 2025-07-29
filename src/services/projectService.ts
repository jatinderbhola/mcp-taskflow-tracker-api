import { Project } from '@prisma/client';
import prisma from '../config/database';
import { CacheService } from './cacheService';
import { NotFoundError } from '../utils/errors';
import { ProjectStatus } from '../models/types';
import { convertProjectDates, convertProjectDatesArray, ProjectWithDates } from '../utils/dateUtils';

export class ProjectService {
    /**
     * Create a new project
     */
    static async createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectWithDates> {
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
    }): Promise<ProjectWithDates[]> {
        const cacheKey = CacheService.projectKey(undefined, filters);
        const cached = await CacheService.get<Project[]>(cacheKey);

        if (cached) {
            return convertProjectDatesArray(cached);
        }

        const where = {
            ...(filters?.status && { status: filters.status as any }),
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
    static async getProjectById(id: string): Promise<ProjectWithDates> {
        const cacheKey = CacheService.projectKey(id);
        const cached = await CacheService.get<Project>(cacheKey);

        if (cached) {
            return convertProjectDates(cached);
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
    static async updateProject(id: string, data: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ProjectWithDates> {
        try {
            const project = await prisma.project.update({
                where: { id },
                data,
            });

            await CacheService.invalidateProject(id);
            return project;
        } catch (error: any) {
            if (error.code === 'P2025' || error.message.includes('Record not found')) {
                throw new NotFoundError(`Project with ID ${id} not found`);
            }
            throw error;
        }
    }

    /**
     * Delete a project
     */
    static async deleteProject(id: string): Promise<ProjectWithDates> {
        try {
            const project = await prisma.project.delete({
                where: { id },
            });

            await CacheService.invalidateProject(id);
            return project;
        } catch (error: any) {
            if (error.code === 'P2025' || error.message.includes('Record not found')) {
                throw new NotFoundError(`Project with ID ${id} not found`);
            }
            throw error;
        }
    }

    /**
     * Validate that a project exists
     */
    static async validateProjectExists(projectId: string): Promise<void> {
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) {
            throw new NotFoundError(`Project with ID ${projectId} not found`);
        }
    }
} 