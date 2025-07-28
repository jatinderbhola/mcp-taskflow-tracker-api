import { z } from 'zod';

export const ProjectStatus = {
    PLANNED: 'PLANNED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    ON_HOLD: 'ON_HOLD',
    CANCELLED: 'CANCELLED',
} as const;

export const TaskStatus = {
    TODO: 'TODO',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    BLOCKED: 'BLOCKED',
} as const;

export type ProjectStatus = typeof ProjectStatus[keyof typeof ProjectStatus];
export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export const ProjectSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).nullable(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED']),
});

export const TaskSchema = z.object({
    title: z.string().min(1).max(100),
    assignedTo: z.string().min(1),
    status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED']),
    dueDate: z.coerce.date(),
    projectId: z.string(),
});

export type Project = z.infer<typeof ProjectSchema>;
export type Task = z.infer<typeof TaskSchema>;

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