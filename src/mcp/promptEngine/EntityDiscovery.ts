/**
 * EntityDiscovery - Dynamic entity discovery from database
 *
 * PURPOSE: Replace hardcoded entities with real-time database discovery
 * EXPANSION: ML-based entity recognition, semantic understanding, context awareness
 * PERFORMANCE: Intelligent caching with TTL, fuzzy matching optimization
 * INTEGRATION: RESTful API integration, Redis caching, enterprise directory services
 */

import { ApiClient } from '../apiClient';
import { CacheService } from '../../services/cacheService';
import { Project } from '../../models/types';

// EXPANSION: Add ML confidence scoring for entity recognition
export interface EntityMatch {
  entity: string;
  confidence: number;
  type: 'exact' | 'fuzzy' | 'pattern';
  suggestion?: string;
  metadata?: Record<string, any>;
}

// EXPANSION: Add team, department, role-based entity discovery
export interface DiscoveredEntities {
  people: EntityMatch[];
  projects: EntityMatch[];
  unknownEntities: string[];
  suggestions: string[];
}

// EXPANSION: Add machine learning entity patterns
export interface EntityPattern {
  pattern: RegExp;
  type: 'person' | 'project';
  confidence: number;
  context?: string[];
}

export class EntityDiscovery {
  private apiClient: ApiClient;
  private debugMode: boolean;

  // CACHE: Entity cache TTL - 5 minutes for dynamic environments
  private readonly ENTITY_CACHE_TTL = 300;

  // PERFORMANCE: Fuzzy matching threshold (0-1, higher = stricter)
  private readonly FUZZY_THRESHOLD = 0.6;

  constructor(apiClient: ApiClient, debugMode: boolean = false) {
    this.apiClient = apiClient;
    this.debugMode = debugMode;
  }

  /**
   * Discover entities from natural language prompt
   * EXPANSION: Add semantic understanding with transformers/BERT
   * PERFORMANCE: Parallel entity discovery for multiple types
   */
  async discoverEntities(prompt: string): Promise<DiscoveredEntities> {
    const startTime = Date.now();

    try {
      const lowerPrompt = prompt.toLowerCase();

      // ASYNC: Parallel discovery for optimal performance
      const [peopleMatches, projectMatches] = await Promise.all([
        this.discoverPeople(lowerPrompt),
        this.discoverProjects(lowerPrompt),
      ]);

      const unknownEntities = this.extractUnknownEntities(
        lowerPrompt,
        peopleMatches,
        projectMatches,
      );
      const suggestions = await this.generateSuggestions(
        unknownEntities,
        peopleMatches,
        projectMatches,
      );

      const result: DiscoveredEntities = {
        people: peopleMatches,
        projects: projectMatches,
        unknownEntities,
        suggestions,
      };

      const processingTime = Date.now() - startTime;
      this.debug(`Entity discovery completed in ${processingTime}ms`, result);

      return result;
    } catch (error) {
      this.debug(`Entity discovery failed: ${error}`);
      // ENTERPRISE: Graceful degradation with fallback strategies
      return {
        people: [],
        projects: [],
        unknownEntities: [],
        suggestions: [
          'Unable to process query. Please try rephrasing or check network connectivity.',
        ],
      };
    }
  }

  /**
   * Discover people entities from database
   * EXPANSION: Active Directory integration, role-based discovery
   * CACHE: Intelligent caching with invalidation on user changes
   */
  async discoverPeople(prompt: string): Promise<EntityMatch[]> {
    try {
      // CACHE: Check for cached people list
      const cacheKey = 'entities:people:all';
      let allPeople = await CacheService.get<string[]>(cacheKey);

      if (!allPeople) {
        // PERFORMANCE: Query database for unique assignee names
        const tasks = await this.apiClient.getTasks();
        allPeople = [
          ...new Set(
            tasks
              .map(task => task.assigneeName)
              .filter(
                (name): name is string =>
                  name !== undefined && name !== null && name.trim().length > 0,
              ),
          ),
        ];

        // CACHE: Store for future queries
        await CacheService.set(cacheKey, allPeople, this.ENTITY_CACHE_TTL);
        this.debug(`Cached ${allPeople.length} people from database`);
      }

      // SAFETY: Ensure allPeople is never null after this point
      if (!allPeople) {
        allPeople = [];
      }

      const matches: EntityMatch[] = [];

      // Pattern 1: Direct exact matching (highest confidence)
      for (const person of allPeople) {
        if (this.containsName(prompt, person)) {
          matches.push({
            entity: person,
            confidence: 1.0,
            type: 'exact',
            metadata: { source: 'database', pattern: 'direct_match' },
          });
        }
      }

      // Pattern 2: Possessive pattern matching ("Sarah's tasks")
      const possessivePattern = /([a-z]+)'s\s+(tasks|workload|projects|work)/i;
      const possessiveMatch = prompt.match(possessivePattern);
      if (possessiveMatch) {
        const nameCandidate = possessiveMatch[1];
        const fuzzyMatch = this.findFuzzyMatch(nameCandidate, allPeople);
        if (fuzzyMatch && !matches.find(m => m.entity === fuzzyMatch.entity)) {
          matches.push({
            ...fuzzyMatch,
            metadata: {
              source: 'database',
              pattern: 'possessive',
              originalText: possessiveMatch[0],
            },
          });
        }
      }

      // Pattern 3: "assigned to" pattern
      const assignedPattern = /assigned\s+to\s+([a-z]+)/i;
      const assignedMatch = prompt.match(assignedPattern);
      if (assignedMatch) {
        const nameCandidate = assignedMatch[1];
        const fuzzyMatch = this.findFuzzyMatch(nameCandidate, allPeople);
        if (fuzzyMatch && !matches.find(m => m.entity === fuzzyMatch.entity)) {
          matches.push({
            ...fuzzyMatch,
            metadata: {
              source: 'database',
              pattern: 'assigned_to',
              originalText: assignedMatch[0],
            },
          });
        }
      }

      // EXPANSION: Add email pattern matching (user@company.com)
      // EXPANSION: Add team-based discovery ("marketing team members")
      // EXPANSION: Add role-based discovery ("all developers")

      return matches;
    } catch (error) {
      this.debug(`People discovery failed: ${error}`);
      return [];
    }
  }

  /**
   * Discover project entities from database
   * EXPANSION: Project hierarchy support, alias matching
   * PERFORMANCE: Cached project lookup with fuzzy search
   */
  async discoverProjects(prompt: string): Promise<EntityMatch[]> {
    try {
      // CACHE: Check for cached projects list
      const cacheKey = 'entities:projects:all';
      let allProjects = await CacheService.get<Project[]>(cacheKey);

      if (!allProjects) {
        // PERFORMANCE: Query database for all projects
        allProjects = await this.apiClient.getProjects();

        // CACHE: Store for future queries
        await CacheService.set(cacheKey, allProjects, this.ENTITY_CACHE_TTL);
        this.debug(`Cached ${allProjects.length} projects from database`);
      }

      const projectNames = allProjects.map(p => p.name);
      const matches: EntityMatch[] = [];

      // Pattern 1: Direct project name matching
      for (const project of allProjects) {
        if (this.containsName(prompt, project.name)) {
          matches.push({
            entity: project.name,
            confidence: 1.0,
            type: 'exact',
            metadata: {
              source: 'database',
              pattern: 'direct_match',
              projectId: project.id,
              status: project.status,
            },
          });
        }
      }

      // Pattern 2: "project" keyword followed by name
      const projectPattern = /project\s+([a-z\s]+)/i;
      const projectMatch = prompt.match(projectPattern);
      if (projectMatch) {
        const nameCandidate = projectMatch[1].trim();
        const fuzzyMatch = this.findFuzzyMatch(nameCandidate, projectNames);
        if (fuzzyMatch && !matches.find(m => m.entity === fuzzyMatch.entity)) {
          const project = allProjects.find(p => p.name === fuzzyMatch.entity);
          matches.push({
            ...fuzzyMatch,
            metadata: {
              source: 'database',
              pattern: 'project_keyword',
              originalText: projectMatch[0],
              projectId: project?.id,
              status: project?.status,
            },
          });
        }
      }

      // EXPANSION: Add project ID pattern matching (PROJ-123)
      // EXPANSION: Add project alias/abbreviation support
      // EXPANSION: Add project status-based discovery ("active projects")

      return matches;
    } catch (error) {
      this.debug(`Project discovery failed: ${error}`);
      return [];
    }
  }

  /**
   * Fuzzy matching using Levenshtein distance
   * EXPANSION: Use advanced algorithms like Jaro-Winkler, soundex
   * PERFORMANCE: Optimize for large entity sets with indexing
   */
  private findFuzzyMatch(candidate: string, entities: string[]): EntityMatch | null {
    let bestMatch: EntityMatch | null = null;
    let bestScore = 0;

    for (const entity of entities) {
      const score = this.calculateSimilarity(candidate.toLowerCase(), entity.toLowerCase());

      if (score >= this.FUZZY_THRESHOLD && score > bestScore) {
        bestScore = score;
        bestMatch = {
          entity,
          confidence: score,
          type: 'fuzzy',
          suggestion: score < 0.9 ? `Did you mean "${entity}"?` : undefined,
        };
      }
    }

    return bestMatch;
  }

  /**
   * Calculate string similarity using Levenshtein distance
   * EXPANSION: Replace with ML-based semantic similarity
   *
   * ALERT: This is a simple implementation of Levenshtein distance. It is not a good measure of similarity. Used from existing examples from MCP SDK.
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator, // substitution
        );
      }
    }

    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : (maxLength - matrix[str2.length][str1.length]) / maxLength;
  }

  /**
   * Check if prompt contains a name with various patterns
   * EXPANSION: Add context-aware name recognition
   */
  private containsName(prompt: string, name: string): boolean {
    const lowerName = name.toLowerCase();
    const lowerPrompt = prompt.toLowerCase();

    // Direct inclusion
    if (lowerPrompt.includes(lowerName)) return true;

    // Word boundary matching for partial names
    const words = lowerName.split(' ');
    for (const word of words) {
      if (word.length >= 3) {
        // Avoid matching very short words
        const wordPattern = new RegExp(`\\b${word}\\b`, 'i');
        if (wordPattern.test(prompt)) return true;
      }
    }

    return false;
  }

  /**
   * Extract potential entity names that weren't recognized
   * EXPANSION: Use NER models (spaCy, BERT) for better extraction
   */
  private extractUnknownEntities(
    prompt: string,
    peopleMatches: EntityMatch[],
    projectMatches: EntityMatch[],
  ): string[] {
    const knownEntities = [
      ...peopleMatches.map(m => m.entity.toLowerCase()),
      ...projectMatches.map(m => m.entity.toLowerCase()),
    ];

    // EXPANSION: Implement NLP-based entity extraction
    // For now, extract capitalized words that might be names
    let capitalizedWords: string[] = prompt.match(/\b[A-Z][a-z]+\b/g) || [];

    // Also extract from possessive patterns ("John's tasks")
    const possessivePattern = /([a-z]+)'s\s+(tasks|workload|projects|work)/i;
    const possessiveMatch = prompt.match(possessivePattern);
    if (possessiveMatch) {
      capitalizedWords = [...capitalizedWords, possessiveMatch[1]];
    }

    return capitalizedWords
      .filter(word => !knownEntities.includes(word.toLowerCase()))
      .filter(word => word.length > 2) // Filter out short words
      .slice(0, 3); // Limit to prevent noise
  }

  /**
   * Generate helpful suggestions for unrecognized entities
   * EXPANSION: ML-powered suggestion engine with user learning
   */
  private async generateSuggestions(
    unknownEntities: string[],
    peopleMatches: EntityMatch[],
    projectMatches: EntityMatch[],
  ): Promise<string[]> {
    const suggestions: string[] = [];

    if (unknownEntities.length > 0) {
      suggestions.push(
        `I don't recognize: ${unknownEntities.join(', ')}. Please check the spelling.`,
      );

      // Provide available people if a person was requested but not found
      if (unknownEntities.some(entity => /^[A-Z][a-z]+$/.test(entity))) {
        try {
          // Get available people for suggestions
          const cacheKey = 'entities:people:all';
          const allPeople = await CacheService.get<string[]>(cacheKey);
          if (allPeople && allPeople.length > 0) {
            suggestions.push(
              `Available people: ${allPeople.slice(0, 5).join(', ')}${allPeople.length > 5 ? '...' : ''}`,
            );
          }
        } catch (error) {
          // Ignore cache errors for suggestions
        }
      }
    }

    // Add fuzzy match suggestions
    const fuzzyMatches = [...peopleMatches, ...projectMatches].filter(m => m.suggestion);
    for (const match of fuzzyMatches) {
      if (match.suggestion) {
        suggestions.push(match.suggestion);
      }
    }

    // EXPANSION: Add contextual suggestions based on user history
    // EXPANSION: Add "similar names" suggestions from database

    return suggestions;
  }

  /**
   * Debug logging with structured output
   * PRODUCTION: Replace with enterprise logging (Winston, Datadog)
   */
  private debug(message: string, data?: any) {
    if (this.debugMode) {
      console.error(`[EntityDiscovery] ${message}`, data);
      // PRODUCTION: Add structured logging with correlation IDs
      // MONITORING: Add performance metrics and alerting
    }
  }

  // EXPANSION: Add method to refresh entity cache on demand
  // ENTERPRISE: Add method to integrate with Active Directory
  // SCALE: Add method to handle distributed entity resolution
  // PRODUCTION: Add health check endpoint for entity discovery status
}
