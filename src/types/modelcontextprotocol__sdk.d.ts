// declare module '@modelcontextprotocol/sdk/dist/esm/server/index.js' {
//     export interface Tool {
//         name: string;
//         description: string;
//         parameters: unknown;
//         handler: (params: unknown) => Promise<unknown>;
//     }

//     export interface ServerConfig {
//         name: string;
//         version: string;
//         title?: string;
//         tools: Tool[];
//     }

//     export class Server {
//         constructor(config: ServerConfig);
//         start(): Promise<void>;
//     }

//     export class McpError extends Error {
//         constructor(code: number, message: string);
//     }
// }

// declare module '@modelcontextprotocol/sdk/dist/esm/client/index.js' {
//     export interface ClientConfig {
//         transport?: unknown;
//     }

//     export interface InvokeResult<T = unknown> {
//         success: boolean;
//         data?: T;
//         error?: string;
//     }

//     export class Client {
//         constructor(config?: ClientConfig);
//         invoke<T = unknown>(toolName: string, params?: unknown): Promise<InvokeResult<T>>;
//     }
// }
