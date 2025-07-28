import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middleware/errorHandler.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import { swaggerDocument } from './config/swagger.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check endpoint
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Swagger documentation
app.use('/api/docs', swaggerUi.serve);
app.get('/api/docs', swaggerUi.setup(swaggerDocument));

// Serve Swagger JSON
app.get('/swagger.json', (_req, res) => {
    res.json(swaggerDocument);
});

// Error handling middleware
app.use(errorHandler);

// Start Express server
app.listen(port, () => {
    console.log(`Express server is running on port ${port}`);
    console.log(`API Documentation available at http://localhost:${port}/api/docs`);
}); 