import { PrismaClient } from '@prisma/client';

// Create a singleton instance of PrismaClient
const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Handle connection errors
prisma.$connect().catch((error: Error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
});

// Handle cleanup on application shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

export default prisma; 