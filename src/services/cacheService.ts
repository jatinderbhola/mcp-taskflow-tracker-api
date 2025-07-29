import redisClient from '../config/redis';

// Cache TTL in seconds
const DEFAULT_TTL = 3600; // 1 hour

export class CacheService {
    /**
     * Get data from cache
     */
    static async get<T>(key: string): Promise<T | null> {
        try {
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Cache Get Error:', error);
            return null;
        }
    }

    /**
     * Set data in cache with optional TTL
     */
    static async set(key: string, data: unknown, ttl = DEFAULT_TTL): Promise<void> {
        try {
            const value = JSON.stringify(data);
            await redisClient.setEx(key, ttl, value);
        } catch (error) {
            console.error('Cache Set Error:', error);
        }
    }

    /**
     * Delete data from cache
     */
    static async del(key: string): Promise<void> {
        try {
            await redisClient.del(key);
        } catch (error) {
            console.error('Cache Delete Error:', error);
        }
    }

    /**
     * Generate cache key for projects
     */
    static projectKey(id?: string, filters?: Record<string, unknown>): string {
        if (id) {
            return `project:${id}`;
        }
        return `projects:${filters ? JSON.stringify(filters) : 'all'}`;
    }

    /**
     * Generate cache key for tasks
     */
    static taskKey(id?: string, projectId?: string, filters?: Record<string, unknown>): string {
        if (id) {
            return `task:${id}`;
        }
        if (projectId) {
            return `project:${projectId}:tasks`;
        }
        return `tasks:${filters ? JSON.stringify(filters) : 'all'}`;
    }

    /**
     * Invalidate project-related cache
     */
    static async invalidateProject(projectId: string): Promise<void> {
        try {
            const keys = [
                this.projectKey(projectId),
                this.projectKey(), // all projects
                this.taskKey(undefined, projectId), // project tasks
            ];

            for (const key of keys) {
                await this.del(key);
            }
        } catch (error) {
            // Ignore errors during cache invalidation, especially during cleanup
            console.error('Cache invalidation error (ignored):', error);
        }
    }

    /**
     * Invalidate task-related cache
     */
    static async invalidateTask(taskId: string, projectId: string): Promise<void> {
        try {
            const keys = [
                this.taskKey(taskId),
                this.taskKey(undefined, projectId), // project tasks
                this.taskKey(), // all tasks
                this.projectKey(projectId), // project details
            ];

            for (const key of keys) {
                await this.del(key);
            }
        } catch (error) {
            // Ignore errors during cache invalidation, especially during cleanup
            console.error('Cache invalidation error (ignored):', error);
        }
    }
} 