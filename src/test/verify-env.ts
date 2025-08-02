/**
 * Environment verification script
 * Run this to check if environment variables are loaded correctly
 */

import { config } from 'dotenv';

// Load .env file
config();

console.log('🔍 Environment Variable Verification:');
console.log('=====================================');

// Check if .env file was loaded
console.log('📁 .env file loaded:', process.env.NODE_ENV ? 'Yes' : 'No');

// Display all relevant environment variables
const envVars = {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL,
  TEST_REDIS_URL: process.env.TEST_REDIS_URL,
  USE_MAIN_DB_FOR_TESTS: process.env.USE_MAIN_DB_FOR_TESTS,
};

console.log('\n📊 Environment Variables:');
Object.entries(envVars).forEach(([key, value]) => {
  const status = value ? '✅ Set' : '❌ Not Set';
  const displayValue = value
    ? value.substring(0, 50) + (value.length > 50 ? '...' : '')
    : 'undefined';
  console.log(`  ${key}: ${status} (${displayValue})`);
});

console.log('\n🔧 Test Configuration:');
console.log('  Test Database URL:', process.env.TEST_DATABASE_URL || 'Will use fallback');
console.log('  Test Redis URL:', process.env.TEST_REDIS_URL || 'Will use fallback');

// Check if we can connect to the database
if (process.env.TEST_DATABASE_URL) {
  console.log('\n✅ TEST_DATABASE_URL is configured');
} else {
  console.log('\n⚠️  TEST_DATABASE_URL not found, will use fallback');
}
