import { z } from 'zod';
import { Tool } from './sdk/index.js';

export interface MCPToolResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    metadata?: {
        timestamp: string;
        requestId?: string;
    };
}

// Common schemas for MCP tools
export const DateRangeSchema = z.object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
});

export const PaginationSchema = z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10),
});

export const IdSchema = z.object({
    id: z.string().min(1),
});

// Helper function for consistent response formatting
export function createMCPResponse<T>(
    success: boolean,
    data?: T,
    error?: string,
): MCPToolResponse<T> {
    return {
        success,
        ...(data && { data }),
        ...(error && { error }),
        metadata: {
            timestamp: new Date().toISOString(),
        },
    };
}

// Tool type with proper schema validation
export type MCPTool = Tool & {
    name: string;
    description: string;
    parameters: z.ZodType;
    handler: (params: z.infer<z.ZodType>) => Promise<unknown>;
}; 