import { z } from 'zod';

export const ProjectStatus = {
    PLANNED: 'PLANNED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    ON_HOLD: 'ON_HOLD',
    CANCELLED: 'CANCELLED',
    BLOCKED: 'BLOCKED',
} as const;

export const TaskStatus = {
    TODO: 'TODO',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    BLOCKED: 'BLOCKED',
} as const;

export type ProjectStatus = typeof ProjectStatus[keyof typeof ProjectStatus];
export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

// Project validation schema
export const ProjectSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).nullable(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED']),
});

// Task validation schema
export const TaskSchema = z.object({
    title: z.string().min(1).max(100),
    assignedTo: z.string().min(1),
    assigneeName: z.string().optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED']),
    dueDate: z.coerce.date(),
    projectId: z.string(),
});

// Types derived from schemas
export type Project = z.infer<typeof ProjectSchema>;
export type Task = z.infer<typeof TaskSchema>;

// Types for responses
export interface ProjectWithTasks extends Project {
    id: string;
    tasks: Task[];
    createdAt: Date;
    updatedAt: Date;
}

export interface TaskWithProject extends Task {
    id: string;
    project: Project;
    createdAt: Date;
    updatedAt: Date;
}

// Query parameter schemas
export const DateRangeSchema = z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
});

export const PaginationSchema = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10),
});

export const IdSchema = z.object({
    id: z.string().min(1),
}); 