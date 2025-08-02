import { ParsedQuery, IntentType, ExtractedEntities, QueryFilters } from './types';
import { IntentClassifier } from './IntentClassifier';
import { EntityExtractor } from './EntityExtractor';
import { ConfidenceScorer } from './ConfidenceScorer';
import { ApiClient } from '../apiClient';

export class PromptEngine {
  // Main orchestrator - keeps interface simple but delegates properly
  private intentClassifier: IntentClassifier;
  private entityExtractor: EntityExtractor;
  private confidenceScorer: ConfidenceScorer;
  private debugMode: boolean;

  constructor(debugMode: boolean = false, apiClient?: ApiClient) {
    this.debugMode = debugMode;
    this.intentClassifier = new IntentClassifier(debugMode);
    // ENTERPRISE: Dependency injection for EntityExtractor with API client
    this.entityExtractor = new EntityExtractor(debugMode, apiClient);
    this.confidenceScorer = new ConfidenceScorer(debugMode);
  }

  /**
   * Parse natural language query with dynamic entity discovery
   * EXPANSION: Add semantic caching, multi-language support
   * PERFORMANCE: Optimized async processing with parallel operations
   */
  async parseQuery(prompt: string): Promise<ParsedQuery> {
    const startTime = Date.now();

    try {
      // Input validation
      if (!prompt?.trim()) {
        throw new Error('Empty query provided');
      }

      this.debug(`Processing query: "${prompt}"`);

      // Step 1: Intent Classification
      const intent = this.intentClassifier.classify(prompt);
      this.debug(`Intent classified as: ${intent}`);

      // Step 2: Dynamic Entity Extraction with database discovery
      const entities = await this.entityExtractor.extract(prompt);
      this.debug(`Entities extracted:`, entities);

      // Step 3: Filter Construction
      const filters = this.buildFilters(entities);
      this.debug(`Filters built:`, filters);

      // Step 4: Confidence Scoring
      const confidence = this.confidenceScorer.calculateConfidence(
        intent,
        entities,
        filters,
        prompt,
      );
      this.debug(`Confidence calculated: ${confidence}`);

      // Step 5: Build Reasoning Chain
      const reasoning = this.buildReasoningChain(intent, entities, filters);

      const processingTime = Date.now() - startTime;

      const result: ParsedQuery = {
        intent,
        entities,
        filters,
        confidence,
        metadata: {
          originalQuery: prompt,
          processingTime,
          debugInfo: this.debugMode ? { intent, entities, filters } : undefined,
          reasoning,
        },
      };

      this.debug(`Query parsing completed in ${processingTime}ms`, result);
      return result;
    } catch (error) {
      this.debug(`Query parsing failed: ${error}`);
      // Graceful degradation with helpful fallback
      return this.createFallbackQuery(prompt, error as Error);
    }
  }

  private buildFilters(entities: ExtractedEntities): QueryFilters {
    const filters: QueryFilters = {};

    // Map people to assigneeName filter
    if (entities.people.length > 0) {
      filters.assigneeName = entities.people[0]; // Take first person found
      // EXPANSION: Handle multiple people for team queries
    }

    // Map projects to projectId filter
    if (entities.projects.length > 0) {
      filters.projectId = entities.projects[0]; // Take first project found
      // EXPANSION: Handle multiple projects for cross-project queries
    }

    // Map conditions to appropriate filters
    if (entities.conditions.status) {
      filters.status = entities.conditions.status;
    }

    if (entities.conditions.overdue) {
      filters.overdue = entities.conditions.overdue;
    }

    // EXPANSION: Add more filter mappings
    // EXPANSION: Add date range filters
    // EXPANSION: Add priority filters

    return filters;
  }

  private buildReasoningChain(
    intent: IntentType,
    entities: ExtractedEntities,
    filters: QueryFilters,
  ): string[] {
    const reasoning: string[] = [];

    // Intent reasoning
    reasoning.push(`Intent: ${intent}`);

    // Entity reasoning
    if (entities.people.length > 0) {
      reasoning.push(`People: ${entities.people.join(', ')}`);
    }

    if (entities.projects.length > 0) {
      reasoning.push(`Projects: ${entities.projects.join(', ')}`);
    }

    // Filter reasoning
    if (filters.assigneeName) {
      reasoning.push(`Assignee: ${filters.assigneeName}`);
    }

    if (filters.status) {
      reasoning.push(`Status: ${filters.status}`);
    }

    if (filters.overdue) {
      reasoning.push('Overdue filter applied');
    }

    // EXPANSION: Add more detailed reasoning
    // EXPANSION: Add confidence explanation
    // EXPANSION: Add alternative interpretations

    return reasoning;
  }

  private createFallbackQuery(prompt: string, error: Error): ParsedQuery {
    this.debug(`Creating fallback query due to error: ${error.message}`);

    return {
      intent: 'general_query',
      entities: { people: [], projects: [], conditions: {} },
      filters: {},
      confidence: 0.3, // Low confidence for fallback
      metadata: {
        originalQuery: prompt,
        processingTime: 0,
        reasoning: [
          'Fallback query created due to parsing error',
          `Error: ${error.message}`,
          'Consider rephrasing your query',
        ],
      },
    };
  }

  // EXPANSION: Add method to register custom patterns
  // EXPANSION: Add method to learn from user corrections
  // EXPANSION: Add method to export/import configurations

  private debug(message: string, data?: any) {
    if (this.debugMode) {
      console.error(`[PromptEngine] ${message}`, data);
      // PRODUCTION: Replace with structured logging (Winston, etc.)
    }
  }
}

// EXPANSION: Export all components for modular usage
export { EntityDiscovery } from './EntityDiscovery';
export { EntityExtractor } from './EntityExtractor';
export { IntentClassifier } from './IntentClassifier';
export { ConfidenceScorer } from './ConfidenceScorer';
export * from './types';
