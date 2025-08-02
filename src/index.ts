import express from 'express';
import { connectRedis, disconnectRedis } from './config/redis';
import prisma from './config/database';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import { errorHandler } from './middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './config/swagger';

export const app = express();
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
  await Promise.all([prisma.$disconnect(), disconnectRedis()]);
  process.exit(0);
};

// Handle graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

const start = async () => {
  try {
    // Connect to databases
    await Promise.all([prisma.$connect(), connectRedis()]);

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    await shutdown();
  }
};

// Only start the server if we're not in a test environment
if (process.env.NODE_ENV !== 'test') {
  start();
}

/**
 * PRODUCTION-READY FEATURES TODO:
 *
 * === SECURITY ===
 * - Rate limiting setup (express-rate-limit)
 * - Authentication Middleware (JWT, OAuth, SSO)
 * - Authorization Middleware (RBAC, permissions)
 * - Input validation & sanitization (helmet, express-validator)
 * - CORS configuration (cors)
 * - Security headers (helmet)
 * - Request/Response encryption
 * - SQL injection prevention
 * - XSS protection
 * - CSRF protection
 * - Content Security Policy (CSP)
 * - Audit logging for security events
 *
 * === MONITORING & OBSERVABILITY ===
 * - Structured Logger Service (winston/pino)
 * - Error Handling Middleware (centralized error handling)
 * - Health check endpoints (/health (added), /ready, /live)
 * - Metrics collection (Prometheus)
 * - Performance monitoring (New Relic/DataDog)
 * - Alerting setup (PagerDuty/OpsGenie)
 * - Application performance monitoring (APM)
 * - Real-time monitoring dashboard
 *
 * === PERFORMANCE & SCALABILITY ===
 * - Connection pooling (database)
 * - Redis clustering
 * - Load balancing configuration
 * - Caching strategies (Redis (implemented), CDN)
 *
 * === RELIABILITY & RESILIENCE ===
 * - Circuit breaker pattern
 * - Retry mechanisms with exponential backoff
 * - Timeout handling
 * - Graceful shutdown
 * - Auto-restart on crashes
 *
 * === DEVELOPMENT & DEPLOYMENT ===
 * - Environment-specific configurations
 * - Feature flags/toggles
 * - CI/CD pipeline optimization
 *
 * === API & INTEGRATION ===
 * - API versioning strategy
 * - API documentation (Swagger/OpenAPI) (implemented)
 * - API rate limiting per user/IP
 * - Request/Response validation
 *
 * === COMPLIANCE & GOVERNANCE ===
 *
 * === TESTING & QUALITY ===
 *
 */
