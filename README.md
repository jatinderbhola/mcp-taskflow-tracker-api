# Project Tracker API with MCP Integration

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-red.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.10-orange.svg)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-5.6-red.svg)](https://redis.io/)
[![Jest](https://img.shields.io/badge/Jest-29.0-yellow.svg)](https://jestjs.io/)
[![MCP](https://img.shields.io/badge/MCP-1.17-purple.svg)](https://modelcontextprotocol.io/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

A TypeScript-based REST API for project and task management with MCP (Model Context Protocol) integration.

## 👨‍💻 Author

**Jatinder (Jay) Bhola** - Engineering Leader & Tech Lead

- 🏠 **Location**: Toronto, ON, Canada
- 🎯 **Expertise**: Cloud-Native & Event-Driven Architectures, Building Scalable Systems
- 🔗 **Connect**: [GitHub](https://github.com/jatinderbhola) | [LinkedIn](https://www.linkedin.com/in/jatinderbhola)

> *"Engineering leader with 10+ years of experience improving developer workflows and scaling cloud-native systems. Proven track record in leading and delivering high-impact, customer-facing platforms and empowering engineering teams to build fast, resilient web applications."*

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

![Architecture System Diagram](docs/ARCHITECTURE_DESIGN.png)

## Getting Started

### Quick Setup (Recommended)

**For the interviewer or anyone who wants to get everything running quickly:**

```bash
# One-command setup (recommended)
npm run setup
```

This will:
- ✅ Install all dependencies
- ✅ Start PostgreSQL and Redis services
- ✅ Create databases and run migrations
- ✅ Seed test data
- ✅ Build the project
- ✅ Run tests to verify everything works
- ✅ Create environment configuration

**After setup, run the demo to see all features:**
```bash
# Start the API server in one terminal
npm run dev

# Run the demo in another terminal
npm run demo
```

### Manual Setup

If you prefer to set up manually:

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Initialize the database**:
   ```bash
   # Create databases
   createdb taskflow
   createdb taskflow_test
   
   # Generate Prisma client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   ```
4. **Seed test data**:
   ```bash
   node scripts/seed-test-data.js
   ```
5. **Build the project**:
   ```bash
   npm run build
   ```
6. **Start the development server**:
   ```bash
   npm run dev
   ```
7. **Test MCP Integration**:
   ```bash
   # Test MCP server
   npm run mcp:test
   
   # Interactive testing with MCP Inspector
   npm run mcp:inspector
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

## 🤖 MCP Integration

For detailed MCP documentation and architecture, see [docs/ASSESSMENT_DEMONSTRATION.md](docs/ASSESSMENT_DEMONSTRATION.md).

## Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run format` - Format code with Prettier

- `npm run lint` - Run ESLint [TODO]

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
- `npm run mcp:test` - Run unified MCP tests
- `npm run mcp:inspector` - Start MCP Inspector for interactive testing

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

## Security and TODOs

[Read more about the MUST HAVE security integration](/docs/SECURITY_TODO.md)

## License

**Code has been produced with the help of Claude IDE**

ISC 
