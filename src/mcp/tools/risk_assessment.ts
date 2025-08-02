/**
 * RiskAssessment - Enhanced project risk analysis with pattern detection
 * 
 * PURPOSE: Assess project risks with intelligent pattern recognition and early warning
 * EXPANSION: ML-based risk prediction, historical pattern analysis, cross-project correlation
 * PERFORMANCE: Real-time risk monitoring, predictive analytics, automated alerting
 * INTEGRATION: Portfolio risk management, resource allocation optimization
 */

import { z } from 'zod';
import { ApiClient } from '../apiClient';
import { CacheService } from '../../services/cacheService';

// EXPANSION: Add risk pattern classification
interface RiskPattern {
    type: 'SCHEDULE_RISK' | 'RESOURCE_RISK' | 'SCOPE_RISK' | 'QUALITY_RISK' | 'DEPENDENCY_RISK';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    confidence: number;
    description: string;
    indicators: string[];
    recommendations: string[];
}

// EXPANSION: Add trend analysis and forecasting
interface RiskTrend {
    direction: 'IMPROVING' | 'STABLE' | 'DETERIORATING' | 'CRITICAL';
    velocity: number; // Rate of change
    forecastedRisk: number; // Predicted risk in 30 days
    trendFactors: string[];
}

// EXPANSION: Add comparative risk analysis
interface ProjectComparison {
    similarProjects: string[];
    benchmarkRisk: number;
    performanceRelative: 'BETTER' | 'SIMILAR' | 'WORSE';
    lessonsLearned: string[];
}

// EXPANSION: Add enhanced risk assessment
interface EnhancedRiskAssessment {
    projectId: string;
    projectName: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    riskScore: number;
    progress: number;
    overdueTasks: number;
    blockedTasks: number;
    insights: string[];
    recommendations: string[];
    // Enhanced fields
    patterns: RiskPattern[];
    trend: RiskTrend;
    earlyWarnings: string[];
    mitigationStrategies: string[];
    comparison?: ProjectComparison;
    riskBreakdown: {
        schedule: number;
        resource: number;
        scope: number;
        quality: number;
        dependencies: number;
    };
    monitoringRecommendations: string[];
}

export class RiskAssessmentProcessor {
    private apiClient: ApiClient;
    private debugMode: boolean;

    // CACHE: Risk assessment cache TTL - 15 minutes for timely updates
    private readonly RISK_CACHE_TTL = 900;

    constructor(debugMode: boolean = false) {
        this.debugMode = debugMode;
        this.apiClient = new ApiClient();
    }

    /**
     * Perform comprehensive risk assessment with pattern detection
     * EXPANSION: ML-based risk modeling, real-time pattern recognition
     * PERFORMANCE: Intelligent caching with automated refresh triggers
     */
    async assessProjectRisk(projectId: string): Promise<EnhancedRiskAssessment> {
        const startTime = Date.now();

        try {
            this.debug(`Assessing risk for project: ${projectId}`);

            // CACHE: Check for recent assessment
            const cacheKey = `risk:assessment:${projectId}`;
            let cachedAssessment = await CacheService.get<EnhancedRiskAssessment>(cacheKey);

            if (cachedAssessment) {
                this.debug(`Retrieved cached risk assessment for ${projectId}`);
                return cachedAssessment;
            }

            // Stage 1: Get base risk assessment
            const baseAssessment = await this.apiClient.getRiskAssessment(projectId);

            // Stage 2: Enhance with pattern detection
            const enhancedAssessment = await this.enhanceRiskAssessment(baseAssessment);

            // Stage 3: Add trend analysis
            enhancedAssessment.trend = await this.analyzeTrend(enhancedAssessment);

            // Stage 4: Detect risk patterns
            enhancedAssessment.patterns = await this.detectRiskPatterns(enhancedAssessment);

            // Stage 5: Generate early warnings
            enhancedAssessment.earlyWarnings = this.generateEarlyWarnings(enhancedAssessment);

            // Stage 6: Add comparative analysis
            enhancedAssessment.comparison = await this.generateProjectComparison(enhancedAssessment);

            // CACHE: Store enhanced assessment
            await CacheService.set(cacheKey, enhancedAssessment, this.RISK_CACHE_TTL);

            const processingTime = Date.now() - startTime;
            this.debug(`Risk assessment completed for ${projectId} in ${processingTime}ms`);

            return enhancedAssessment;

        } catch (error) {
            this.debug(`Risk assessment failed for ${projectId}: ${error}`);
            throw error;
        }
    }

    /**
     * Enhance base risk assessment with detailed breakdown
     * EXPANSION: ML-based risk factor weighting, domain-specific analysis
     */
    private async enhanceRiskAssessment(baseAssessment: any): Promise<EnhancedRiskAssessment> {
        const enhanced: EnhancedRiskAssessment = {
            ...baseAssessment,
            patterns: [],
            trend: {
                direction: 'STABLE',
                velocity: 0,
                forecastedRisk: baseAssessment.riskScore,
                trendFactors: []
            },
            earlyWarnings: [],
            mitigationStrategies: this.generateMitigationStrategies(baseAssessment),
            riskBreakdown: this.calculateRiskBreakdown(baseAssessment),
            monitoringRecommendations: this.generateMonitoringRecommendations(baseAssessment)
        };

        // Enhance existing insights with pattern-based analysis
        enhanced.insights = [
            ...baseAssessment.insights,
            ...this.generatePatternInsights(enhanced)
        ];

        // Enhance recommendations with proactive measures
        enhanced.recommendations = [
            ...baseAssessment.recommendations,
            ...enhanced.mitigationStrategies
        ];

        return enhanced;
    }

    /**
     * Calculate detailed risk breakdown by category
     * EXPANSION: Dynamic weighting based on project type and phase
     */
    private calculateRiskBreakdown(assessment: any): any {
        const baseScore = assessment.riskScore;

        // ALGORITHM: Distribute risk score across categories based on indicators
        const breakdown = {
            schedule: 0,
            resource: 0,
            scope: 0,
            quality: 0,
            dependencies: 0
        };

        // Schedule risk factors
        if (assessment.overdueTasks > 0) {
            breakdown.schedule = Math.min(100, (assessment.overdueTasks / 10) * 100);
        }

        // Resource risk factors (blocked tasks indicate resource issues)
        if (assessment.blockedTasks > 0) {
            breakdown.resource = Math.min(100, (assessment.blockedTasks / 5) * 100);
        }

        // Progress-based scope risk
        const expectedProgress = 50; // EXPANSION: Calculate based on project timeline
        if (assessment.progress < expectedProgress) {
            breakdown.scope = Math.min(100, (expectedProgress - assessment.progress) * 2);
        }

        // Quality risk (inferred from rework indicators)
        breakdown.quality = Math.max(0, baseScore - 40); // High base score suggests quality issues

        // Dependency risk (blocked tasks + overdue combination)
        breakdown.dependencies = Math.min(100, (assessment.blockedTasks + assessment.overdueTasks) * 10);

        return breakdown;
    }

    /**
     * Analyze project risk trends over time
     * EXPANSION: Time-series analysis, seasonal pattern detection
     */
    private async analyzeTrend(assessment: EnhancedRiskAssessment): Promise<RiskTrend> {
        try {
            // ALGORITHM: Basic trend analysis - in production use historical time-series data
            const currentRisk = assessment.riskScore;

            // ALGORITHM: Simulate trend based on current risk indicators
            let direction: 'IMPROVING' | 'STABLE' | 'DETERIORATING' | 'CRITICAL' = 'STABLE';
            let velocity = 0;
            let forecastedRisk = currentRisk;
            const trendFactors: string[] = [];

            // Analyze trend indicators
            if (assessment.overdueTasks > 3) {
                direction = 'DETERIORATING';
                velocity = 5; // Risk increasing by 5 points per week
                forecastedRisk = Math.min(100, currentRisk + 15);
                trendFactors.push('Multiple overdue tasks indicate declining project health');
            }

            if (assessment.blockedTasks > 2) {
                if (direction !== 'DETERIORATING') direction = 'DETERIORATING';
                velocity += 3;
                forecastedRisk = Math.min(100, forecastedRisk + 10);
                trendFactors.push('Blocked tasks accumulating faster than resolution');
            }

            if (assessment.progress > 80 && assessment.riskScore < 30) {
                direction = 'IMPROVING';
                velocity = -2; // Risk decreasing
                forecastedRisk = Math.max(0, currentRisk - 5);
                trendFactors.push('Strong progress with low risk indicators');
            }

            if (currentRisk > 90) {
                direction = 'CRITICAL';
                trendFactors.push('Risk score at critical levels requiring immediate intervention');
            }

            return {
                direction,
                velocity,
                forecastedRisk: Math.round(forecastedRisk),
                trendFactors
            };

        } catch (error) {
            this.debug(`Trend analysis failed: ${error}`);
            return {
                direction: 'STABLE',
                velocity: 0,
                forecastedRisk: assessment.riskScore,
                trendFactors: []
            };
        }
    }

    /**
     * Detect risk patterns using intelligent analysis
     * EXPANSION: ML-based pattern recognition, historical pattern matching
     */
    private async detectRiskPatterns(assessment: EnhancedRiskAssessment): Promise<RiskPattern[]> {
        const patterns: RiskPattern[] = [];

        // PATTERN: Schedule Risk Pattern
        if (assessment.overdueTasks > 2 && assessment.progress < 70) {
            patterns.push({
                type: 'SCHEDULE_RISK',
                severity: assessment.overdueTasks > 5 ? 'CRITICAL' : 'HIGH',
                confidence: 0.85,
                description: 'Schedule slippage pattern detected with accumulating overdue tasks',
                indicators: [
                    `${assessment.overdueTasks} overdue tasks`,
                    `${assessment.progress}% progress (below expected)`
                ],
                recommendations: [
                    'Reassess project timeline and resource allocation',
                    'Implement daily standup meetings for better tracking',
                    'Consider scope reduction or deadline extension'
                ]
            });
        }

        // PATTERN: Resource Bottleneck Pattern
        if (assessment.blockedTasks > 1 && assessment.riskBreakdown.resource > 60) {
            patterns.push({
                type: 'RESOURCE_RISK',
                severity: assessment.blockedTasks > 3 ? 'HIGH' : 'MEDIUM',
                confidence: 0.78,
                description: 'Resource bottleneck pattern with multiple blocked tasks',
                indicators: [
                    `${assessment.blockedTasks} blocked tasks`,
                    'High resource risk score',
                    'Potential skill or capacity gaps'
                ],
                recommendations: [
                    'Identify and resolve blocking dependencies',
                    'Consider additional resource allocation',
                    'Implement cross-training to reduce single points of failure'
                ]
            });
        }

        // PATTERN: Quality Risk Pattern
        if (assessment.riskBreakdown.quality > 50 && assessment.trend.direction === 'DETERIORATING') {
            patterns.push({
                type: 'QUALITY_RISK',
                severity: 'MEDIUM',
                confidence: 0.65,
                description: 'Quality degradation pattern with increasing technical debt',
                indicators: [
                    'High quality risk indicators',
                    'Deteriorating trend detected',
                    'Potential technical debt accumulation'
                ],
                recommendations: [
                    'Implement additional quality gates',
                    'Increase code review coverage',
                    'Consider refactoring sprints'
                ]
            });
        }

        // PATTERN: Dependency Risk Pattern
        if (assessment.riskBreakdown.dependencies > 70) {
            patterns.push({
                type: 'DEPENDENCY_RISK',
                severity: 'HIGH',
                confidence: 0.82,
                description: 'Complex dependency pattern increasing project vulnerability',
                indicators: [
                    'High dependency risk score',
                    'Multiple external dependencies',
                    'Potential cascading failure risk'
                ],
                recommendations: [
                    'Map and document all critical dependencies',
                    'Develop contingency plans for key dependencies',
                    'Implement regular dependency health checks'
                ]
            });
        }

        // EXPANSION: Add more sophisticated pattern detection algorithms
        return patterns;
    }

    /**
     * Generate early warning signals
     * EXPANSION: Predictive alerting, threshold-based monitoring
     */
    private generateEarlyWarnings(assessment: EnhancedRiskAssessment): string[] {
        const warnings: string[] = [];

        // THRESHOLD-BASED WARNINGS
        if (assessment.riskScore > 80) {
            warnings.push('CRITICAL: Risk score above 80 - immediate attention required');
        }

        if (assessment.trend.direction === 'DETERIORATING' && assessment.trend.velocity > 3) {
            warnings.push('WARNING: Risk rapidly increasing - intervention needed within 48 hours');
        }

        if (assessment.overdueTasks > 5) {
            warnings.push('ALERT: High number of overdue tasks - schedule review required');
        }

        if (assessment.blockedTasks > 3) {
            warnings.push('ALERT: Multiple blocked tasks - dependency management needed');
        }

        // PATTERN-BASED WARNINGS
        const criticalPatterns = assessment.patterns.filter(p => p.severity === 'CRITICAL' || p.severity === 'HIGH');
        if (criticalPatterns.length > 1) {
            warnings.push('WARNING: Multiple high-severity risk patterns detected');
        }

        // PREDICTIVE WARNINGS
        if (assessment.trend.forecastedRisk > 90) {
            warnings.push('FORECAST: Risk projected to reach critical levels within 30 days');
        }

        return warnings;
    }

    /**
     * Generate comprehensive mitigation strategies
     * EXPANSION: AI-powered strategy recommendation, success rate tracking
     */
    private generateMitigationStrategies(assessment: any): string[] {
        const strategies: string[] = [];

        // SCHEDULE MITIGATION
        if (assessment.overdueTasks > 0) {
            strategies.push('Schedule mitigation: Prioritize overdue tasks and reassess timeline');
            strategies.push('Consider parallel workstreams to accelerate critical path');
        }

        // RESOURCE MITIGATION
        if (assessment.blockedTasks > 0) {
            strategies.push('Resource mitigation: Establish dedicated unblocking sessions');
            strategies.push('Create escalation paths for persistent blockers');
        }

        // GENERAL MITIGATION
        if (assessment.riskScore > 70) {
            strategies.push('Risk mitigation: Implement daily risk monitoring and reporting');
            strategies.push('Consider bringing in additional expertise or resources');
        }

        // EXPANSION: Add context-specific mitigation strategies
        return strategies;
    }

    /**
     * Generate pattern-based insights
     * EXPANSION: ML-based insight generation, cross-project learning
     */
    private generatePatternInsights(assessment: EnhancedRiskAssessment): string[] {
        const insights: string[] = [];

        // PATTERN INSIGHTS
        if (assessment.patterns.length > 0) {
            insights.push(`${assessment.patterns.length} risk patterns detected requiring attention`);

            const highSeverityPatterns = assessment.patterns.filter(p => p.severity === 'HIGH' || p.severity === 'CRITICAL');
            if (highSeverityPatterns.length > 0) {
                insights.push(`${highSeverityPatterns.length} high-severity patterns need immediate action`);
            }
        }

        // TREND INSIGHTS
        if (assessment.trend.direction !== 'STABLE') {
            insights.push(`Risk trend is ${assessment.trend.direction.toLowerCase()} with velocity ${assessment.trend.velocity}`);
        }

        // BREAKDOWN INSIGHTS
        const highestRisk = Object.entries(assessment.riskBreakdown)
            .sort(([, a], [, b]) => b - a)[0];

        if (highestRisk[1] > 50) {
            insights.push(`${highestRisk[0]} risk category shows highest concern at ${highestRisk[1]}%`);
        }

        return insights;
    }

    /**
     * Generate monitoring recommendations
     * EXPANSION: Automated monitoring setup, alerting configuration
     */
    private generateMonitoringRecommendations(assessment: any): string[] {
        const recommendations: string[] = [];

        if (assessment.riskScore > 60) {
            recommendations.push('Implement daily risk score monitoring with automated alerts');
            recommendations.push('Set up weekly stakeholder risk review meetings');
        }

        if (assessment.overdueTasks > 2) {
            recommendations.push('Monitor overdue task count with threshold alerting');
        }

        if (assessment.blockedTasks > 1) {
            recommendations.push('Track blocked task resolution time and escalation patterns');
        }

        return recommendations;
    }

    /**
     * Generate project comparison analysis
     * EXPANSION: ML-based project similarity, historical outcome prediction
     */
    private async generateProjectComparison(assessment: EnhancedRiskAssessment): Promise<ProjectComparison> {
        try {
            // DYNAMIC: Calculate real project benchmarks from database
            const projectBenchmarks = await this.calculateProjectBenchmarks(assessment);

            return {
                similarProjects: projectBenchmarks.similarProjects,
                benchmarkRisk: projectBenchmarks.averageRisk,
                performanceRelative: this.determineRelativePerformance(assessment.riskScore, projectBenchmarks.averageRisk),
                lessonsLearned: projectBenchmarks.lessonsLearned
            };

        } catch (error) {
            this.debug(`Project comparison failed: ${error}`);
            // FALLBACK: Minimal comparison when project data unavailable
            return {
                similarProjects: [],
                benchmarkRisk: 50, // Industry average
                performanceRelative: assessment.riskScore < 50 ? 'BETTER' : assessment.riskScore > 50 ? 'WORSE' : 'SIMILAR',
                lessonsLearned: [
                    'Monitor project metrics regularly for early risk detection',
                    'Establish clear communication channels with stakeholders'
                ]
            };
        }
    }

    /**
     * Calculate dynamic project benchmarks from actual database data  
     * EXPANSION: Advanced project analytics, similarity algorithms
     * PERFORMANCE: Cache project benchmarks with appropriate TTL
     */
    private async calculateProjectBenchmarks(currentAssessment: EnhancedRiskAssessment): Promise<{
        similarProjects: string[];
        averageRisk: number;
        lessonsLearned: string[];
    }> {
        try {
            // DYNAMIC: Get all projects to analyze benchmarks
            const allProjects = await this.apiClient.getProjects();
            const allTasks = await this.apiClient.getTasks();

            if (allProjects.length === 0) {
                return {
                    similarProjects: [],
                    averageRisk: 50,
                    lessonsLearned: []
                };
            }

            // ALGORITHM: Calculate risk scores for each project
            const projectRisks: { name: string; id: string; riskScore: number; status: string }[] = [];

            for (const project of allProjects) {
                const projectTasks = allTasks.filter(task => task.projectId === project.id);

                if (projectTasks.length === 0) continue;

                const totalTasks = projectTasks.length;
                const overdueTasks = projectTasks.filter(task => {
                    const dueDate = new Date(task.dueDate);
                    return dueDate < new Date() && task.status !== 'COMPLETED';
                });
                const blockedTasks = projectTasks.filter(task => task.status === 'BLOCKED');
                const completedTasks = projectTasks.filter(task => task.status === 'COMPLETED');

                // ALGORITHM: Simple risk scoring based on task health
                const overdueRatio = overdueTasks.length / totalTasks;
                const blockedRatio = blockedTasks.length / totalTasks;
                const completionRatio = completedTasks.length / totalTasks;

                const riskScore = Math.min(100, Math.max(0,
                    (overdueRatio * 50) + // Overdue tasks increase risk
                    (blockedRatio * 40) + // Blocked tasks increase risk
                    ((1 - completionRatio) * 30) // Low completion increases risk
                ));

                projectRisks.push({
                    name: project.name,
                    id: project.id,
                    riskScore: Math.round(riskScore),
                    status: project.status
                });
            }

            const averageRisk = projectRisks.length > 0
                ? Math.round(projectRisks.reduce((sum, project) => sum + project.riskScore, 0) / projectRisks.length)
                : 50;

            // ALGORITHM: Find similar projects based on risk score proximity and status
            const currentRisk = currentAssessment.riskScore;
            const similarProjects = projectRisks
                .filter(project =>
                    project.id !== currentAssessment.projectId && // Exclude current project
                    Math.abs(project.riskScore - currentRisk) < 20 && // Similar risk range
                    project.status !== 'CANCELLED' // Active projects only
                )
                .sort((a, b) => Math.abs(a.riskScore - currentRisk) - Math.abs(b.riskScore - currentRisk)) // Sort by similarity
                .slice(0, 3) // Top 3 similar
                .map(project => project.name);

            // ALGORITHM: Generate lessons learned based on project patterns
            const lessonsLearned: string[] = [];

            if (projectRisks.some(p => p.riskScore < 30)) {
                lessonsLearned.push('Low-risk projects maintain regular task completion and minimal blockers');
            }

            if (projectRisks.some(p => p.riskScore > 70)) {
                lessonsLearned.push('High-risk projects often have accumulating overdue tasks requiring intervention');
            }

            if (projectRisks.filter(p => p.status === 'COMPLETED').length > 0) {
                lessonsLearned.push('Successful projects demonstrate consistent progress tracking and proactive issue resolution');
            }

            return {
                similarProjects,
                averageRisk,
                lessonsLearned
            };

        } catch (error) {
            this.debug(`Project benchmarks calculation failed: ${error}`);
            return {
                similarProjects: [],
                averageRisk: 50,
                lessonsLearned: []
            };
        }
    }

    /**
     * Determine relative performance compared to benchmark
     * EXPANSION: More nuanced performance categories, trend analysis
     */
    private determineRelativePerformance(currentRisk: number, benchmarkRisk: number): 'BETTER' | 'SIMILAR' | 'WORSE' {
        const difference = currentRisk - benchmarkRisk;

        if (difference < -10) return 'BETTER';
        if (difference > 10) return 'WORSE';
        return 'SIMILAR';
    }

    /**
     * Debug logging with structured output
     * PRODUCTION: Replace with enterprise logging (Winston, Datadog)
     */
    private debug(message: string, data?: any) {
        if (this.debugMode) {
            console.error(`[RiskAssessment] ${message}`, data);
            // PRODUCTION: Add structured logging with correlation IDs
            // MONITORING: Add performance metrics and alerting
        }
    }
}

// EXPANSION: Export enhanced MCP tool
export const riskAssessmentTool = {
    name: 'risk_assessment',
    description: 'Comprehensive project risk assessment with pattern detection and predictive analytics',
    parameters: z.object({
        projectId: z.string()
            .min(1, 'Project ID is required')
            .max(50, 'Project ID too long')
            .describe('Project ID to assess (e.g., "project-1", "alpha-initiative")')
    }),
    handler: async ({ projectId }: { projectId: string }) => {
        try {
            const processor = new RiskAssessmentProcessor(process.env.MCP_DEBUG_MODE === 'true');
            const assessment = await processor.assessProjectRisk(projectId);

            // SAFETY: Ensure assessment is valid
            if (!assessment) {
                throw new Error('Risk assessment returned null or undefined');
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            project_id: assessment.projectId || projectId,
                            project_name: assessment.projectName || projectId,
                            summary: `${assessment.projectName || projectId}: ${assessment.riskLevel || 'UNKNOWN'} risk (${assessment.riskScore || 0}/100)`,
                            risk_level: assessment.riskLevel || 'MEDIUM',
                            risk_score: assessment.riskScore || 0,
                            progress: assessment.progress || 0,
                            overdue_tasks: assessment.overdueTasks || 0,
                            blocked_tasks: assessment.blockedTasks || 0,
                            risk_breakdown: assessment.riskBreakdown || { schedule: 0, resource: 0, scope: 0, quality: 0, dependencies: 0 },
                            patterns_detected: (assessment.patterns || []).length,
                            trend: assessment.trend || { direction: 'STABLE', velocity: 0, forecastedRisk: 0, trendFactors: [] },
                            early_warnings: assessment.earlyWarnings || [],
                            insights: assessment.insights || [],
                            recommendations: assessment.recommendations || [],
                            mitigation_strategies: assessment.mitigationStrategies || [],
                            monitoring_recommendations: assessment.monitoringRecommendations || [],
                            requires_attention: (assessment.riskScore || 0) > 70 || (assessment.earlyWarnings || []).length > 0
                        }, null, 2)
                    }
                ]
            };
        } catch (error) {
            console.error(`[RiskAssessment] Handler failed:`, error);
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            project_id: projectId,
                            project_name: projectId,
                            success: false,
                            error: (error as Error).message,
                            summary: `Failed to assess risk for ${projectId}`,
                            insights: ['Risk assessment unavailable'],
                            recommendations: ['Check system connectivity and project ID validity']
                        }, null, 2)
                    }
                ]
            };
        }
    }
};

// EXPANSION: Export processor class for advanced integration
// ENTERPRISE: Add method to register custom risk patterns
// SCALE: Add portfolio-level risk analysis across projects
// PRODUCTION: Add real-time risk monitoring and automated alerting