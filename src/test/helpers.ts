import { PrismaClient } from '@prisma/client';
import { ProjectStatus, TaskStatus } from '@/models/types';

type Project = {
    id: string;
    name: string;
    description: string | null;
    startDate: Date;
    endDate: Date;
    status: ProjectStatus;
    createdAt: Date;
    updatedAt: Date;
};

type Task = {
    id: string;
    title: string;
    assignedTo: string;
    status: TaskStatus;
    dueDate: Date;
    projectId: string;
    createdAt: Date;
    updatedAt: Date;
};

/**
 * Create a test project
 */
export async function createTestProject(
    overrides: Partial<Project> = {},
): Promise<Project> {
    return prisma.project.create({
        data: {
            name: 'Test Project',
            description: 'A test project',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: ProjectStatus.PLANNED,
            ...overrides,
        },
    });
}

/**
 * Create a test task
 */
export async function createTestTask(
    project: Project,
    overrides: Partial<Task> = {},
): Promise<Task> {
    return prisma.task.create({
        data: {
            title: 'Test Task',
            assignedTo: 'test@example.com',
            status: TaskStatus.TODO,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            projectId: project.id,
            ...overrides,
        },
    });
}

/**
 * Create multiple test tasks
 */
export async function createTestTasks(
    project: Project,
    count: number,
    overrides: Partial<Task> = {},
): Promise<Task[]> {
    return Promise.all(
        Array.from({ length: count }, (_, i) =>
            createTestTask(project, {
                title: `Test Task ${i + 1}`,
                ...overrides,
            }),
        ),
    );
}

/**
 * Clean up test data
 */
export async function cleanupTestData(): Promise<void> {
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
} 