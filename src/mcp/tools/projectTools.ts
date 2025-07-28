import { z } from 'zod';
import { McpError } from '../sdk';
import { ProjectService } from '@/services/projectService';
import { ProjectSchema, ProjectStatus, DateRangeSchema, IdSchema } from '@/models/types';
import { MCPTool } from '../types';
import { AppError } from '@/utils/errors';
import prisma from '@/config/database';

// Initialize database connection
prisma.$connect().catch((error: Error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
});

const projectService = new ProjectService();

const getProjectStatus: MCPTool = {
    name: 'get_project_status',
    description: 'Get the current status of a project by ID',
    parameters: IdSchema,
    handler: async (params) => {
        try {
            const { id } = IdSchema.parse(params);
            const project = await projectService.getProjectById(id);
            return { status: project.status };
        } catch (error) {
            if (error instanceof AppError) {
                throw new McpError(404, error.message);
            }
            throw new McpError(500, 'Failed to get project status');
        }
    },
};

const findProjectsByStatus: MCPTool = {
    name: 'find_projects_by_status',
    description: 'Find all projects with a specific status',
    parameters: z.object({
        status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED']),
    }),
    handler: async (params) => {
        try {
            const { status } = params as { status: ProjectStatus };
            const projects = await projectService.getProjects({ status });
            return { projects };
        } catch (error) {
            throw new McpError(500, 'Failed to find projects by status');
        }
    },
};

const findProjectsByDateRange: MCPTool = {
    name: 'find_projects_by_date_range',
    description: 'Find projects within a specific date range',
    parameters: DateRangeSchema,
    handler: async (params) => {
        try {
            const { startDate, endDate } = DateRangeSchema.parse(params);
            const projects = await projectService.getProjects({ startDate, endDate });
            return { projects };
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new McpError(400, 'Invalid date range format');
            }
            throw new McpError(500, 'Failed to find projects by date range');
        }
    },
};

const createProject: MCPTool = {
    name: 'create_project',
    description: 'Create a new project',
    parameters: ProjectSchema,
    handler: async (params) => {
        try {
            const projectData = ProjectSchema.parse(params);
            const project = await projectService.createProject(projectData);
            return { project };
        } catch (error) {
            console.error('Create project error:', error);
            if (error instanceof z.ZodError) {
                throw new McpError(400, 'Invalid project data');
            }
            throw new McpError(500, 'Failed to create project');
        }
    },
};

const updateProjectStatus: MCPTool = {
    name: 'update_project_status',
    description: 'Update the status of a project',
    parameters: z.object({
        id: z.string(),
        status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED']),
    }),
    handler: async (params) => {
        try {
            const { id, status } = params as { id: string; status: ProjectStatus };
            const project = await projectService.updateProject(id, { status });
            return { project };
        } catch (error) {
            if (error instanceof AppError) {
                throw new McpError(404, error.message);
            }
            throw new McpError(500, 'Failed to update project status');
        }
    },
};

export const projectTools = [
    getProjectStatus,
    findProjectsByStatus,
    findProjectsByDateRange,
    createProject,
    updateProjectStatus,
]; 