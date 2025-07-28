import { Server } from './sdk';
import { projectTools } from './tools/projectTools';
import { taskTools } from './tools/taskTools';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const tools = [...projectTools, ...taskTools];

// Log available tools
console.log('Available MCP tools:');
tools.forEach(tool => {
    console.log(`- ${tool.name}: ${tool.description}`);
});

// Create and start MCP Server
const server = new Server({
    name: 'project-tracker-mcp',
    version: '1.0.0',
    title: 'Project Tracker MCP Server',
    tools,
});

// Handle errors
process.on('uncaughtException', (error: Error) => {
    console.error('Uncaught exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (error: Error) => {
    console.error('Unhandled rejection:', error);
    process.exit(1);
}); 