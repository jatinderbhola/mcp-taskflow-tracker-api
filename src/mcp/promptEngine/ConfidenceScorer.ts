import { IntentType, ExtractedEntities, QueryFilters } from './types';

export class ConfidenceScorer {
  constructor(private debugMode: boolean = false) {}

  calculateConfidence(
    intent: IntentType,
    entities: ExtractedEntities,
    filters: QueryFilters,
    originalQuery?: string,
  ): number {
    const startTime = Date.now();

    try {
      let confidence = 0.4; // Base confidence
      const reasoning: string[] = [];

      // Intent bonus - specific intents get higher confidence
      if (intent !== 'general_query') {
        confidence += 0.2;
        reasoning.push(`Intent recognized: ${intent}`);
      }

      // Entity extraction bonus
      if (entities.people.length > 0) {
        confidence += 0.15;
        reasoning.push(`Found ${entities.people.length} person(s): ${entities.people.join(', ')}`);
      }

      if (entities.projects.length > 0) {
        confidence += 0.1;
        reasoning.push(
          `Found ${entities.projects.length} project(s): ${entities.projects.join(', ')}`,
        );
      }

      // CRITICAL: Penalty for missing expected entities
      if (
        (intent === 'query_tasks' || intent === 'general_query') &&
        entities.people.length === 0 &&
        this.hasPersonReference(filters, originalQuery)
      ) {
        confidence -= 0.3; // Significant penalty for missing person
        reasoning.push('Person requested but not found - confidence reduced');
      }

      if (intent === 'analyze_workload' && entities.people.length === 0) {
        confidence -= 0.4; // Major penalty for workload analysis without person
        reasoning.push('Workload analysis requires a person - confidence reduced');
      }

      if (intent === 'assess_risk' && entities.projects.length === 0) {
        confidence -= 0.4; // Major penalty for risk assessment without project
        reasoning.push('Risk assessment requires a project - confidence reduced');
      }

      // Filter complexity bonus
      const filterCount = Object.keys(filters).length;
      if (filterCount > 0) {
        confidence += Math.min(filterCount * 0.05, 0.15); // Cap at 0.15
        reasoning.push(`Applied ${filterCount} filter(s)`);
      }

      // Context validation bonus
      if (this.validateContext(intent, entities)) {
        confidence += 0.1;
        reasoning.push('Context validation passed');
      }

      // Query complexity bonus
      const complexity = this.assessQueryComplexity(entities, filters);
      if (complexity > 0.5) {
        confidence += 0.05;
        reasoning.push('Complex query detected');
      }

      const processingTime = Date.now() - startTime;
      this.debug(`Confidence calculation completed in ${processingTime}ms: ${confidence}`, {
        reasoning,
      });

      // EXPANSION: Add session history for improved confidence over time
      // EXPANSION: Add user preference learning
      // EXPANSION: Add query success rate tracking

      return Math.max(0.1, Math.min(confidence, 1.0)); // Ensure minimum confidence of 0.1
    } catch (error) {
      this.debug(`Confidence calculation failed: ${error}`);
      return 0.5; // Fallback confidence
    }
  }

  private validateContext(intent: IntentType, entities: ExtractedEntities): boolean {
    // Validate that the intent makes sense with the extracted entities
    switch (intent) {
      case 'analyze_workload':
        // Workload analysis should have a person
        return entities.people.length > 0;

      case 'assess_risk':
        // Risk assessment should have a project
        return entities.projects.length > 0;

      case 'query_tasks':
        // Task queries can have any combination
        return true;

      default:
        return true;
    }
  }

  private hasPersonReference(filters: QueryFilters, originalQuery?: string): boolean {
    // Check if filters suggest a person was requested but not found
    if (
      filters.assigneeName !== undefined ||
      filters.assignee !== undefined ||
      Object.keys(filters).some(key => key.toLowerCase().includes('assignee'))
    ) {
      return true;
    }

    // Check if original query contains person-like patterns
    if (originalQuery) {
      const lowerQuery = originalQuery.toLowerCase();
      // Check for possessive patterns ("John's tasks")
      if (/\b[a-z]+'s\s+(tasks|workload|projects|work)/i.test(lowerQuery)) {
        return true;
      }
      // Check for "assigned to" patterns
      if (/assigned\s+to\s+[a-z]+/i.test(lowerQuery)) {
        return true;
      }
      // Check for capitalized words that might be names
      if (/\b[A-Z][a-z]+\b/.test(originalQuery)) {
        return true;
      }
      // Check for simple name + tasks pattern ("johns tasks", "alice tasks")
      if (/\b[a-z]+\s+(tasks|workload|projects|work)/i.test(lowerQuery)) {
        return true;
      }
    }

    return false;
  }

  private assessQueryComplexity(entities: ExtractedEntities, filters: QueryFilters): number {
    let complexity = 0;

    // Multiple entities increase complexity
    complexity += entities.people.length * 0.2;
    complexity += entities.projects.length * 0.2;

    // Multiple filters increase complexity
    complexity += Object.keys(filters).length * 0.1;

    // EXPANSION: Add more complexity factors
    // EXPANSION: Add query length analysis
    // EXPANSION: Add natural language complexity scoring

    return Math.min(complexity, 1.0);
  }

  // EXPANSION: Add method to learn from user feedback
  // EXPANSION: Add method to adjust confidence based on historical accuracy
  // EXPANSION: Add method to export confidence metrics

  private debug(message: string, data?: any) {
    if (this.debugMode) {
      console.error(`[ConfidenceScorer] ${message}`, data);
      // PRODUCTION: Replace with structured logging (Winston, etc.)
    }
  }
}
