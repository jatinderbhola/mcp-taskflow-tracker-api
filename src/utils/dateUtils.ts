import { Project, Task } from '@prisma/client';

/**
 * Types for objects with Date objects (from database)
 */
export type ProjectWithDates = Omit<
  Project,
  'startDate' | 'endDate' | 'createdAt' | 'updatedAt'
> & {
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type TaskWithDates = Omit<Task, 'dueDate' | 'createdAt' | 'updatedAt'> & {
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Types for serialized objects (for cache/API responses)
 */
export type SerializedProject = Omit<
  Project,
  'startDate' | 'endDate' | 'createdAt' | 'updatedAt'
> & {
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
};

export type SerializedTask = Omit<Task, 'dueDate' | 'createdAt' | 'updatedAt'> & {
  dueDate: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Convert string dates to Date objects for projects
 */
export function convertProjectDates(project: any): ProjectWithDates {
  return {
    ...project,
    startDate: new Date(project.startDate),
    endDate: new Date(project.endDate),
    createdAt: new Date(project.createdAt),
    updatedAt: new Date(project.updatedAt),
  };
}

/**
 * Convert string dates to Date objects for tasks
 */
export function convertTaskDates(task: any): TaskWithDates {
  return {
    ...task,
    dueDate: new Date(task.dueDate),
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
  };
}

/**
 * Convert Date objects to strings for projects (for cache/API)
 */
export function serializeProject(project: Project): SerializedProject {
  return {
    ...project,
    startDate: project.startDate.toISOString(),
    endDate: project.endDate.toISOString(),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

/**
 * Convert Date objects to strings for tasks (for cache/API)
 */
export function serializeTask(task: Task): SerializedTask {
  return {
    ...task,
    dueDate: task.dueDate.toISOString(),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

/**
 * Convert array of projects with dates
 */
export function convertProjectDatesArray(projects: any[]): ProjectWithDates[] {
  return projects.map(convertProjectDates);
}

/**
 * Convert array of tasks with dates
 */
export function convertTaskDatesArray(tasks: any[]): TaskWithDates[] {
  return tasks.map(convertTaskDates);
}
