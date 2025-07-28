import { z } from 'zod';
import { McpError } from '../sdk';
import { ProjectService } from '@/services/projectService';
import { ProjectSchema, ProjectStatus } from '@/models/types';
import { MCPTool, DateRangeSchema, IdSchema, PaginationSchema, createMCPResponse } from '../types';
import { AppError } from '@/utils/errors';

const projectService = new ProjectService();

// Get project status
const getProjectStatus: MCPTool = {
    name: 'get_project_status',
    description: 'Get the current status of a project by ID',
    parameters: IdSchema,
    handler: async (input) => {
        try {
            const { id } = IdSchema.parse(input);
            const project = await projectService.getProjectById(id);
            return createMCPResponse(true, { status: project.status });
        } catch (error) {
            if (error instanceof AppError) {
                throw new McpError(404, error.message);
            }
            if (error instanceof z.ZodError) {
                throw new McpError(400, error.message);
            }
            throw new McpError(500, 'An unexpected error occurred');
        }
    },
};

// Find projects by status
const findProjectsByStatus: MCPTool = {
    name: 'find_projects_by_status',
    description: 'Find all projects with a specific status',
    parameters: z.object({
        status: z.nativeEnum(ProjectStatus),
        ...PaginationSchema.shape,
    }),
    handler: async (input) => {
        try {
            const { status } = z.object({ status: z.nativeEnum(ProjectStatus) }).parse(input);
            const projects = await projectService.getProjects({ status });
            return createMCPResponse(true, { projects });
        } catch (error) {
            if (error instanceof AppError) {
                throw new McpError(404, error.message);
            }
            if (error instanceof z.ZodError) {
                throw new McpError(400, error.message);
            }
            throw new McpError(500, 'An unexpected error occurred');
        }
    },
};

// Find projects by date range
const findProjectsByDateRange: MCPTool = {
    name: 'find_projects_by_date_range',
    description: 'Find projects within a specific date range',
    parameters: DateRangeSchema,
    handler: async (input) => {
        try {
            const { startDate, endDate } = DateRangeSchema.parse(input);
            const projects = await projectService.getProjects({ startDate, endDate });
            return createMCPResponse(true, { projects });
        } catch (error) {
            if (error instanceof AppError) {
                throw new McpError(404, error.message);
            }
            if (error instanceof z.ZodError) {
                throw new McpError(400, error.message);
            }
            throw new McpError(500, 'An unexpected error occurred');
        }
    },
};

// Create project
const createProject: MCPTool = {
    name: 'create_project',
    description: 'Create a new project',
    parameters: ProjectSchema,
    handler: async (input) => {
        try {
            const projectData = ProjectSchema.parse(input);
            const project = await projectService.createProject(projectData);
            return createMCPResponse(true, { project });
        } catch (error) {
            if (error instanceof AppError) {
                throw new McpError(404, error.message);
            }
            if (error instanceof z.ZodError) {
                throw new McpError(400, error.message);
            }
            throw new McpError(500, 'An unexpected error occurred');
        }
    },
};

// Update project status
const updateProjectStatus: MCPTool = {
    name: 'update_project_status',
    description: 'Update the status of a project',
    parameters: z.object({
        id: z.string(),
        status: z.nativeEnum(ProjectStatus),
    }),
    handler: async (input) => {
        try {
            const { id, status } = z.object({
                id: z.string(),
                status: z.nativeEnum(ProjectStatus),
            }).parse(input);

            const project = await projectService.updateProject(id, { status });
            return createMCPResponse(true, { project });
        } catch (error) {
            if (error instanceof AppError) {
                throw new McpError(404, error.message);
            }
            if (error instanceof z.ZodError) {
                throw new McpError(400, error.message);
            }
            throw new McpError(500, 'An unexpected error occurred');
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