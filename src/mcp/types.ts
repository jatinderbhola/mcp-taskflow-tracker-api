// MCP-specific types for the Project Tracker API

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    assignedTo: string;
    assigneeName?: string;
    status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
    dueDate: string;
    projectId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
}

export interface WorkloadAnalysis {
    assignee: string;
    totalTasks: number;
    overdueTasks: number;
    workloadScore: number;
    statusBreakdown: {
        TODO: number;
        IN_PROGRESS: number;
        COMPLETED: number;
        BLOCKED: number;
    };
    insights: string[];
    recommendations: string[];
}

export interface RiskAssessment {
    projectId: string;
    projectName: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    riskScore: number;
    progress: number;
    overdueTasks: number;
    blockedTasks: number;
    insights: string[];
    recommendations: string[];
}

export interface MCPTool {
    name: string;
    description: string;
    parameters: any;
    handler: (params: any) => Promise<any>;
}

export interface QueryIntent {
    action: string;
    confidence: number;
    filters: {
        assignee?: string;
        overdue?: boolean;
        projectId?: string;
        status?: string;
    };
    reasoning: string[];
} 