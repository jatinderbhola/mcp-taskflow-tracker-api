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

export class Server {
    private tools: Tool[];

    constructor(config: ServerConfig) {
        this.tools = config.tools;
        console.log(`Starting MCP Server: ${config.name} v${config.version}`);
        if (config.title) {
            console.log(`Title: ${config.title}`);
        }
    }

    async start(): Promise<void> {
        console.log('Available tools:');
        this.tools.forEach(tool => {
            console.log(`- ${tool.name}: ${tool.description}`);
        });

        process.stdin.on('data', async (data) => {
            try {
                const request = JSON.parse(data.toString());
                const { method, params } = request;

                if (method === 'list_tools') {
                    const response = {
                        tools: this.tools.map(tool => ({
                            name: tool.name,
                            description: tool.description,
                            parameters: tool.parameters,
                        })),
                    };
                    process.stdout.write(JSON.stringify(response) + '\n');
                    return;
                }

                const tool = this.tools.find(t => t.name === method);
                if (!tool) {
                    throw new Error(`Tool not found: ${method}`);
                }

                const result = await tool.handler(params);
                process.stdout.write(JSON.stringify({ result }) + '\n');
            } catch (error) {
                const message = error instanceof Error ? error.message : 'An unknown error occurred';
                process.stdout.write(JSON.stringify({ error: message }) + '\n');
            }
        });
    }
}

export class McpError extends Error {
    constructor(public code: number, message: string) {
        super(message);
        this.name = 'McpError';
    }
}

export class Client {
    constructor() {
        console.log('MCP Client initialized');
    }

    async invoke<T>(toolName: string, params?: unknown): Promise<{ success: boolean; data?: T; error?: string }> {
        try {
            const request = { method: toolName, params };
            process.stdout.write(JSON.stringify(request) + '\n');

            return new Promise((resolve) => {
                const handler = (data: Buffer) => {
                    const response = JSON.parse(data.toString());
                    if (response.error) {
                        resolve({ success: false, error: response.error });
                    } else {
                        resolve({ success: true, data: response.result });
                    }
                    process.stdin.off('data', handler);
                };

                process.stdin.on('data', handler);
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'An unknown error occurred';
            return { success: false, error: message };
        }
    }
} 