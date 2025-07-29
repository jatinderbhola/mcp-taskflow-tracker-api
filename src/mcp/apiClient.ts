import { ApiResponse, Task, WorkloadAnalysis, RiskAssessment } from './types';

export class ApiClient {
    private baseUrl: string;

    constructor() {
        this.baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    }

    async getTasks(filters?: { assignee?: string; assigneeName?: string; status?: string; overdue?: boolean }): Promise<Task[]> {
        const params = new URLSearchParams();
        if (filters?.assignee) params.append('assignedTo', filters.assignee);
        if (filters?.assigneeName) params.append('assigneeName', filters.assigneeName);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.overdue) params.append('overdue', 'true');

        const response = await fetch(`${this.baseUrl}/api/tasks?${params}`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // The API returns the array directly, not wrapped in { success, data }
        const data = await response.json() as Task[];

        return data || [];
    }

    async getWorkloadAnalysis(assignee: string): Promise<WorkloadAnalysis> {
        const response = await fetch(`${this.baseUrl}/api/tasks/workload/${encodeURIComponent(assignee)}`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json() as ApiResponse<WorkloadAnalysis>;

        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch workload analysis');
        }

        if (!data.data) {
            throw new Error('No workload data returned');
        }

        return data.data;
    }

    async getRiskAssessment(projectId: string): Promise<RiskAssessment> {
        const response = await fetch(`${this.baseUrl}/api/projects/${encodeURIComponent(projectId)}/risk`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json() as ApiResponse<RiskAssessment>;

        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch risk assessment');
        }

        if (!data.data) {
            throw new Error('No risk assessment data returned');
        }

        return data.data;
    }

    async getProjects(): Promise<any[]> {
        const response = await fetch(`${this.baseUrl}/api/projects`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json() as ApiResponse<any[]>;

        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch projects');
        }

        return data.data || [];
    }
} 