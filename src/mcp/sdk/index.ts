import { z } from 'zod';

export interface Tool {
    name: string;
    description: string;
    parameters: z.ZodType;
    handler: (params: unknown) => Promise<unknown>;
}

export interface ServerConfig {
    name: string;
    version: string;
    title?: string;
    tools: Tool[];
}

// Global request/response handlers
const handlers = new Map<string, (response: any) => void>();
const tools = new Map<string, Tool>();

export class Server {
    constructor(config: ServerConfig) {
        console.log(`Starting MCP Server: ${config.name} v${config.version}`);
        if (config.title) {
            console.log(`Title: ${config.title}`);
        }

        // Register tools
        config.tools.forEach(tool => {
            tools.set(tool.name, tool);
        });
    }

    async start(): Promise<void> {
        console.log('Available tools:');
        tools.forEach((tool, name) => {
            console.log(`- ${name}: ${tool.description}`);
        });
    }

    async handleRequest(request: { id: string; method: string; params: unknown }): Promise<void> {
        const { id, method, params } = request;
        console.log(`[Server] Received request ${id}: ${method}`, params);

        try {
            if (method === 'list_tools') {
                const response = {
                    success: true,
                    data: {
                        tools: Array.from(tools.values()).map(tool => ({
                            name: tool.name,
                            description: tool.description,
                            parameters: tool.parameters,
                        })),
                    },
                };
                console.log(`[Server] Sending response for ${id}:`, response);
                this.sendResponse(id, response);
                return;
            }

            const tool = tools.get(method);
            if (!tool) {
                const response = {
                    success: false,
                    error: `Tool not found: ${method}`,
                };
                console.log(`[Server] Sending error response for ${id}:`, response);
                this.sendResponse(id, response);
                return;
            }

            console.log(`[Server] Executing tool ${method} for request ${id}`);
            const result = await tool.handler(params);
            const response = {
                success: true,
                data: result,
            };
            console.log(`[Server] Sending success response for ${id}:`, response);
            this.sendResponse(id, response);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred';
            const response = {
                success: false,
                error: message,
            };
            console.log(`[Server] Sending error response for ${id}:`, response);
            this.sendResponse(id, response);
        }
    }

    private sendResponse(id: string, response: unknown): void {
        const handler = handlers.get(id);
        if (handler) {
            handler(response);
            handlers.delete(id);
        }
    }
}

export class McpError extends Error {
    constructor(public code: number, message: string) {
        super(message);
        this.name = 'McpError';
    }
}

export class Client {
    private requestId = 0;
    private server?: Server;

    constructor(server?: Server) {
        this.server = server;
        console.log('MCP Client initialized');
    }

    async invoke<T>(toolName: string, params?: unknown): Promise<{ success: boolean; data?: T; error?: string }> {
        return new Promise((resolve) => {
            const id = `req_${++this.requestId}`;
            const request = { id, method: toolName, params };
            console.log(`[Client] Sending request ${id}:`, request);

            // Set up response handler
            handlers.set(id, (response: { success: boolean; data?: T; error?: string }) => {
                console.log(`[Client] Received response for ${id}:`, response);
                resolve(response);
            });

            // Send request
            if (this.server) {
                this.server.handleRequest(request).catch(error => {
                    console.error(`[Client] Error handling request ${id}:`, error);
                    handlers.delete(id);
                    resolve({ success: false, error: 'Internal server error' });
                });
            } else {
                console.error(`[Client] No server available for request ${id}`);
                handlers.delete(id);
                resolve({ success: false, error: 'No server available' });
            }

            // Add timeout
            setTimeout(() => {
                if (handlers.has(id)) {
                    console.log(`[Client] Request ${id} timed out`);
                    handlers.delete(id);
                    resolve({ success: false, error: 'Request timed out' });
                }
            }, 5000); // 5 second timeout
        });
    }
} 