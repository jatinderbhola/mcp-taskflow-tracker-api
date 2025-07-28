import { z } from 'zod';
import { McpError } from '../sdk';
import { TaskService } from '@/services/taskService';
import { TaskSchema, TaskStatus, IdSchema } from '@/models/types';
import { MCPTool } from '../types';
import { AppError } from '@/utils/errors';
import prisma from '@/config/database';

// Initialize database connection
prisma.$connect().catch((error: Error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
});

const taskService = new TaskService();

const getTasksByAssignee: MCPTool = {
    name: 'get_tasks_by_assignee',
    description: 'Get all tasks assigned to a specific user',
    parameters: z.object({
        assignedTo: z.string(),
    }),
    handler: async (params) => {
        try {
            const { assignedTo } = params as { assignedTo: string };
            const tasks = await taskService.getTasks({ assignedTo });
            return { tasks };
        } catch (error) {
            throw new McpError(500, 'Failed to get tasks by assignee');
        }
    },
};

const findOverdueTasks: MCPTool = {
    name: 'find_overdue_tasks',
    description: 'Find all tasks that are past their due date',
    parameters: z.object({}),
    handler: async () => {
        try {
            const now = new Date();
            const tasks = await taskService.getTasks({ dueDate: now });
            const overdueTasks = tasks.filter(
                task => task.status !== TaskStatus.COMPLETED && task.dueDate < now,
            );
            return { tasks: overdueTasks };
        } catch (error) {
            throw new McpError(500, 'Failed to find overdue tasks');
        }
    },
};

const updateTaskStatus: MCPTool = {
    name: 'update_task_status',
    description: 'Update the status of a task',
    parameters: z.object({
        id: z.string(),
        status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED']),
    }),
    handler: async (params) => {
        try {
            const { id, status } = params as { id: string; status: TaskStatus };
            const task = await taskService.updateTask(id, { status });
            return { task };
        } catch (error) {
            if (error instanceof AppError) {
                throw new McpError(404, error.message);
            }
            throw new McpError(500, 'Failed to update task status');
        }
    },
};

const getTaskDetails: MCPTool = {
    name: 'get_task_details',
    description: 'Get detailed information about a task',
    parameters: IdSchema,
    handler: async (params) => {
        try {
            const { id } = IdSchema.parse(params);
            const task = await taskService.getTaskById(id);
            return { task };
        } catch (error) {
            if (error instanceof AppError) {
                throw new McpError(404, error.message);
            }
            throw new McpError(500, 'Failed to get task details');
        }
    },
};

const createTask: MCPTool = {
    name: 'create_task',
    description: 'Create a new task in a project',
    parameters: TaskSchema,
    handler: async (params) => {
        try {
            const taskData = TaskSchema.parse(params);
            const task = await taskService.createTask(taskData);
            return { task };
        } catch (error) {
            console.error('Create task error:', error);
            if (error instanceof z.ZodError) {
                throw new McpError(400, 'Invalid task data');
            }
            if (error instanceof AppError) {
                throw new McpError(404, error.message);
            }
            throw new McpError(500, 'Failed to create task');
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