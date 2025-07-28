import { z } from 'zod';

// Project Status enum
export enum ProjectStatus {
    PLANNED = 'PLANNED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    ON_HOLD = 'ON_HOLD',
    CANCELLED = 'CANCELLED',
}

// Task Status enum
export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    BLOCKED = 'BLOCKED',
}

// Project validation schema
export const ProjectSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    status: z.nativeEnum(ProjectStatus),
});

// Task validation schema
export const TaskSchema = z.object({
    title: z.string().min(1).max(100),
    assignedTo: z.string().min(1),
    status: z.nativeEnum(TaskStatus),
    dueDate: z.coerce.date(),
    projectId: z.string(),
});

// Types derived from schemas
export type Project = z.infer<typeof ProjectSchema>;
export type Task = z.infer<typeof TaskSchema>;

// Types for responses
export type ProjectWithTasks = Project & {
    id: string;
    tasks: Task[];
    createdAt: Date;
    updatedAt: Date;
};

export type TaskWithProject = Task & {
    id: string;
    project: Project;
    createdAt: Date;
    updatedAt: Date;
}; 