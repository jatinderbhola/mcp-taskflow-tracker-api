import { ProjectStatus, TaskStatus } from '../models/types';

export const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'Project Tracker API',
        version: '1.0.0',
        description: 'API for managing projects and tasks with MCP integration',
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Local development server',
        },
    ],
    components: {
        schemas: {
            Project: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string', nullable: true },
                    startDate: { type: 'string', format: 'date-time' },
                    endDate: { type: 'string', format: 'date-time' },
                    status: {
                        type: 'string',
                        enum: ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'],
                    },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
                required: ['name', 'startDate', 'endDate', 'status'],
            },
            Task: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    title: { type: 'string' },
                    assignedTo: { type: 'string' },
                    status: {
                        type: 'string',
                        enum: ['TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'],
                    },
                    dueDate: { type: 'string', format: 'date-time' },
                    projectId: { type: 'string' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
                required: ['title', 'assignedTo', 'status', 'dueDate', 'projectId'],
            },
            Error: {
                type: 'object',
                properties: {
                    status: { type: 'string', enum: ['error'] },
                    message: { type: 'string' },
                    code: { type: 'string' },
                    details: { type: 'object' },
                },
                required: ['status', 'message'],
            },
        },
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
    paths: {
        '/api/projects': {
            get: {
                tags: ['Projects'],
                summary: 'Get all projects',
                parameters: [
                    {
                        name: 'status',
                        in: 'query',
                        schema: {
                            type: 'string',
                            enum: ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'],
                        },
                    },
                    {
                        name: 'startDate',
                        in: 'query',
                        schema: { type: 'string', format: 'date' },
                    },
                    {
                        name: 'endDate',
                        in: 'query',
                        schema: { type: 'string', format: 'date' },
                    },
                ],
                responses: {
                    200: {
                        description: 'List of projects',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Project' },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['Projects'],
                summary: 'Create a new project',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Project' },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'Project created successfully',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Project' },
                            },
                        },
                    },
                },
            },
        },
        '/api/projects/{id}': {
            get: {
                tags: ['Projects'],
                summary: 'Get a project by ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                responses: {
                    200: {
                        description: 'Project details',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Project' },
                            },
                        },
                    },
                    404: {
                        description: 'Project not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Error' },
                            },
                        },
                    },
                },
            },
            put: {
                tags: ['Projects'],
                summary: 'Update a project',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Project' },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Project updated successfully',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Project' },
                            },
                        },
                    },
                    404: {
                        description: 'Project not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Error' },
                            },
                        },
                    },
                },
            },
            delete: {
                tags: ['Projects'],
                summary: 'Delete a project',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                responses: {
                    204: { description: 'Project deleted successfully' },
                    404: {
                        description: 'Project not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Error' },
                            },
                        },
                    },
                },
            },
        },
        '/api/tasks': {
            get: {
                tags: ['Tasks'],
                summary: 'Get all tasks',
                parameters: [
                    {
                        name: 'status',
                        in: 'query',
                        schema: {
                            type: 'string',
                            enum: ['TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'],
                        },
                    },
                    {
                        name: 'assignedTo',
                        in: 'query',
                        schema: { type: 'string' },
                    },
                    {
                        name: 'dueDate',
                        in: 'query',
                        schema: { type: 'string', format: 'date' },
                    },
                ],
                responses: {
                    200: {
                        description: 'List of tasks',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Task' },
                                },
                            },
                        },
                    },
                },
            },
            post: {
                tags: ['Tasks'],
                summary: 'Create a new task',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Task' },
                        },
                    },
                },
                responses: {
                    201: {
                        description: 'Task created successfully',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Task' },
                            },
                        },
                    },
                },
            },
        },
        '/api/tasks/{id}': {
            get: {
                tags: ['Tasks'],
                summary: 'Get a task by ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                responses: {
                    200: {
                        description: 'Task details',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Task' },
                            },
                        },
                    },
                    404: {
                        description: 'Task not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Error' },
                            },
                        },
                    },
                },
            },
            put: {
                tags: ['Tasks'],
                summary: 'Update a task',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Task' },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Task updated successfully',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Task' },
                            },
                        },
                    },
                    404: {
                        description: 'Task not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Error' },
                            },
                        },
                    },
                },
            },
            delete: {
                tags: ['Tasks'],
                summary: 'Delete a task',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' },
                    },
                ],
                responses: {
                    204: { description: 'Task deleted successfully' },
                    404: {
                        description: 'Task not found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Error' },
                            },
                        },
                    },
                },
            },
        },
    },
}; 