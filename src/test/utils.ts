import { Project, Task } from '@prisma/client';
import { ProjectStatus, TaskStatus } from '../models/types';

/**
 * Test data builders for consistent test data creation
 */
export const TestData = {
    /**
     * Build project data with defaults
     */
    project: (override: Partial<Project> = {}) => ({
        name: 'Test Project',
        description: 'Test Description',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: ProjectStatus.IN_PROGRESS,
        ...override,
    }),

    /**
     * Build task data with defaults
     */
    task: (projectId: string, override: Partial<Task> = {}) => ({
        title: 'Test Task',
        status: TaskStatus.TODO,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        assignedTo: 'test.user@example.com',
        projectId,
        ...override,
    }),
};

/**
 * Common assertion helpers
 */
export const Assertions = {
    /**
     * Assert that an object has the expected properties (excluding dates and IDs)
     */
    matchesData: (actual: any, expected: any, excludeDates = true) => {
        const actualCopy = { ...actual };
        const expectedCopy = { ...expected };

        if (excludeDates) {
            // Remove date fields for comparison
            delete actualCopy.startDate;
            delete actualCopy.endDate;
            delete actualCopy.dueDate;
            delete actualCopy.createdAt;
            delete actualCopy.updatedAt;
            delete expectedCopy.startDate;
            delete expectedCopy.endDate;
            delete expectedCopy.dueDate;
            delete expectedCopy.createdAt;
            delete expectedCopy.updatedAt;
        }

        // Remove ID fields since they can vary between tests
        delete actualCopy.id;
        delete expectedCopy.id;

        expect(actualCopy).toMatchObject(expectedCopy);
    },

    /**
     * Assert that all items in an array have a specific property value
     */
    allHaveProperty: (items: any[], property: string, value: any) => {
        expect(items.every(item => item[property] === value)).toBe(true);
    },

    /**
     * Assert that an object has valid date fields
     */
    hasValidDates: (obj: any, dateFields: string[] = ['createdAt', 'updatedAt']) => {
        dateFields.forEach(field => {
            expect(obj[field]).toBeDefined();
            if (obj[field] instanceof Date) {
                expect(obj[field]).toBeInstanceOf(Date);
            } else {
                expect(typeof obj[field]).toBe('string');
            }
        });
    },
};

/**
 * Mock utilities for common mocking patterns
 */
export const MockUtils = {
    /**
     * Create a spy for cache operations
     */
    cacheSpy: (operation: 'get' | 'set' | 'invalidate') => {
        const { CacheService } = require('../services/cacheService');
        if (operation === 'invalidate') {
            return jest.spyOn(CacheService, 'invalidateProject');
        }
        return jest.spyOn(CacheService, operation);
    },

    /**
     * Create a spy for task cache invalidation
     */
    taskCacheSpy: () => {
        const { CacheService } = require('../services/cacheService');
        return jest.spyOn(CacheService, 'invalidateTask');
    },

    /**
     * Reset all mocks
     */
    resetMocks: () => {
        jest.clearAllMocks();
    },
};

/**
 * Test environment utilities
 */
export const TestEnv = {
    /**
     * Check if we're in test environment
     */
    isTest: () => process.env.NODE_ENV === 'test',

    /**
     * Get test database URL
     */
    getTestDbUrl: () => process.env.DATABASE_URL || 'postgresql://localhost:5432/test_db',

    /**
     * Get test Redis URL
     */
    getTestRedisUrl: () => process.env.REDIS_URL || 'redis://localhost:6379',
}; 