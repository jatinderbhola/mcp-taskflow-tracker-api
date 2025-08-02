/**
 * WorkloadAnalysis - Enhanced workload analysis with proactive insights
 * 
 * PURPOSE: Analyze team member workloads with intelligent recommendations
 * EXPANSION: ML-based workload prediction, burnout detection, capacity planning
 * PERFORMANCE: Real-time analysis with caching, trend detection, predictive modeling
 * INTEGRATION: Seamless integration with project planning and resource management
 */

import { z } from 'zod';
import { ApiClient } from '../apiClient';
import { CacheService } from '../../services/cacheService';

// EXPANSION: Add predictive workload modeling
interface WorkloadPrediction {
    nextWeekScore: number;
    nextMonthScore: number;
    burnoutRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    recommendedActions: string[];
}

// EXPANSION: Add team context and comparative analysis
interface TeamContext {
    teamAverageWorkload: number;
    teamMemberCount: number;
    workloadDistribution: Record<string, number>;
    topPerformers: string[];
    atRiskMembers: string[];
}

// EXPANSION: Add enhanced workload metrics
interface EnhancedWorkloadAnalysis {
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
    // Enhanced fields
    efficiency: number;
    velocityTrend: 'IMPROVING' | 'STABLE' | 'DECLINING';
    capacityUtilization: number;
    riskFactors: string[];
    proactiveInsights: string[];
    prediction?: WorkloadPrediction;
    teamContext?: TeamContext;
}

export class WorkloadAnalysisProcessor {
    private apiClient: ApiClient;
    private debugMode: boolean;

    // CACHE: Analysis cache TTL - 10 minutes for real-time insights
    private readonly ANALYSIS_CACHE_TTL = 600;

    constructor(debugMode: boolean = false) {
        this.debugMode = debugMode;
        this.apiClient = new ApiClient();
    }

    /**
     * Perform comprehensive workload analysis with proactive insights
     * EXPANSION: Add ML-based pattern recognition, burnout prediction
     * PERFORMANCE: Intelligent caching with real-time updates
     */
    async analyzeWorkload(assignee: string): Promise<EnhancedWorkloadAnalysis> {
        const startTime = Date.now();

        try {
            this.debug(`Analyzing workload for: ${assignee}`);

            // CACHE: Check for recent analysis
            const cacheKey = `workload:analysis:${assignee.toLowerCase()}`;
            let cachedAnalysis = await CacheService.get<EnhancedWorkloadAnalysis>(cacheKey);

            if (cachedAnalysis) {
                this.debug(`Retrieved cached analysis for ${assignee}`);
                return cachedAnalysis;
            }

            // Stage 1: Get base workload analysis
            const baseAnalysis = await this.apiClient.getWorkloadAnalysis(assignee);

            // Stage 2: Enhance with proactive insights
            const enhancedAnalysis = await this.enhanceWorkloadAnalysis(baseAnalysis);

            // Stage 3: Add predictive modeling
            enhancedAnalysis.prediction = await this.generateWorkloadPrediction(enhancedAnalysis);

            // Stage 4: Add team context
            enhancedAnalysis.teamContext = await this.generateTeamContext(enhancedAnalysis);

            // CACHE: Store enhanced analysis
            await CacheService.set(cacheKey, enhancedAnalysis, this.ANALYSIS_CACHE_TTL);

            const processingTime = Date.now() - startTime;
            this.debug(`Workload analysis completed for ${assignee} in ${processingTime}ms`);

            return enhancedAnalysis;

        } catch (error) {
            this.debug(`Workload analysis failed for ${assignee}: ${error}`);
            throw error;
        }
    }

    /**
     * Enhance base workload analysis with proactive insights
     * EXPANSION: ML-based efficiency scoring, pattern recognition
     */
    private async enhanceWorkloadAnalysis(baseAnalysis: any): Promise<EnhancedWorkloadAnalysis> {
        const enhanced: EnhancedWorkloadAnalysis = {
            ...baseAnalysis,
            efficiency: this.calculateEfficiency(baseAnalysis),
            velocityTrend: await this.calculateVelocityTrend(baseAnalysis.assignee),
            capacityUtilization: this.calculateCapacityUtilization(baseAnalysis),
            riskFactors: this.identifyRiskFactors(baseAnalysis),
            proactiveInsights: this.generateProactiveInsights(baseAnalysis)
        };

        // Enhance existing insights with proactive analysis
        enhanced.insights = [
            ...baseAnalysis.insights,
            ...enhanced.proactiveInsights
        ];

        // Enhance recommendations with preventive measures
        enhanced.recommendations = [
            ...baseAnalysis.recommendations,
            ...this.generateProactiveRecommendations(enhanced)
        ];

        return enhanced;
    }

    /**
     * Calculate efficiency score based on task completion patterns
     * EXPANSION: ML-based efficiency modeling with historical data
     */
    private calculateEfficiency(analysis: any): number {
        const total = analysis.totalTasks;
        const completed = analysis.statusBreakdown.COMPLETED;
        const overdue = analysis.overdueTasks;

        if (total === 0) return 100;

        // ALGORITHM: Efficiency = (completed / total) * 100 - (overdue penalty)
        const completionRate = (completed / total) * 100;
        const overduePenalty = (overdue / total) * 20; // 20% penalty per overdue task ratio

        return Math.max(0, Math.min(100, completionRate - overduePenalty));
    }

    /**
     * Calculate velocity trend based on recent task completion
     * EXPANSION: Time-series analysis, seasonal pattern detection
     */
    private async calculateVelocityTrend(assignee: string): Promise<'IMPROVING' | 'STABLE' | 'DECLINING'> {
        try {
            // SIMPLIFICATION: Use task completion patterns as proxy for velocity
            const allTasks = await this.apiClient.getTasks({ assigneeName: assignee });
            const completedTasks = allTasks.filter(task => task.status === 'COMPLETED');

            if (completedTasks.length < 3) return 'STABLE';

            // ALGORITHM: Compare recent completion rate with historical average
            const recentTasks = completedTasks.slice(-5);
            const historicalTasks = completedTasks.slice(0, -5);

            if (historicalTasks.length === 0) return 'STABLE';

            const recentRate = recentTasks.length / 5;
            const historicalRate = historicalTasks.length / historicalTasks.length;

            if (recentRate > historicalRate * 1.1) return 'IMPROVING';
            if (recentRate < historicalRate * 0.9) return 'DECLINING';
            return 'STABLE';

        } catch (error) {
            this.debug(`Velocity trend calculation failed: ${error}`);
            return 'STABLE';
        }
    }

    /**
     * Calculate capacity utilization based on workload distribution
     * EXPANSION: Dynamic capacity modeling, skill-based utilization
     */
    private calculateCapacityUtilization(analysis: any): number {
        // ALGORITHM: Capacity = active tasks / optimal capacity (assume 8 active tasks optimal)
        const activeTasks = analysis.statusBreakdown.TODO + analysis.statusBreakdown.IN_PROGRESS;
        const optimalCapacity = 8; // EXPANSION: Make this configurable per person

        return Math.min(100, (activeTasks / optimalCapacity) * 100);
    }

    /**
     * Identify risk factors for workload management
     * EXPANSION: ML-based risk prediction, external factor integration
     */
    private identifyRiskFactors(analysis: any): string[] {
        const riskFactors: string[] = [];

        // HIGH WORKLOAD RISKS
        if (analysis.workloadScore > 85) {
            riskFactors.push('Extremely high workload score indicating potential burnout');
        }

        if (analysis.overdueTasks > 3) {
            riskFactors.push('Multiple overdue tasks indicating capacity or priority issues');
        }

        if (analysis.statusBreakdown.BLOCKED > 2) {
            riskFactors.push('Multiple blocked tasks indicating dependency or resource issues');
        }

        // CAPACITY RISKS
        const activeTasks = analysis.statusBreakdown.TODO + analysis.statusBreakdown.IN_PROGRESS;
        if (activeTasks > 10) {
            riskFactors.push('Too many active tasks may lead to context switching overhead');
        }

        // COMPLETION RISKS
        const totalTasks = analysis.totalTasks;
        const completedTasks = analysis.statusBreakdown.COMPLETED;
        if (totalTasks > 0 && (completedTasks / totalTasks) < 0.3) {
            riskFactors.push('Low task completion rate may indicate scope or skill mismatches');
        }

        // EXPANSION: Add time-based risks, external dependency risks
        return riskFactors;
    }

    /**
     * Generate proactive insights for workload optimization
     * EXPANSION: ML-based insight generation, pattern recognition
     */
    private generateProactiveInsights(analysis: any): string[] {
        const insights: string[] = [];

        // WORKLOAD OPTIMIZATION INSIGHTS
        if (analysis.workloadScore > 70 && analysis.overdueTasks === 0) {
            insights.push('High workload but on track - monitor closely for early warning signs');
        }

        if (analysis.statusBreakdown.IN_PROGRESS > 5) {
            insights.push('Many tasks in progress simultaneously - consider focus prioritization');
        }

        if (analysis.statusBreakdown.TODO > analysis.statusBreakdown.IN_PROGRESS * 2) {
            insights.push('Large backlog relative to active work - potential planning opportunity');
        }

        // EFFICIENCY INSIGHTS
        if (analysis.statusBreakdown.COMPLETED > analysis.statusBreakdown.TODO + analysis.statusBreakdown.IN_PROGRESS) {
            insights.push('Strong completion rate - good candidate for additional responsibilities');
        }

        // COLLABORATION INSIGHTS
        if (analysis.statusBreakdown.BLOCKED > 0) {
            insights.push('Blocked tasks present - may benefit from dependency management support');
        }

        // EXPANSION: Add temporal insights, cross-team collaboration insights
        return insights;
    }

    /**
     * Generate proactive recommendations for workload management
     * EXPANSION: Personalized recommendation engine, learning from outcomes
     */
    private generateProactiveRecommendations(analysis: EnhancedWorkloadAnalysis): string[] {
        const recommendations: string[] = [];

        // CAPACITY MANAGEMENT
        if (analysis.capacityUtilization > 90) {
            recommendations.push('Consider redistributing some tasks or extending deadlines');
            recommendations.push('Schedule regular check-ins to prevent overload');
        }

        if (analysis.capacityUtilization < 50) {
            recommendations.push('Capacity available for additional tasks or stretch projects');
        }

        // EFFICIENCY OPTIMIZATION
        if (analysis.efficiency < 70) {
            recommendations.push('Review task complexity and provide additional support or training');
            recommendations.push('Consider breaking down complex tasks into smaller components');
        }

        // VELOCITY IMPROVEMENT
        if (analysis.velocityTrend === 'DECLINING') {
            recommendations.push('Investigate causes of declining velocity and provide targeted support');
            recommendations.push('Consider workload adjustment or skill development opportunities');
        }

        // RISK MITIGATION
        if (analysis.riskFactors.length > 2) {
            recommendations.push('Multiple risk factors identified - schedule immediate workload review');
            recommendations.push('Consider implementing workload monitoring and early warning systems');
        }

        // EXPANSION: Add personalized recommendations, team-context recommendations
        return recommendations;
    }

    /**
     * Generate workload prediction for capacity planning
     * EXPANSION: ML-based forecasting, external factor integration
     */
    private async generateWorkloadPrediction(analysis: EnhancedWorkloadAnalysis): Promise<WorkloadPrediction> {
        // SIMPLIFICATION: Basic prediction model - in production use ML
        const currentScore = analysis.workloadScore;
        const trend = analysis.velocityTrend;

        let nextWeekScore = currentScore;
        let nextMonthScore = currentScore;

        // ALGORITHM: Adjust predictions based on velocity trend
        switch (trend) {
            case 'IMPROVING':
                nextWeekScore = Math.max(0, currentScore - 5);
                nextMonthScore = Math.max(0, currentScore - 15);
                break;
            case 'DECLINING':
                nextWeekScore = Math.min(100, currentScore + 5);
                nextMonthScore = Math.min(100, currentScore + 15);
                break;
            default:
                // STABLE - minor random variation
                nextWeekScore = currentScore + (Math.random() - 0.5) * 2;
                nextMonthScore = currentScore + (Math.random() - 0.5) * 5;
        }

        // Determine burnout risk
        let burnoutRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
        if (nextMonthScore > 90) burnoutRisk = 'CRITICAL';
        else if (nextMonthScore > 80) burnoutRisk = 'HIGH';
        else if (nextMonthScore > 65) burnoutRisk = 'MEDIUM';

        const recommendedActions = this.generatePredictiveActions(burnoutRisk, trend);

        return {
            nextWeekScore: Math.round(nextWeekScore),
            nextMonthScore: Math.round(nextMonthScore),
            burnoutRisk,
            recommendedActions
        };
    }

    /**
     * Generate team context for comparative analysis
     * EXPANSION: Real team analytics, cross-team comparisons
     */
    private async generateTeamContext(analysis: EnhancedWorkloadAnalysis): Promise<TeamContext> {
        try {
            // DYNAMIC: Calculate real team metrics from database
            const teamMetrics = await this.calculateTeamMetrics();

            return {
                teamAverageWorkload: teamMetrics.averageWorkload,
                teamMemberCount: teamMetrics.memberCount,
                workloadDistribution: {
                    [analysis.assignee]: analysis.workloadScore,
                    'team_avg': teamMetrics.averageWorkload
                },
                topPerformers: teamMetrics.topPerformers,
                atRiskMembers: analysis.workloadScore > 80 ? [analysis.assignee] : []
            };

        } catch (error) {
            this.debug(`Team context generation failed: ${error}`);
            // FALLBACK: Minimal context when team data unavailable
            return {
                teamAverageWorkload: analysis.workloadScore, // Use current user as baseline
                teamMemberCount: 1,
                workloadDistribution: {
                    [analysis.assignee]: analysis.workloadScore
                },
                topPerformers: [], // No comparative data available
                atRiskMembers: analysis.workloadScore > 80 ? [analysis.assignee] : []
            };
        }
    }

    /**
     * Calculate dynamic team metrics from actual database data
     * EXPANSION: Advanced team analytics, performance trending
     * PERFORMANCE: Cache team metrics with appropriate TTL
     */
    private async calculateTeamMetrics(): Promise<{
        averageWorkload: number;
        memberCount: number;
        topPerformers: string[];
    }> {
        try {
            // DYNAMIC: Get all tasks to analyze team performance
            const allTasks = await this.apiClient.getTasks();
            const teamMembers = [...new Set(allTasks
                .map(task => task.assigneeName)
                .filter((name): name is string => name !== undefined && name !== null && name.trim().length > 0)
            )];

            if (teamMembers.length === 0) {
                return {
                    averageWorkload: 50,
                    memberCount: 0,
                    topPerformers: []
                };
            }

            // ALGORITHM: Calculate workload scores for each team member
            const memberWorkloads: { name: string; score: number; completionRate: number }[] = [];

            for (const member of teamMembers) {
                const memberTasks = allTasks.filter(task => task.assigneeName === member);
                const completedTasks = memberTasks.filter(task => task.status === 'COMPLETED');
                const overdueTasks = memberTasks.filter(task => {
                    const dueDate = new Date(task.dueDate);
                    return dueDate < new Date() && task.status !== 'COMPLETED';
                });

                // ALGORITHM: Simple workload scoring based on task distribution and completion
                const totalTasks = memberTasks.length;
                const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) : 0;
                const overdueRatio = totalTasks > 0 ? (overdueTasks.length / totalTasks) : 0;

                // Score: Higher for more tasks, lower for overdue tasks, bonus for completion
                const workloadScore = Math.min(100,
                    (totalTasks * 10) + // Base load
                    (completionRate * 30) - // Completion bonus
                    (overdueRatio * 40) // Overdue penalty
                );

                memberWorkloads.push({
                    name: member,
                    score: Math.max(0, workloadScore),
                    completionRate
                });
            }

            const averageWorkload = memberWorkloads.length > 0
                ? memberWorkloads.reduce((sum, member) => sum + member.score, 0) / memberWorkloads.length
                : 50;

            // ALGORITHM: Top performers based on completion rate and reasonable workload
            const topPerformers = memberWorkloads
                .filter(member => member.completionRate > 0.7 && member.score > 20) // Good completion, some workload
                .sort((a, b) => b.completionRate - a.completionRate) // Sort by completion rate
                .slice(0, 3) // Top 3
                .map(member => member.name);

            return {
                averageWorkload: Math.round(averageWorkload),
                memberCount: teamMembers.length,
                topPerformers
            };

        } catch (error) {
            this.debug(`Team metrics calculation failed: ${error}`);
            return {
                averageWorkload: 50,
                memberCount: 0,
                topPerformers: []
            };
        }
    }

    /**
     * Generate predictive actions based on burnout risk
     * EXPANSION: Personalized action planning, intervention strategies
     */
    private generatePredictiveActions(burnoutRisk: string, trend: string): string[] {
        const actions: string[] = [];

        switch (burnoutRisk) {
            case 'CRITICAL':
                actions.push('IMMEDIATE: Redistribute workload to prevent burnout');
                actions.push('IMMEDIATE: Schedule 1:1 discussion about capacity and support needs');
                actions.push('Consider temporary workload reduction or time off');
                break;

            case 'HIGH':
                actions.push('Schedule workload review within 48 hours');
                actions.push('Identify tasks that can be postponed or reassigned');
                actions.push('Implement daily check-ins for early warning detection');
                break;

            case 'MEDIUM':
                actions.push('Monitor workload trends closely');
                actions.push('Proactively discuss upcoming capacity during planning sessions');
                break;

            default:
                actions.push('Continue current workload management practices');
                if (trend === 'IMPROVING') {
                    actions.push('Consider opportunities for additional responsibilities');
                }
        }

        return actions;
    }

    /**
     * Debug logging with structured output
     * PRODUCTION: Replace with enterprise logging (Winston, Datadog)
     */
    private debug(message: string, data?: any) {
        if (this.debugMode) {
            console.error(`[WorkloadAnalysis] ${message}`, data);
            // PRODUCTION: Add structured logging with correlation IDs
            // MONITORING: Add performance metrics and alerting
        }
    }
}

// EXPANSION: Export enhanced MCP tool
export const workloadAnalysisTool = {
    name: 'Workload Analysis',
    description: 'Comprehensive workload analysis with proactive insights and predictive recommendations',
    parameters: z.object({
        assignee: z.string()
            .min(1, 'Assignee name is required')
            .max(100, 'Assignee name too long')
            .describe('Person name to analyze workload for (e.g., "John", "Jane")')
    }),
    handler: async ({ assignee }: { assignee: string }) => {
        try {
            const processor = new WorkloadAnalysisProcessor(process.env.MCP_DEBUG_MODE === 'true');
            const analysis = await processor.analyzeWorkload(assignee);

            // SAFETY: Ensure analysis is valid
            if (!analysis) {
                throw new Error('Workload analysis returned null or undefined');
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            assignee: analysis.assignee || assignee,
                            summary: `${analysis.assignee || assignee}: ${analysis.totalTasks || 0} tasks, ${analysis.workloadScore || 0}/100 score, ${analysis.efficiency || 0}% efficiency`,
                            workload_score: analysis.workloadScore || 0,
                            efficiency: analysis.efficiency || 0,
                            capacity_utilization: analysis.capacityUtilization || 0,
                            velocity_trend: analysis.velocityTrend || 'STABLE',
                            status_breakdown: analysis.statusBreakdown || { TODO: 0, IN_PROGRESS: 0, COMPLETED: 0, BLOCKED: 0 },
                            overdue_tasks: analysis.overdueTasks || 0,
                            risk_factors: analysis.riskFactors || [],
                            insights: analysis.insights || [],
                            recommendations: analysis.recommendations || [],
                            prediction: analysis.prediction || null,
                            team_context: analysis.teamContext || null,
                            requires_attention: (analysis.workloadScore || 0) > 80 || (analysis.riskFactors || []).length > 1
                        }, null, 2)
                    }
                ]
            };
        } catch (error) {
            console.error(`[WorkloadAnalysis] Handler failed:`, error);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            assignee,
                            success: false,
                            error: (error as Error).message,
                            summary: `Failed to analyze workload for ${assignee}`,
                            insights: ['Workload analysis unavailable'],
                            recommendations: ['Check system connectivity and try again']
                        }, null, 2)
                    }
                ]
            };
        }
    }
};

// EXPANSION: Export processor class for advanced integration
// ENTERPRISE: Add method to register custom workload metrics
// SCALE: Add distributed workload analysis across teams
// PRODUCTION: Add real-time workload monitoring and alerting