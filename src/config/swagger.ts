import { ProjectStatus, TaskStatus } from '../models/types';

export const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'Project Tracker API',
        version: '1.0.0',
        description: 'REST API for project and task management with MCP integration',
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Development server',
        },
    ],
    components: {
        schemas: {
            Project: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'cuid' },
                    name: { type: 'string', minLength: 1, maxLength: 100 },
                    description: { type: 'string', maxLength: 500, nullable: true },
                    startDate: { type: 'string', format: 'date-time' },
                    endDate: { type: 'string', format: 'date-time' },
                    status: { type: 'string', enum: Object.values(ProjectStatus) },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
                required: ['name', 'startDate', 'endDate', 'status'],
            },
            Task: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'cuid' },
                    title: { type: 'string', minLength: 1, maxLength: 100 },
                    assignedTo: { type: 'string' },
                    status: { type: 'string', enum: Object.values(TaskStatus) },
                    dueDate: { type: 'string', format: 'date-time' },
                    projectId: { type: 'string', format: 'cuid' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                },
                required: ['title', 'assignedTo', 'status', 'dueDate', 'projectId'],
            },
            Error: {
                type: 'object',
                properties: {
                    status: { type: 'string' },
                    message: { type: 'string' },
                    details: { type: 'object', nullable: true },
                },
            },
        },
        responses: {
            Error: {
                description: 'Error response',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error',
                        },
                    },
                },
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
                        schema: { type: 'string', enum: Object.values(ProjectStatus) },
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
                    '200': {
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
                    '400': { $ref: '#/components/responses/Error' },
                    '500': { $ref: '#/components/responses/Error' },
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
                    '201': {
                        description: 'Project created',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Project' },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/Error' },
                    '500': { $ref: '#/components/responses/Error' },
                },
            },
        },
        '/api/projects/{id}': {
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'string', format: 'cuid' },
                },
            ],
            get: {
                tags: ['Projects'],
                summary: 'Get a project by ID',
                responses: {
                    '200': {
                        description: 'Project found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Project' },
                            },
                        },
                    },
                    '404': { $ref: '#/components/responses/Error' },
                    '500': { $ref: '#/components/responses/Error' },
                },
            },
            put: {
                tags: ['Projects'],
                summary: 'Update a project',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Project' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Project updated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Project' },
                            },
                        },
                    },
                    '404': { $ref: '#/components/responses/Error' },
                    '500': { $ref: '#/components/responses/Error' },
                },
            },
            delete: {
                tags: ['Projects'],
                summary: 'Delete a project',
                responses: {
                    '204': { description: 'Project deleted' },
                    '404': { $ref: '#/components/responses/Error' },
                    '500': { $ref: '#/components/responses/Error' },
                },
            },
        },
        '/api/projects/{id}/tasks': {
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'string', format: 'cuid' },
                },
            ],
            get: {
                tags: ['Tasks'],
                summary: 'Get tasks for a project',
                responses: {
                    '200': {
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
                    '404': { $ref: '#/components/responses/Error' },
                    '500': { $ref: '#/components/responses/Error' },
                },
            },
            post: {
                tags: ['Tasks'],
                summary: 'Create a new task in project',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Task' },
                        },
                    },
                },
                responses: {
                    '201': {
                        description: 'Task created',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Task' },
                            },
                        },
                    },
                    '400': { $ref: '#/components/responses/Error' },
                    '404': { $ref: '#/components/responses/Error' },
                    '500': { $ref: '#/components/responses/Error' },
                },
            },
        },
        '/api/tasks/{id}': {
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'string', format: 'cuid' },
                },
            ],
            get: {
                tags: ['Tasks'],
                summary: 'Get a task by ID',
                responses: {
                    '200': {
                        description: 'Task found',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Task' },
                            },
                        },
                    },
                    '404': { $ref: '#/components/responses/Error' },
                    '500': { $ref: '#/components/responses/Error' },
                },
            },
            put: {
                tags: ['Tasks'],
                summary: 'Update a task',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Task' },
                        },
                    },
                },
                responses: {
                    '200': {
                        description: 'Task updated',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Task' },
                            },
                        },
                    },
                    '404': { $ref: '#/components/responses/Error' },
                    '500': { $ref: '#/components/responses/Error' },
                },
            },
            delete: {
                tags: ['Tasks'],
                summary: 'Delete a task',
                responses: {
                    '204': { description: 'Task deleted' },
                    '404': { $ref: '#/components/responses/Error' },
                    '500': { $ref: '#/components/responses/Error' },
                },
            },
        },
    },
}; 