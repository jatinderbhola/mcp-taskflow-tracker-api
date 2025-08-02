/**
 * Test-specific configuration
 */

export const testConfig = {
  // Database configuration
  database: {
    url:
      process.env.TEST_DATABASE_URL ||
      (process.env.DATABASE_URL
        ? `${process.env.DATABASE_URL}_test`
        : 'postgresql://localhost:5432/taskflow_test'),
  },

  // Redis configuration
  redis: {
    url: process.env.TEST_REDIS_URL || 'redis://localhost:6379/1',
  },

  // Test settings
  test: {
    timeout: 10000,
    retries: 3,
  },
};

/**
 * Get test database URL
 */
export function getTestDatabaseUrl(): string {
  return testConfig.database.url;
}

/**
 * Get test Redis URL
 */
export function getTestRedisUrl(): string {
  return testConfig.redis.url;
}
