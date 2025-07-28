import { PrismaClient } from '@prisma/client';
import { connectRedis, disconnectRedis } from '../config/redis';
import redisClient from '../config/redis';
import { getTestDatabaseUrl } from './config';

// Set test environment
process.env.NODE_ENV = 'test';

// Get test database URL
const testDatabaseUrl = getTestDatabaseUrl();

// Create a test-specific Prisma client
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: testDatabaseUrl,
        },
    },
});

// Track if environment is initialized
let isInitialized = false;

/**
 * Clean up database and cache
 */
async function cleanupTestEnvironment() {
    try {
        // Clear database in correct order to avoid foreign key constraints
        await prisma.task.deleteMany();
        await prisma.project.deleteMany();

        // Clear Redis cache if connected
        if (redisClient.isOpen) {
            await redisClient.flushDb();
        }
    } catch (error) {
        console.error('Error during test cleanup:', error);
        // Don't throw to avoid stopping tests
    }
}

/**
 * Initialize test environment
 */
async function initializeTestEnvironment() {
    if (isInitialized) {
        return; // Already initialized
    }

    try {
        console.log('🧪 Test Environment Setup');
        console.log('📊 Database URL:', testDatabaseUrl);
        console.log('🔗 Connecting to test database...');

        // Try to connect to the test database
        await prisma.$connect();
        await connectRedis();
        await cleanupTestEnvironment();
        isInitialized = true;

        console.log('✅ Test environment initialized successfully');
        console.log('🧹 Database and cache cleaned');
    } catch (error) {
        console.error('❌ Error initializing test environment:', error);

        // Provide helpful error message for database connection issues
        if (error instanceof Error && (error.message.includes('P1010') || error.message.includes('denied access'))) {
            console.error('\n🔧 Database Setup Required:');
            console.error('The test database does not exist or you do not have access.');
            console.error('\n📋 To fix this, run these commands:');
            console.error('1. Create test database: createdb taskflow_test');
            console.error('2. Run migrations: npx prisma migrate deploy');
            console.error('3. Or use the setup script: npm run test:setup');
            console.error('\n💡 Alternative: Use the main database for tests by setting:');
            console.error('export TEST_DATABASE_URL="postgresql://localhost:5432/taskflow"');
            console.error('\n🔍 Debug: Run "npm run test:verify-env" to check environment variables');
        }

        throw error;
    }
}

/**
 * Clean up test environment
 */
async function teardownTestEnvironment() {
    try {
        console.log('🧹 Cleaning up test environment...');
        await cleanupTestEnvironment();
        await prisma.$disconnect();
        await disconnectRedis();
        isInitialized = false;
        console.log('✅ Test environment cleaned up successfully');
    } catch (error) {
        console.error('❌ Error during test teardown:', error);
        // Don't throw to avoid stopping tests
    }
}

// Jest lifecycle hooks
beforeAll(initializeTestEnvironment);
afterAll(teardownTestEnvironment);
beforeEach(cleanupTestEnvironment);

// Export prisma for use in tests if needed
export { prisma }; 