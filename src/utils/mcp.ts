import { ApiResponse, Task } from "@/types/mcpApi";

export async function handleGeneralQuery(intent: any, prompt: string) {
    // Handle non-overdue task queries
    const apiUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    const params = new URLSearchParams();

    if (intent.filters.assignee) {
        params.append('assignedTo', intent.filters.assignee);
    }
    if (intent.filters.status) {
        params.append('status', intent.filters.status);
    }

    const response = await fetch(`${apiUrl}/api/tasks?${params}`);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as ApiResponse<Task[]>;

    if (!data.success) {
        throw new Error(data.error || 'API call failed');
    }

    const tasks = data.data || [];

    return {
        query: prompt,
        summary: `Found ${tasks.length} tasks`,
        success: true,
        data: tasks,
        insights: [
            `📋 Total tasks: ${tasks.length}`,
            `🎯 Query confidence: ${(intent.confidence * 100).toFixed(1)}%`
        ],
        recommendations: tasks.length === 0
            ? ['Try different search criteria', 'Check if data exists in system']
            : ['Review task priorities', 'Monitor progress regularly']
    };
}

export function createErrorResponse(operation: string, error: Error) {
    return {
        operation,
        success: false,
        error: error.message,
        suggestions: [
            'Check if the API server is running',
            'Verify the data exists in the system',
            'Try with different parameters',
            'Check network connectivity'
        ],
        timestamp: new Date().toISOString()
    };
}