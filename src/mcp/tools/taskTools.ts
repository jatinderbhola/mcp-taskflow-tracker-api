import { z } from 'zod';
import { McpError } from '../sdk';
import { TaskService } from '@/services/taskService';
import { TaskSchema, TaskStatus } from '@/models/types';
import { MCPTool, IdSchema, PaginationSchema, createMCPResponse } from '../types';
import { AppError } from '@/utils/errors';

const taskService = new TaskService();

// Get tasks by assignee
const getTasksByAssignee: MCPTool = {
    name: 'get_tasks_by_assignee',
    description: 'Get all tasks assigned to a specific user',
    parameters: z.object({
        assignedTo: z.string(),
        ...PaginationSchema.shape,
    }),
    handler: async (input) => {
        try {
            const { assignedTo } = z.object({ assignedTo: z.string() }).parse(input);
            const tasks = await taskService.getTasks({ assignedTo });
            return createMCPResponse(true, { tasks });
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

// Find overdue tasks
const findOverdueTasks: MCPTool = {
    name: 'find_overdue_tasks',
    description: 'Find all tasks that are past their due date',
    parameters: z.object({
        projectId: z.string().optional(),
        ...PaginationSchema.shape,
    }),
    handler: async (_input) => {
        try {
            const now = new Date();
            const tasks = await taskService.getTasks({ dueDate: now });
            const overdueTasks = tasks.filter(task =>
                task.status !== TaskStatus.COMPLETED &&
                task.dueDate < now
            );
            return createMCPResponse(true, { tasks: overdueTasks });
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

// Update task status
const updateTaskStatus: MCPTool = {
    name: 'update_task_status',
    description: 'Update the status of a task',
    parameters: z.object({
        id: z.string(),
        status: z.nativeEnum(TaskStatus),
    }),
    handler: async (input) => {
        try {
            const { id, status } = z.object({
                id: z.string(),
                status: z.nativeEnum(TaskStatus),
            }).parse(input);

            const task = await taskService.updateTask(id, { status });
            return createMCPResponse(true, { task });
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

// Get task details
const getTaskDetails: MCPTool = {
    name: 'get_task_details',
    description: 'Get detailed information about a task',
    parameters: IdSchema,
    handler: async (input) => {
        try {
            const { id } = IdSchema.parse(input);
            const task = await taskService.getTaskById(id);
            return createMCPResponse(true, { task });
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

// Create task
const createTask: MCPTool = {
    name: 'create_task',
    description: 'Create a new task in a project',
    parameters: TaskSchema,
    handler: async (input) => {
        try {
            const taskData = TaskSchema.parse(input);
            const task = await taskService.createTask(taskData);
            return createMCPResponse(true, { task });
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

export const taskTools = [
    getTasksByAssignee,
    findOverdueTasks,
    updateTaskStatus,
    getTaskDetails,
    createTask,
]; 