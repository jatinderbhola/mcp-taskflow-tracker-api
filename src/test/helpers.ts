import { Project, Task } from '@prisma/client';
import prisma from '../config/database'; // Note: This prisma is from main config, but setup.ts overrides for tests
import request from 'supertest';
import { app } from '../index';
import { TestData } from './utils'; // New import
import {
  serializeProject,
  serializeTask,
  SerializedProject,
  SerializedTask,
} from '../utils/dateUtils';

/**
 * Create a test project
 */
export async function createTestProject(
  override: Partial<Project> = {},
): Promise<SerializedProject> {
  const projectData = TestData.project(override);
  const project = await prisma.project.create({ data: projectData });
  return serializeProject(project);
}

/**
 * Create a test task
 */
export async function createTestTask(
  projectId: string,
  override: Partial<Task> = {},
): Promise<SerializedTask> {
  // Verify project exists first
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    // If project doesn't exist, create it
    const projectData = TestData.project();
    const newProject = await prisma.project.create({ data: projectData });
    projectId = newProject.id;
  }

  const taskData = TestData.task(projectId, override);
  const task = await prisma.task.create({ data: taskData });
  return serializeTask(task);
}

/**
 * Create multiple test tasks
 */
export async function createTestTasks(projectId: string, count: number): Promise<SerializedTask[]> {
  // Verify project exists first
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    throw new Error(`Project with ID ${projectId} not found`);
  }

  return Promise.all(
    Array.from({ length: count }, (_, i) =>
      createTestTask(projectId, {
        title: `Test Task ${i + 1}`,
        assignedTo: `user${i + 1}@example.com`,
      }),
    ),
  );
}

/**
 * Clean up test data
 */
export async function cleanupTestData(): Promise<void> {
  // Delete tasks first to avoid foreign key constraints
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
}

/**
 * API test helpers
 */
export const api = {
  // Project endpoints
  projects: {
    getAll: (query = {}) => request(app).get('/api/projects').query(query),
    getById: (id: string) => request(app).get(`/api/projects/${id}`),
    create: (data: Partial<Project>) => request(app).post('/api/projects').send(data),
    update: (id: string, data: Partial<Project>) =>
      request(app).put(`/api/projects/${id}`).send(data),
    delete: (id: string) => request(app).delete(`/api/projects/${id}`),
  },

  // Task endpoints
  tasks: {
    getAll: (query = {}) => request(app).get('/api/tasks').query(query),
    getById: (id: string) => request(app).get(`/api/tasks/${id}`),
    create: (data: Partial<Task>) => request(app).post('/api/tasks').send(data),
    update: (id: string, data: Partial<Task>) => request(app).put(`/api/tasks/${id}`).send(data),
    delete: (id: string) => request(app).delete(`/api/tasks/${id}`),
    getByProject: (projectId: string) => request(app).get(`/api/tasks/project/${projectId}`),
  },
};

// Re-export utilities for convenience
export { TestData, Assertions, MockUtils, TestEnv } from './utils';
