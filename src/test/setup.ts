import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Create a new Prisma client for tests
const prisma = new PrismaClient();

// Global setup before all tests
beforeAll(async () => {
    // Clean up database before tests
    await prisma.$connect();
    await cleanDatabase();
});

// Global teardown after all tests
afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
});

// Clean up database between tests
afterEach(async () => {
    await cleanDatabase();
});

interface TableName {
    tablename: string;
}

// Helper to clean the test database
async function cleanDatabase(): Promise<void> {
    const tablenames = await prisma.$queryRaw<TableName[]>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

    const tables = tablenames
        .map(({ tablename }: TableName) => tablename)
        .filter((name: string) => name !== '_prisma_migrations')
        .map((name: string) => `"public"."${name}"`)
        .join(', ');

    try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch (error) {
        console.log('Error cleaning database:', error);
    }
}

// Make prisma available globally in tests
declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient;
}
global.prisma = prisma; 