import express from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

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

// API routes will be added here
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(undefined, {
    swaggerOptions: {
        url: '/swagger.json',
    },
}));

// Error handling middleware will be added here

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 