import { z } from 'zod';
import { PromptEngine } from './promptEngine/index';
import { ApiClient } from './apiClient';


const promptEngine = new PromptEngine();
const apiClient = new ApiClient();

// Helper function to create error responses
function createErrorResponse(query: string, error: Error) {
    return {
        content: [
            {
                type: 'text',
                text: JSON.stringify({
                    query,
                    success: false,
                    error: error.message,
                    suggestions: [
                        'Try being more specific (e.g., include person names or project IDs)',
                        'Use queries like: "Show Bob\'s overdue tasks", "Analyze Alice\'s workload"',
                        'Make sure referenced projects and people exist in the system'
                    ]
                }, null, 2)
            }
        ]
    };
}

export const mcpTools = [
    {
        name: 'natural_language_query',
        description: 'Process natural language queries about projects and tasks with intelligent parsing',
        parameters: z.object({
            prompt: z.string()
                .min(5, 'Prompt must be at least 5 characters')
                .max(500, 'Prompt must be less than 500 characters')
                .describe('Natural language query (e.g., "Show me all overdue tasks assigned to Bob", "Analyze Alice\'s workload")')
        }),
        handler: async ({ prompt }: { prompt: string }) => {
            console.error(`[MCP Tool] Processing query: "${prompt}"`);

            try {
                // Parse the natural language prompt
                const parsedQuery = promptEngine.parseQuery(prompt);

                // Execute based on intent
                if (parsedQuery.intent === 'analyze_workload' && parsedQuery.filters.assigneeName) {
                    const analysis = await apiClient.getWorkloadAnalysis(parsedQuery.filters.assigneeName);

                    return {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({
                                    query: prompt,
                                    summary: `${analysis.assignee}: ${analysis.totalTasks} tasks, ${analysis.workloadScore}/100 score`,
                                    success: true,
                                    data: analysis,
                                    insights: analysis.insights,
                                    recommendations: analysis.recommendations,
                                    analysis: {
                                        intent_recognized: parsedQuery.intent,
                                        confidence_score: parsedQuery.confidence,
                                        filters_applied: parsedQuery.filters
                                    }
                                }, null, 2)
                            }
                        ]
                    };
                }

                // Default to task query
                const tasks = await apiClient.getTasks({
                    assigneeName: parsedQuery.filters.assigneeName,
                    status: parsedQuery.filters.status,
                    overdue: parsedQuery.filters.overdue
                });

                // Enhanced insights and analysis
                const overdueTasks = tasks.filter(task =>
                    new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'
                );
                const completedTasks = tasks.filter(task => task.status === 'COMPLETED');
                const blockedTasks = tasks.filter(task => task.status === 'BLOCKED');
                const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS');

                const insights = [
                    `📋 Total tasks: ${tasks.length}`,
                    overdueTasks.length > 0 ? `🚨 ${overdueTasks.length} overdue tasks need attention` : '✅ No overdue tasks',
                    inProgressTasks.length > 0 ? `🔄 ${inProgressTasks.length} tasks in progress` : 'No active tasks',
                    completedTasks.length > 0 ? `✅ ${completedTasks.length} tasks completed` : 'No completed tasks',
                    blockedTasks.length > 0 ? `⚠️ ${blockedTasks.length} blocked tasks` : 'No blocked tasks'
                ];

                const recommendations = [];
                if (overdueTasks.length > 0) {
                    recommendations.push('Prioritize overdue tasks immediately');
                    recommendations.push('Schedule urgent task review meeting');
                }
                if (blockedTasks.length > 0) {
                    recommendations.push('Address blocked task dependencies');
                    recommendations.push('Review task blockers and dependencies');
                }
                if (tasks.length > 5) {
                    recommendations.push('Consider redistributing workload');
                    recommendations.push('Review task priorities and deadlines');
                }
                if (recommendations.length === 0) {
                    recommendations.push('Continue monitoring task progress');
                    recommendations.push('Maintain current task management approach');
                }

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                query: prompt,
                                summary: `Found ${tasks.length} tasks${parsedQuery.filters.assigneeName ? ` for ${parsedQuery.filters.assigneeName}` : ''}`,
                                success: true,
                                data: tasks,
                                insights,
                                recommendations,
                                analysis: {
                                    intent_recognized: parsedQuery.intent,
                                    confidence_score: parsedQuery.confidence,
                                    filters_applied: parsedQuery.filters,
                                    task_breakdown: {
                                        total: tasks.length,
                                        overdue: overdueTasks.length,
                                        completed: completedTasks.length,
                                        blocked: blockedTasks.length,
                                        in_progress: inProgressTasks.length
                                    }
                                }
                            }, null, 2)
                        }
                    ]
                };

            } catch (error) {
                console.error(`[MCP Tool] Error processing query:`, error);
                return createErrorResponse(prompt, error as Error);
            }
        }
    },

    {
        name: 'workload_analysis',
        description: 'Analyze workload for a specific person with detailed insights',
        parameters: z.object({
            assignee: z.string()
                .min(1, 'Assignee is required')
                .max(50, 'Assignee name too long')
                .describe('Person to analyze (e.g., "Bob", "Alice")')
        }),
        handler: async ({ assignee }: { assignee: string }) => {
            console.error(`[MCP Tool] Analyzing workload for: ${assignee}`);

            try {
                const analysis = await apiClient.getWorkloadAnalysis(assignee);

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                assignee: analysis.assignee,
                                summary: `${analysis.assignee}: ${analysis.totalTasks} tasks, ${analysis.workloadScore}/100 score`,
                                workload_score: analysis.workloadScore,
                                total_tasks: analysis.totalTasks,
                                overdue_tasks: analysis.overdueTasks,
                                status_breakdown: analysis.statusBreakdown,
                                insights: analysis.insights,
                                recommendations: analysis.recommendations,
                                risk_level: analysis.workloadScore < 40 ? 'HIGH' :
                                    analysis.workloadScore < 70 ? 'MEDIUM' : 'LOW'
                            }, null, 2)
                        }
                    ]
                };

            } catch (error) {
                console.error(`[MCP Tool] Workload analysis failed:`, error);
                return createErrorResponse(`workload analysis for ${assignee}`, error as Error);
            }
        }
    },

    {
        name: 'risk_assessment',
        description: 'Assess project risks and provide recommendations',
        parameters: z.object({
            projectId: z.string()
                .min(1, 'Project ID is required')
                .max(50, 'Project ID too long')
                .describe('Project ID to assess (e.g., "project-1", "alpha")')
        }),
        handler: async ({ projectId }: { projectId: string }) => {
            console.error(`[MCP Tool] Assessing risk for project: ${projectId}`);

            try {
                const assessment = await apiClient.getRiskAssessment(projectId);

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                project_id: assessment.projectId,
                                project_name: assessment.projectName,
                                summary: `${assessment.projectName}: ${assessment.riskLevel} risk (${assessment.riskScore}/100)`,
                                risk_level: assessment.riskLevel,
                                risk_score: assessment.riskScore,
                                progress: assessment.progress,
                                overdue_tasks: assessment.overdueTasks,
                                blocked_tasks: assessment.blockedTasks,
                                insights: assessment.insights,
                                recommendations: assessment.recommendations,
                                requires_attention: assessment.riskScore < 50
                            }, null, 2)
                        }
                    ]
                };

            } catch (error) {
                console.error(`[MCP Tool] Risk assessment failed:`, error);
                return createErrorResponse(`risk assessment for ${projectId}`, error as Error);
            }
        }
    }
];