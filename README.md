# Project Tracker API with MCP Integration

A TypeScript-based REST API for project and task management with MCP (Model Context Protocol) integration.

## Technology Stack

- Node.js 18+ with TypeScript
- Express.js framework
- PostgreSQL with Prisma ORM
- Redis for caching
- Zod for validation
- Jest for testing
- Swagger/OpenAPI for documentation
- MCP SDK for agent integration

## Project Structure

```
project-tracker-api/
├── src/
│   ├── controllers/     # API route handlers
│   ├── services/        # Business logic layer
│   ├── models/         # Database models/schemas
│   ├── middleware/     # Validation, error handling
│   ├── utils/         # Helper functions and date utilities
│   ├── mcp/          # MCP server implementation
│   ├── config/       # Database and app configuration
│   └── test/         # Test setup and utilities
├── prisma/           # Database schema and migrations
├── docs/            # API documentation and setup guides
└── scripts/         # Setup and seed scripts
```

## Architecture Overview

![Architecture Diagram](docs/architecture.png)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and update the values
4. Initialize the database:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## Database Configuration

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Main database
DATABASE_URL="postgresql://username:password@localhost:5432/taskflow"

# Test database (separate from main)
TEST_DATABASE_URL="postgresql://username:password@localhost:5432/taskflow_test"

# Redis configuration
REDIS_URL="redis://localhost:6379/0"
TEST_REDIS_URL="redis://localhost:6379/1"

# Optional: Use main database for tests (not recommended for production)
USE_MAIN_DB_FOR_TESTS=false
```

### Setting Up Test Database

1. **Create Test Database**:
   ```bash
   createdb taskflow_test
   ```

2. **Run Migrations on Test Database**:
   ```bash
   TEST_DATABASE_URL="postgresql://localhost:5432/taskflow_test" npx prisma migrate deploy
   ```

3. **Verify Setup**:
   ```bash
   npm run test:verify-env
   ```

## Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Database Management
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio for main database
- `npm run prisma:studio:test` - Open Prisma Studio for test database
- `npm run prisma:studio:main` - Open Prisma Studio for main database

### Testing
- `npm test` - Run all tests
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests only
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:watch` - Run tests in watch mode
- `npm run test:setup` - Create test database
- `npm run test:reset` - Reset test database (drop, recreate, migrate)
- `npm run test:verify-env` - Verify environment variables

### MCP Integration
- `npm run mcp:start` - Start MCP server
- `npm run mcp:debug` - Start MCP server in debug mode
- `npm run mcp:example` - Run example MCP workflow

## Testing

### Test Architecture

The project uses a comprehensive testing setup with:

- **Unit Tests**: Test individual service methods and business logic
- **Integration Tests**: Test API endpoints and database interactions
- **Test Utilities**: Centralized test data builders and assertions
- **Date Utils**: Centralized date conversion utilities for consistent testing

### Test Configuration

- **Separate Test Database**: Prevents accidental data loss
- **Redis Isolation**: Uses separate Redis database for tests
- **Environment Detection**: Automatic test environment setup
- **Clean Test Data**: Automatic cleanup between tests

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration

# Run with coverage
npm run test:coverage

# Debug environment setup
npm run test:verify-env
```

### Test Utilities

The test suite includes centralized utilities:

- **TestData**: Builders for creating test projects and tasks
- **Assertions**: Common assertion helpers for date comparisons
- **MockUtils**: Utilities for mocking cache and service calls
- **TestEnv**: Environment detection and configuration

### Test Database Management

```bash
# Quick setup
npm run test:setup

# Reset test database
npm run test:reset

# Verify environment
npm run test:verify-env
```

## API Documentation

Once the server is running, visit `/api/docs` for the Swagger documentation with organized endpoints:

- **Projects**: CRUD operations for project management
- **Tasks**: CRUD operations for task management

## MCP Integration

The API includes MCP tools for:
- Project status queries
- Task management
- Resource allocation
- Progress tracking

### MCP Tools Available

- `getProjectStatus` - Get project status by ID
- `findProjectsByStatus` - Find projects by status
- `findProjectsByDateRange` - Find projects in date range
- `createProject` - Create new project
- `updateProjectStatus` - Update project status
- `getTasksByAssignee` - Get tasks by assignee
- `findOverdueTasks` - Find overdue tasks
- `updateTaskStatus` - Update task status
- `getTaskDetails` - Get task details by ID
- `createTask` - Create new task

## Code Quality

### Architecture Principles

- **DRY (Don't Repeat Yourself)**: Centralized utilities and shared logic
- **KISS (Keep It Simple, Stupid)**: Clean, readable code
- **SOLID Principles**: Proper separation of concerns
- **Clean Code**: Meaningful names and small functions

### Key Features

- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Centralized error handling with custom error classes
- **Caching**: Redis-based caching for frequently accessed data
- **Validation**: Zod schema validation for all inputs
- **Testing**: Comprehensive test coverage with isolated test environment

## Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   ```bash
   # Check PostgreSQL is running
   brew services start postgresql
   
   # Check Redis is running
   brew services start redis
   ```

2. **Test Database Issues**:
   ```bash
   # Reset test database
   npm run test:reset
   
   # Verify environment
   npm run test:verify-env
   ```

3. **Permission Issues**:
   ```bash
   # Check PostgreSQL permissions
   psql -l
   
   # Create user if needed
   createuser -s your_username
   ```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting:
   ```bash
   npm run test:unit
   npm run test:integration
   npm run lint
   ```
4. Submit a pull request

## License

ISC 