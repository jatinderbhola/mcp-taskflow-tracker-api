import express from 'express';
import { connectRedis, disconnectRedis } from './config/redis';
import prisma from './config/database';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import { errorHandler } from './middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// API routes
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error handling
app.use(errorHandler);

const shutdown = async () => {
    console.log('Shutting down gracefully...');
    await Promise.all([
        prisma.$disconnect(),
        disconnectRedis(),
    ]);
    process.exit(0);
};

// Handle graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

const start = async () => {
    try {
        // Connect to databases
        await Promise.all([
            prisma.$connect(),
            connectRedis(),
        ]);

        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        await shutdown();
    }
};

start(); 