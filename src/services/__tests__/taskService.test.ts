import { TaskService } from '../taskService';
import {
  createTestProject,
  createTestTask,
  TestData,
  Assertions,
  MockUtils,
} from '../../test/helpers';
import { TaskStatus } from '../../models/types';
import { NotFoundError } from '../../utils/errors';
import { CacheService } from '../cacheService';

describe('TaskService', () => {
  beforeEach(() => {
    MockUtils.resetMocks();
  });

  describe('createTask', () => {
    it('should create a task and invalidate cache', async () => {
      const project = await createTestProject();
      const taskData = TestData.task(project.id, {
        title: 'New Task',
        assignedTo: 'user@example.com',
        assigneeName: 'User',
        status: TaskStatus.TODO,
      });

      const invalidateSpy = MockUtils.taskCacheSpy();

      const task = await TaskService.createTask(taskData);

      Assertions.matchesData(task, taskData);
      Assertions.hasValidDates(task, ['dueDate', 'createdAt', 'updatedAt']);
      expect(invalidateSpy).toHaveBeenCalledWith(task.id, project.id);
    });
  });

  describe('getTasks', () => {
    it('should return tasks from cache if available', async () => {
      const project = await createTestProject();
      const task = await createTestTask(project.id);
      const cacheKey = CacheService.taskKey();
      await CacheService.set(cacheKey, [task]);

      const getSpy = MockUtils.cacheSpy('get');
      const tasks = await TaskService.getTasks();

      Assertions.matchesData(tasks[0], task);
      Assertions.hasValidDates(tasks[0], ['dueDate', 'createdAt', 'updatedAt']);
      expect(getSpy).toHaveBeenCalledWith(cacheKey);
    });

    it('should fetch from database and cache if not in cache', async () => {
      const project = await createTestProject();
      const task = await createTestTask(project.id);
      const cacheKey = CacheService.taskKey();

      const setSpy = MockUtils.cacheSpy('set');
      const tasks = await TaskService.getTasks();

      Assertions.matchesData(tasks[0], task);
      Assertions.hasValidDates(tasks[0], ['dueDate', 'createdAt', 'updatedAt']);
      expect(setSpy).toHaveBeenCalledWith(cacheKey, expect.any(Array));
    });

    it('should filter tasks by status', async () => {
      const project = await createTestProject();
      await createTestTask(project.id, { status: TaskStatus.COMPLETED });
      await createTestTask(project.id, { status: TaskStatus.TODO });

      const tasks = await TaskService.getTasks({ status: TaskStatus.TODO });

      expect(tasks.length).toBeGreaterThan(0);
      Assertions.allHaveProperty(tasks, 'status', TaskStatus.TODO);
    });

    it('should filter tasks by assignee', async () => {
      const project = await createTestProject();
      const assignee = 'test@example.com';
      await createTestTask(project.id, { assignedTo: 'other@example.com' });
      await createTestTask(project.id, { assignedTo: assignee });

      const tasks = await TaskService.getTasks({ assignedTo: assignee });

      expect(tasks.length).toBeGreaterThan(0);
      Assertions.allHaveProperty(tasks, 'assignedTo', assignee);
    });
  });

  describe('getTasksByProjectId', () => {
    it('should return tasks from cache if available', async () => {
      const project = await createTestProject();
      const task = await createTestTask(project.id);
      const cacheKey = CacheService.taskKey(undefined, project.id);
      await CacheService.set(cacheKey, [task]);

      const getSpy = MockUtils.cacheSpy('get');
      const tasks = await TaskService.getTasksByProjectId(project.id);

      Assertions.matchesData(tasks[0], task);
      Assertions.hasValidDates(tasks[0], ['dueDate', 'createdAt', 'updatedAt']);
      expect(getSpy).toHaveBeenCalledWith(cacheKey);
    });
  });

  describe('getTaskById', () => {
    it('should return task from cache if available', async () => {
      const project = await createTestProject();
      const task = await createTestTask(project.id);
      const cacheKey = CacheService.taskKey(task.id);
      await CacheService.set(cacheKey, task);

      const getSpy = MockUtils.cacheSpy('get');
      const result = await TaskService.getTaskById(task.id);

      Assertions.matchesData(result, task);
      Assertions.hasValidDates(result, ['dueDate', 'createdAt', 'updatedAt']);
      expect(getSpy).toHaveBeenCalledWith(cacheKey);
    });

    it('should throw NotFoundError for non-existent task', async () => {
      await expect(TaskService.getTaskById('non-existent-id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateTask', () => {
    it('should update task and invalidate cache', async () => {
      const project = await createTestProject();
      const task = await createTestTask(project.id);
      const updateData = { title: 'Updated Title' };

      const invalidateSpy = MockUtils.taskCacheSpy();
      const updated = await TaskService.updateTask(task.id, updateData);

      expect(updated.title).toBe(updateData.title);
      Assertions.hasValidDates(updated, ['dueDate', 'createdAt', 'updatedAt']);
      expect(invalidateSpy).toHaveBeenCalledWith(task.id, project.id);
    });
  });

  describe('deleteTask', () => {
    it('should delete task and invalidate cache', async () => {
      const project = await createTestProject();
      const task = await createTestTask(project.id);

      const invalidateSpy = MockUtils.taskCacheSpy();
      const deleted = await TaskService.deleteTask(task.id);

      expect(deleted.id).toBe(task.id);
      Assertions.hasValidDates(deleted, ['dueDate', 'createdAt', 'updatedAt']);
      expect(invalidateSpy).toHaveBeenCalledWith(task.id, project.id);

      await expect(TaskService.getTaskById(task.id)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getOverdueTasks', () => {
    it('should return overdue tasks from cache if available', async () => {
      const project = await createTestProject();
      const overdueTask = await createTestTask(project.id, {
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        status: TaskStatus.TODO,
      });
      const cacheKey = CacheService.taskKey(undefined, undefined, { overdue: true });
      await CacheService.set(cacheKey, [overdueTask]);

      const getSpy = MockUtils.cacheSpy('get');
      const tasks = await TaskService.getOverdueTasks();

      Assertions.matchesData(tasks[0], overdueTask);
      Assertions.hasValidDates(tasks[0], ['dueDate', 'createdAt', 'updatedAt']);
      expect(getSpy).toHaveBeenCalledWith(cacheKey);
    });

    it('should only return incomplete overdue tasks', async () => {
      const project = await createTestProject();
      await createTestTask(project.id, {
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        status: TaskStatus.TODO,
      });
      await createTestTask(project.id, {
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        status: TaskStatus.COMPLETED,
      });

      const tasks = await TaskService.getOverdueTasks();

      expect(tasks.length).toBeGreaterThan(0);
      Assertions.allHaveProperty(tasks, 'status', TaskStatus.TODO);
    });
  });
});
