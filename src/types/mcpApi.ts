export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface Task {
    id: string;
    title: string;
    assignedTo: string;
    status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
    dueDate: string;
    project?: {
        name: string;
        id: string;
    };
}

export interface WorkloadAnalysis {
    assignee: string;
    totalTasks: number;
    overdueTasks: number;
    workloadScore: number;
    statusBreakdown: Record<string, number>;
    insights: string[];
    recommendations: string[];
}

export interface RiskAssessment {
    projectId: string;
    projectName: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    riskScore: number;
    progress: number;
    overdueTasks: number;
    blockedTasks: number;
    insights: string[];
    recommendations: string[];
}