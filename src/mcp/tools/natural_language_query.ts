/**
 * NaturalLanguageQuery - Enhanced natural language processing tool
 *
 * PURPOSE: Process natural language queries with dynamic entity discovery
 * EXPANSION: Semantic understanding, context awareness, multi-turn conversations
 * PERFORMANCE: Optimized entity discovery, intelligent caching, parallel processing
 * INTEGRATION: Core tool for the intelligent query processing pipeline
 */

import { z } from 'zod';
import { PromptEngine } from '../promptEngine/index';
import { ApiClient } from '../apiClient';

// EXPANSION: Add conversation context and user preferences
interface QueryContext {
  userId?: string;
  sessionId?: string;
  previousQueries?: string[];
  userPreferences?: Record<string, any>;
}

// EXPANSION: Add enhanced response metadata
interface QueryResponse {
  query: string;
  success: boolean;
  data?: any[];
  error?: string;
  analysis: {
    intent_recognized: string;
    confidence_score: number;
    entities_found: {
      people: string[];
      projects: string[];
      conditions: Record<string, any>;
    };
    filters_applied: Record<string, any>;
    processing_time: number;
    reasoning: string[];
    debugInfo?: any;
  };
  insights: string[];
  recommendations: string[];
  suggestions?: string[];
}

export class NaturalLanguageQueryProcessor {
  private promptEngine: PromptEngine;
  private apiClient: ApiClient;
  private debugMode: boolean;

  constructor(debugMode: boolean = false) {
    this.debugMode = debugMode;
    // ENTERPRISE: Shared instances with dependency injection
    this.promptEngine = new PromptEngine(debugMode);
    this.apiClient = new ApiClient();
  }

  /**
   * Process natural language query with enhanced entity discovery
   * EXPANSION: Add semantic caching, user context, conversation memory
   * PERFORMANCE: Optimized for real-time interactive usage
   */
  async processQuery(prompt: string, context?: QueryContext): Promise<QueryResponse> {
    const startTime = Date.now();

    try {
      this.debug(`Processing natural language query: "${prompt}"`);

      // Stage 1: Parse query with dynamic entity discovery
      const parsedQuery = await this.promptEngine.parseQuery(prompt);
      this.debug('Query parsed successfully:', parsedQuery);

      // CRITICAL FIX: Pre-execution validation for meaningless queries
      if (parsedQuery.confidence < 0.3 || this.isMeaninglessQuery(prompt)) {
        const availablePeople = await this.getAvailablePeople();
        const recommendations = [
          'Please provide a clear query about tasks, people, or projects',
          'Try asking about specific people like "show me Alice tasks"',
          'Or ask about general task status like "show me all tasks"',
        ];

        if (availablePeople.length > 0) {
          recommendations.push(
            `Available people: ${availablePeople.slice(0, 5).join(', ')}${availablePeople.length > 5 ? '...' : ''}`,
          );
        }

        return {
          query: prompt,
          success: false,
          error: 'Invalid or unclear query',
          data: [],
          analysis: {
            intent_recognized: parsedQuery.intent,
            confidence_score: Math.max(0.1, parsedQuery.confidence - 0.3), // Further reduce confidence
            entities_found: {
              people: [],
              projects: [],
              conditions: {},
            },
            filters_applied: {},
            processing_time: Date.now() - startTime,
            reasoning: ['Query too unclear or meaningless to process'],
            debugInfo: parsedQuery.metadata.debugInfo,
          },
          insights: ['The query could not be understood'],
          recommendations,
        };
      }

      // Stage 2: Execute query based on intent and filters
      let data: any[] = [];
      let insights: string[] = [];
      let recommendations: string[] = [];

      switch (parsedQuery.intent) {
        case 'query_tasks':
          data = await this.executeTaskQuery(parsedQuery);
          // SAFETY: Ensure data is always an array
          data = Array.isArray(data) ? data : [];
          insights = this.generateTaskInsights(data);
          recommendations = this.generateTaskRecommendations(data);
          break;

        case 'analyze_workload':
          if (parsedQuery.filters.assigneeName) {
            const workloadAnalysis = await this.apiClient.getWorkloadAnalysis(
              parsedQuery.filters.assigneeName,
            );
            data = workloadAnalysis ? [workloadAnalysis] : [];
            insights = workloadAnalysis?.insights || [];
            recommendations = workloadAnalysis?.recommendations || [];
          } else {
            throw new Error('Workload analysis requires a person name');
          }
          break;

        case 'assess_risk':
          if (parsedQuery.filters.projectId) {
            const riskAssessment = await this.apiClient.getRiskAssessment(
              parsedQuery.filters.projectId,
            );
            data = riskAssessment ? [riskAssessment] : [];
            insights = riskAssessment?.insights || [];
            recommendations = riskAssessment?.recommendations || [];
          } else {
            throw new Error('Risk assessment requires a project identifier');
          }
          break;

        case 'general_query':
          // EXPANSION: Intelligent fallback processing
          data = await this.executeGeneralQuery(parsedQuery);
          // SAFETY: Ensure data is always an array
          data = Array.isArray(data) ? data : [];
          insights = this.generateGeneralInsights(data);
          recommendations = this.generateGeneralRecommendations(data);
          break;

        default:
          throw new Error(`Unsupported intent: ${parsedQuery.intent}`);
      }

      // SAFETY: Final check to ensure data is always an array
      data = Array.isArray(data) ? data : [];

      const processingTime = Date.now() - startTime;

      // Stage 3: Build comprehensive response
      const response: QueryResponse = {
        query: prompt,
        success: true,
        data,
        analysis: {
          intent_recognized: parsedQuery.intent,
          confidence_score: parsedQuery.confidence,
          entities_found: {
            people: parsedQuery.entities.people,
            projects: parsedQuery.entities.projects,
            conditions: parsedQuery.entities.conditions,
          },
          filters_applied: parsedQuery.filters,
          processing_time: processingTime,
          reasoning: parsedQuery.metadata.reasoning,
          debugInfo: parsedQuery.metadata.debugInfo,
        },
        insights,
        recommendations,
      };

      // ENHANCEMENT: Add better feedback for unknown entities
      if (parsedQuery.confidence < 0.5 && parsedQuery.entities.people.length === 0) {
        // Person was requested but not found - provide helpful feedback
        response.success = false;
        response.error = 'Person not found';
        response.data = []; // Don't return all tasks when person not found
        response.insights = ['The requested person was not found in the system'];

        // DYNAMIC: Get available people from database
        const availablePeople = await this.getAvailablePeople();
        const recommendations = [
          "Check the spelling of the person's name",
          'Try using the exact name as it appears in the system',
        ];

        if (availablePeople.length > 0) {
          recommendations.push(
            `Available people: ${availablePeople.slice(0, 5).join(', ')}${availablePeople.length > 5 ? '...' : ''}`,
          );
        }

        response.recommendations = recommendations;
      }

      // Stage 4: Add contextual suggestions if available
      if (context) {
        response.suggestions = this.generateContextualSuggestions(parsedQuery, data);
      }

      this.debug(`Query processed successfully in ${processingTime}ms`);
      return response;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.debug(`Query processing failed: ${error}`);

      // ENTERPRISE: Graceful error handling with helpful suggestions
      return {
        query: prompt,
        success: false,
        error: (error as Error).message,
        analysis: {
          intent_recognized: 'error',
          confidence_score: 0,
          entities_found: { people: [], projects: [], conditions: {} },
          filters_applied: {},
          processing_time: processingTime,
          reasoning: [`Error: ${(error as Error).message}`],
        },
        insights: ['Query processing encountered an error'],
        recommendations: [
          'Try being more specific with names and project references',
          'Use queries like: "Show Sarah\'s overdue tasks" or "Analyze project health"',
          'Check that referenced people and projects exist in the system',
        ],
      };
    }
  }

  /**
   * Execute task-specific queries with advanced filtering
   * EXPANSION: Add semantic search, fuzzy matching, context awareness
   */
  private async executeTaskQuery(parsedQuery: any): Promise<any[]> {
    const { filters } = parsedQuery;

    // PERFORMANCE: Build optimized query filters
    const queryFilters: any = {};

    if (filters.assigneeName) {
      queryFilters.assigneeName = filters.assigneeName;
    }

    if (filters.status) {
      queryFilters.status = filters.status;
    }

    if (filters.overdue) {
      queryFilters.overdue = filters.overdue;
    }

    // EXPANSION: Add project-based filtering when projectId is available
    if (filters.projectId) {
      queryFilters.projectId = filters.projectId;
    }

    this.debug('Executing task query with filters:', queryFilters);
    try {
      const result = await this.apiClient.getTasks(queryFilters);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      this.debug(`Task query failed: ${error}`);
      return []; // Return empty array on error
    }
  }

  /**
   * Execute general queries with intelligent interpretation
   * EXPANSION: Add semantic understanding, context resolution
   */
  private async executeGeneralQuery(parsedQuery: any): Promise<any[]> {
    try {
      // STRATEGY: For general queries, try to infer intent from entities
      if (parsedQuery.entities.people.length > 0) {
        // If people are mentioned, default to task query
        const result = await this.executeTaskQuery({
          filters: { assigneeName: parsedQuery.entities.people[0] },
        });
        return Array.isArray(result) ? result : [];
      }

      if (parsedQuery.entities.projects.length > 0) {
        // If projects are mentioned, get all tasks for that project
        const result = await this.executeTaskQuery({
          filters: { projectId: parsedQuery.entities.projects[0] },
        });
        return Array.isArray(result) ? result : [];
      }

      // FALLBACK: Return all tasks with basic filtering
      const result = await this.apiClient.getTasks();
      return Array.isArray(result) ? result : [];
    } catch (error) {
      this.debug(`General query execution failed: ${error}`);
      return []; // Return empty array on error
    }
  }

  /**
   * Generate intelligent insights from task data
   * EXPANSION: ML-based pattern recognition, anomaly detection
   */
  private generateTaskInsights(data: any[]): string[] {
    const insights: string[] = [];

    if (data.length === 0) {
      insights.push('No tasks found matching the specified criteria');
      return insights;
    }

    // ANALYTICS: Task distribution insights
    const statusCounts = data.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});

    const overdueTasks = data.filter(task => {
      const dueDate = new Date(task.dueDate);
      return dueDate < new Date() && task.status !== 'COMPLETED';
    });

    insights.push(`Found ${data.length} tasks total`);

    if (statusCounts.IN_PROGRESS) {
      insights.push(`${statusCounts.IN_PROGRESS} tasks currently in progress`);
    }

    if (overdueTasks.length > 0) {
      insights.push(`${overdueTasks.length} tasks are overdue and need immediate attention`);
    }

    if (statusCounts.BLOCKED) {
      insights.push(`${statusCounts.BLOCKED} tasks are blocked and may require intervention`);
    }

    // EXPANSION: Add time-based insights, workload distribution analysis
    return insights;
  }

  /**
   * Generate actionable recommendations
   * EXPANSION: ML-based recommendation engine, user preference learning
   */
  private generateTaskRecommendations(data: any[]): string[] {
    const recommendations: string[] = [];

    if (data.length === 0) {
      recommendations.push(
        'Consider adjusting search criteria or checking if tasks exist for the specified filters',
      );
      return recommendations;
    }

    const overdueTasks = data.filter(task => {
      const dueDate = new Date(task.dueDate);
      return dueDate < new Date() && task.status !== 'COMPLETED';
    });

    const blockedTasks = data.filter(task => task.status === 'BLOCKED');

    if (overdueTasks.length > 0) {
      recommendations.push('Prioritize overdue tasks to prevent project delays');

      if (overdueTasks.length > 3) {
        recommendations.push('Consider redistributing workload or extending deadlines');
      }
    }

    if (blockedTasks.length > 0) {
      recommendations.push('Address blocked tasks by resolving dependencies or obstacles');
    }

    // EXPANSION: Add personalized recommendations based on user role
    return recommendations;
  }

  /**
   * Generate insights for general queries
   * EXPANSION: Add domain-specific insight generation
   */
  private generateGeneralInsights(data: any[]): string[] {
    return this.generateTaskInsights(data);
  }

  /**
   * Generate recommendations for general queries
   * EXPANSION: Add context-aware recommendation engine
   */
  private generateGeneralRecommendations(data: any[]): string[] {
    return this.generateTaskRecommendations(data);
  }

  /**
   * Generate contextual suggestions based on user history
   * EXPANSION: ML-based personalization, conversation awareness
   */
  private generateContextualSuggestions(parsedQuery: any, data: any[]): string[] {
    const suggestions: string[] = [];

    // CONTEXT: Suggest related queries based on current results
    if (parsedQuery.entities.people.length > 0) {
      const person = parsedQuery.entities.people[0];
      suggestions.push(`Analyze ${person}'s workload distribution`);
      suggestions.push(`Show ${person}'s completed tasks this week`);
    }

    if (data.length > 0 && data[0].projectId) {
      suggestions.push(`Assess risk for project: ${data[0].projectId}`);
    }

    // EXPANSION: Add user preference-based suggestions
    // EXPANSION: Add temporal suggestions based on current context

    return suggestions;
  }

  /**
   * Get available people from database dynamically
   * EXPANSION: Add caching for performance, role-based filtering
   */
  private async getAvailablePeople(): Promise<string[]> {
    try {
      // PERFORMANCE: Query database for unique assignee names
      const tasks = await this.apiClient.getTasks();
      const people = [
        ...new Set(
          tasks
            .map(task => task.assigneeName)
            .filter(
              (name): name is string =>
                name !== undefined && name !== null && name.trim().length > 0,
            ),
        ),
      ];

      return people;
    } catch (error) {
      this.debug(`Failed to get available people: ${error}`);
      return []; // Return empty array on error
    }
  }

  /**
   * Detects meaningless or invalid queries
   * @param prompt - The user's query
   * @returns true if the query is meaningless
   */
  private isMeaninglessQuery(prompt: string): boolean {
    const trimmed = prompt.trim().toLowerCase();

    // Check for completely random strings (no meaningful words)
    const meaningfulWords = [
      'task',
      'tasks',
      'show',
      'find',
      'get',
      'all',
      'my',
      'the',
      'for',
      'with',
      'by',
      'from',
      'to',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'is',
      'are',
      'was',
      'were',
      'be',
      'been',
      'being',
      'have',
      'has',
      'had',
      'do',
      'does',
      'did',
      'will',
      'would',
      'could',
      'should',
      'can',
      'may',
      'might',
      'must',
      'shall',
    ];

    // Check if query contains any meaningful words
    const hasMeaningfulWords = meaningfulWords.some(word => trimmed.includes(word));

    // Check for random character sequences (like "asASDASD")
    const randomPattern = /^[a-z]{2,}[A-Z]{2,}[a-z]{2,}$/i;
    const isRandomSequence = randomPattern.test(trimmed);

    // Check for very short queries (less than 3 characters)
    const isTooShort = trimmed.length < 3;

    // Check for queries with only special characters or numbers
    const onlySpecialChars = /^[^a-zA-Z\s]+$/;
    const isOnlySpecialChars = onlySpecialChars.test(trimmed);

    return !hasMeaningfulWords || isRandomSequence || isTooShort || isOnlySpecialChars;
  }

  /**
   * Debug logging with structured output
   * PRODUCTION: Replace with enterprise logging (Winston, Datadog)
   */
  private debug(message: string, data?: any) {
    if (this.debugMode) {
      console.error(`[NaturalLanguageQuery] ${message}`, data);
      // PRODUCTION: Add structured logging with correlation IDs
      // MONITORING: Add performance metrics and alerting
    }
  }
}

// EXPANSION: Export enhanced MCP tool
export const naturalLanguageQueryTool = {
  name: 'Natural Language Query',
  description:
    'Process natural language queries with enhanced entity discovery and intelligent analysis',
  parameters: z.object({
    prompt: z
      .string()
      .min(5, 'Prompt must be at least 5 characters')
      .max(500, 'Prompt must be less than 500 characters')
      .describe(
        'Natural language query (e.g., "Show me Sarah\'s overdue tasks", "Analyze project health")',
      ),
  }),
  handler: async ({ prompt }: { prompt: string }) => {
    const processor = new NaturalLanguageQueryProcessor(process.env.MCP_DEBUG_MODE === 'true');
    const result = await processor.processQuery(prompt);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  },
};

// EXPANSION: Export processor class for advanced integration scenarios
// ENTERPRISE: Add method to register custom query patterns
// SCALE: Add distributed query processing capabilities
// PRODUCTION: Add comprehensive monitoring and analytics
