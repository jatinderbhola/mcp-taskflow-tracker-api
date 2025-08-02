import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { mcpTools } from './tools';

class ProjectTrackerMCPServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            { name: 'project-tracker-mcp', version: '1.0.0' },
            { capabilities: { tools: {} } }
        );
        this.setupHandlers();
    }

    private setupHandlers() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            console.error('[MCP Server] Listing available tools');

            return {
                tools: mcpTools.map(tool => ({
                    name: tool.name,
                    description: tool.description,
                    inputSchema: {
                        type: 'object',
                        properties: (() => {
                            switch (tool.name) {
                                case 'natural_language_query':
                                    return {
                                        prompt: {
                                            type: 'string',
                                            description: 'Natural language query (e.g., "Show me John\'s overdue tasks")'
                                        }
                                    };
                                case 'workload_analysis':
                                    return {
                                        assignee: {
                                            type: 'string',
                                            description: 'Person to analyze (e.g., "John", "Jane")'
                                        }
                                    };
                                case 'risk_assessment':
                                    return {
                                        projectId: {
                                            type: 'string',
                                            description: 'Project ID to assess (e.g., "project-1", "alpha")'
                                        }
                                    };
                                default:
                                    return {};
                            }
                        })(),
                        required: (() => {
                            switch (tool.name) {
                                case 'natural_language_query': return ['prompt'];
                                case 'workload_analysis': return ['assignee'];
                                case 'risk_assessment': return ['projectId'];
                                default: return [];
                            }
                        })()
                    }
                }))
            };
        });

        // Handle tool execution
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            console.error(`[MCP Server] Executing tool: ${name}`);

            try {
                const tool = mcpTools.find(t => t.name === name);
                if (!tool) {
                    throw new McpError(ErrorCode.MethodNotFound, `Tool not found: ${name}`);
                }

                // Validate parameters
                const validatedParams = tool.parameters.parse(args);

                // Execute tool
                const result = await tool.handler(validatedParams as any);

                console.error(`[MCP Server] Tool ${name} executed successfully`);
                return result;

            } catch (error) {
                console.error(`[MCP Server] Tool execution failed:`, error);

                if (error instanceof McpError) {
                    throw error;
                }

                throw new McpError(
                    ErrorCode.InternalError,
                    `Tool execution failed: ${(error as Error).message}`
                );
            }
        });
    }

    async start() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        // Note: These logs go to stderr to avoid interfering with MCP protocol
        // but they will appear in the "Error output" section of MCP Inspector
        console.error('[MCP Server] Project Tracker MCP Server started successfully');
        console.error('[MCP Server] Available tools:', mcpTools.map(t => t.name).join(', '));
    }
}

// Start the server
const server = new ProjectTrackerMCPServer();
server.start().catch(console.error);
