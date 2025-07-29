# Project Tracker API with MCP Integration

A TypeScript-based REST API for project and task management with MCP (Model Context Protocol) integration, built for RBC technical assessment.

## 🏗️ Architecture Overview

![Architecture Diagram](architecture.png)

### Core Components
- **REST API**: Express.js with TypeScript, PostgreSQL, Prisma ORM
- **MCP Integration**: Model Context Protocol server with 3 intelligent tools
- **Caching**: Redis for performance optimization
- **Documentation**: Swagger/OpenAPI with comprehensive examples
- **Testing**: Jest unit tests and integration tests

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis (optional, for caching)

### Installation

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd mcp-taskflow-tracker-api
   npm install
   ```

2. **Environment setup:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Database setup:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run seed
   ```

4. **Start the application:**
   ```bash
   npm run dev
   ```

5. **Test MCP integration:**
   ```bash
   npm run build
   node scripts/test-mcp-unified.js
   ```

## 📚 API Documentation

### Core Endpoints

#### Projects
- `GET /api/projects` - List all projects with filtering
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project with tasks
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

#### Tasks
- `GET /api/tasks` - List tasks with filtering
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

#### Analytics
- `GET /api/tasks/workload/:assignee` - Workload analysis
- `GET /api/projects/:id/risk` - Risk assessment

### Interactive Documentation
Visit `http://localhost:3000/api-docs` for Swagger UI.

## 🤖 MCP Integration

### Available Tools

#### 1. `natural_language_query`
Process natural language queries about projects and tasks.

**Input:**
```json
{
  "prompt": "Show Bob's overdue tasks"
}
```

**Output:**
```json
{
  "query": "Show Bob's overdue tasks",
  "summary": "Found 2 overdue tasks for Bob",
  "success": true,
  "data": [...],
  "insights": ["📋 Total tasks: 2", "🚨 2 overdue tasks need attention"],
  "recommendations": ["Prioritize overdue tasks immediately"],
  "analysis": {
    "intent_recognized": "query_tasks",
    "confidence_score": 0.95,
    "filters_applied": {
      "assigneeName": "Bob",
      "overdue": true,
      "status": "IN_PROGRESS"
    }
  }
}
```

#### 2. `workload_analysis`
Analyze workload for specific assignees.

**Input:**
```json
{
  "assignee": "Alice"
}
```

**Output:**
```json
{
  "assignee": "Alice",
  "totalTasks": 6,
  "overdueTasks": 2,
  "workloadScore": 75,
  "statusBreakdown": {
    "TODO": 2,
    "IN_PROGRESS": 2,
    "COMPLETED": 1,
    "BLOCKED": 1
  },
  "insights": ["High workload detected", "2 overdue tasks need attention"],
  "recommendations": ["Consider redistributing workload", "Address overdue tasks"]
}
```

#### 3. `risk_assessment`
Assess project risks and provide mitigation strategies.

**Input:**
```json
{
  "projectId": "project-1"
}
```

**Output:**
```json
{
  "projectId": "project-1",
  "projectName": "Website Redesign",
  "riskLevel": "MEDIUM",
  "riskScore": 65,
  "progress": 40,
  "overdueTasks": 3,
  "blockedTasks": 1,
  "insights": ["Project is behind schedule", "Multiple overdue tasks"],
  "recommendations": ["Accelerate development", "Address blocked dependencies"]
}
```

### Testing MCP Tools

#### Using MCP Inspector
```bash
npx @modelcontextprotocol/inspector node dist/mcp/server.js
```

#### Using Unified Test Script
```bash
node scripts/test-mcp-unified.js
```

## 🧠 Prompt Engineering Architecture

The MCP integration features a sophisticated prompt engineering system with clean architecture:

### Components
- **IntentClassifier**: Pattern-based intent recognition
- **EntityExtractor**: Smart entity extraction (people, projects, conditions)
- **ConfidenceScorer**: Multi-factor confidence calculation
- **PromptEngine**: Main orchestrator with clean pipeline

### Example Flow
```
"Show Bob's overdue tasks"
    ↓
IntentClassifier: query_tasks (confidence: 0.95)
    ↓
EntityExtractor: Bob (person), overdue (condition)
    ↓
API Call: GET /api/tasks?assigneeName=Bob&overdue=true
    ↓
Structured Response: JSON optimized for LLM consumption
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### MCP Tests
```bash
node scripts/test-mcp-unified.js
```

### Environment Verification
```bash
npm run test:verify-env
```

## 📊 Database Schema

### Projects
- `id` (CUID)
- `name` (String)
- `description` (String, optional)
- `startDate` (DateTime)
- `endDate` (DateTime)
- `status` (Enum: PLANNED, IN_PROGRESS, COMPLETED, ON_HOLD, CANCELLED)

### Tasks
- `id` (CUID)
- `title` (String)
- `assignedTo` (String)
- `assigneeName` (String, optional)
- `status` (Enum: TODO, IN_PROGRESS, COMPLETED, BLOCKED)
- `dueDate` (DateTime)
- `projectId` (Foreign Key)

## 🔧 Development

### Project Structure
```
src/
├── controllers/     # API route handlers
├── services/        # Business logic layer
├── models/         # Database models/schemas
├── middleware/     # Validation, error handling
├── utils/         # Helper functions
├── mcp/          # MCP server implementation
│   └── promptEngine/  # NLP components
├── config/       # Database and app configuration
└── test/         # Test setup and utilities
```

### Key Features
- **TypeScript**: Strict typing throughout
- **Prisma ORM**: Type-safe database operations
- **Redis Caching**: Performance optimization
- **Swagger Documentation**: Interactive API docs
- **Comprehensive Testing**: Unit, integration, and MCP tests
- **Error Handling**: Graceful degradation with meaningful messages
- **Logging**: Structured logging for debugging

## 🚀 Production Considerations

### Performance
- Redis caching for frequently accessed data
- Database connection pooling
- Request rate limiting (implemented)

### Security
- Input validation with Zod schemas
- SQL injection prevention (Prisma handles this)
- Error message sanitization

### Monitoring
- Structured logging
- Performance metrics
- Error tracking

### Scalability
- Clean architecture for easy extension
- Modular MCP tools
- Extensible prompt engineering system

## 📝 Assessment Requirements Met

### ✅ Part 1: Project Tracker API
- [x] Create projects with all required fields
- [x] Add tasks with all required fields
- [x] Retrieve projects with associated tasks
- [x] Query/filter projects by fields
- [x] PostgreSQL database with Prisma ORM
- [x] Schema validation and error handling
- [x] **Bonus**: Redis caching
- [x] **Bonus**: Swagger documentation
- [x] **Bonus**: Unit tests and well-structured code

### ✅ Part 2: MCP Agentic Workflow
- [x] MCP-compatible tools (3 tools implemented)
- [x] Accepts natural language prompts
- [x] Calls Project Tracker API internally
- [x] Returns structured JSON for LLM consumption
- [x] Sophisticated prompt engineering technique
- [x] Full flow example documented
- [x] **Bonus**: Input validation and guardrails

### ✅ Architecture Diagram
- [x] API layer (Express.js)
- [x] Database (PostgreSQL with Prisma)
- [x] MCP integration (Model Context Protocol)
- [x] **Bonus**: Observability considerations

## 🎯 Next Steps

1. **Test the API**: Visit `http://localhost:3000/api-docs`
2. **Test MCP Tools**: Use MCP Inspector or unified test script
3. **Explore Code**: Review the clean architecture and documentation
4. **Extend Functionality**: Add new MCP tools or API endpoints

## 📞 Support

For questions about this implementation, refer to the comprehensive documentation in the `docs/` directory or review the inline comments throughout the codebase. 