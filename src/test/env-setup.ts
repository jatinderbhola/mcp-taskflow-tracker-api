/**
 * Test environment setup
 * This file runs before all tests to set up the test environment
 */

// Load environment variables from .env file
import { config } from 'dotenv';
config();

// Set test environment variables
process.env.NODE_ENV = 'test';

// Check if we should use the main database for tests
const useMainDb = process.env.USE_MAIN_DB_FOR_TESTS === 'true';
const baseUrl = process.env.DATABASE_URL || 'postgresql://localhost:5432/taskflow';

if (useMainDb) {
  // Override TEST_DATABASE_URL to use main database
  process.env.TEST_DATABASE_URL = baseUrl;
  console.log('⚠️  WARNING: Using main database for tests!');
  console.log('   Set USE_MAIN_DB_FOR_TESTS=false to use separate test database');
} else if (!process.env.TEST_DATABASE_URL) {
  // Set test database URL if not already set
  process.env.TEST_DATABASE_URL = `${baseUrl}_test`;
}

// Set test Redis URL if not already set
if (!process.env.TEST_REDIS_URL) {
  process.env.TEST_REDIS_URL = 'redis://localhost:6379/1';
}

// Disable logging in tests
process.env.LOG_LEVEL = 'error';

console.log('🧪 Test Environment Variables:');
console.log('📊 TEST_DATABASE_URL:', process.env.TEST_DATABASE_URL);
console.log('🔴 TEST_REDIS_URL:', process.env.TEST_REDIS_URL);
console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
