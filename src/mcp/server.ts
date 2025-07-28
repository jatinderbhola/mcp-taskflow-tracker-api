import { Server } from './sdk';
import { projectTools } from './tools/projectTools';
import { taskTools } from './tools/taskTools';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const tools = [...projectTools, ...taskTools];

// Create MCP Server
const server = new Server({
    name: 'project-tracker-mcp',
    version: '1.0.0',
    title: 'Project Tracker MCP Server',
    tools,
});

// Start server
server.start().catch((error: Error) => {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
});

// Keep the process running
process.stdin.resume();

// Handle process signals
process.on('SIGINT', () => {
    console.log('\nShutting down MCP server...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nShutting down MCP server...');
    process.exit(0);
}); 