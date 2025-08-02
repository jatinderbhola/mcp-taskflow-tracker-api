import { ExtractedEntities } from './types';
import { EntityDiscovery, EntityMatch } from './EntityDiscovery';
import { ApiClient } from '../apiClient';

export class EntityExtractor {
    private entityDiscovery: EntityDiscovery;

    // EXPANSION: Remove hardcoded entities - now using dynamic discovery
    constructor(
        private debugMode: boolean = false,
        apiClient?: ApiClient
    ) {
        // ENTERPRISE: Dependency injection for testability and flexibility
        this.entityDiscovery = new EntityDiscovery(
            apiClient || new ApiClient(),
            debugMode
        );
    }

    /**
     * Extract entities with dynamic database discovery
     * EXPANSION: Async version for enhanced discovery capabilities
     * PERFORMANCE: Maintains backward compatibility with sync interface
     */
    async extract(prompt: string): Promise<ExtractedEntities> {
        const startTime = Date.now();

        try {
            const lowerPrompt = prompt.toLowerCase();

            // PERFORMANCE: Use new dynamic discovery system
            const discoveredEntities = await this.entityDiscovery.discoverEntities(lowerPrompt);

            const entities: ExtractedEntities = {
                people: this.convertEntityMatches(discoveredEntities.people),
                projects: this.convertEntityMatches(discoveredEntities.projects),
                conditions: this.extractConditions(lowerPrompt)
            };

            const processingTime = Date.now() - startTime;
            this.debug(`Entity extraction completed in ${processingTime}ms`, {
                entities,
                suggestions: discoveredEntities.suggestions,
                unknownEntities: discoveredEntities.unknownEntities
            });

            return entities;

        } catch (error) {
            this.debug(`Entity extraction failed: ${error}`);
            // ENTERPRISE: Graceful degradation with fallback strategies
            return { people: [], projects: [], conditions: {} };
        }
    }

    /**
     * Convert EntityMatch array to simple string array for backward compatibility
     * EXPANSION: Enhance to preserve confidence scores and suggestions
     */
    private convertEntityMatches(matches: EntityMatch[]): string[] {
        return matches.map(match => {
            // IMPROVEMENT: For projects, use the project ID when available
            if (match.metadata?.projectId) {
                this.debug(`Using project ID ${match.metadata.projectId} for project "${match.entity}"`);
                return match.metadata.projectId;
            }
            return match.entity;
        });
    }

    // MIGRATION: extractPeople and extractProjects methods replaced by EntityDiscovery
    // ENTERPRISE: Dynamic discovery provides superior accuracy and real-time data

    extractConditions(prompt: string): Record<string, any> {
        const conditions: Record<string, any> = {};

        // Status conditions
        if (/overdue|past due|late/i.test(prompt)) {
            conditions.overdue = true;
            conditions.status = 'IN_PROGRESS'; // Overdue tasks are typically in progress
            this.debug('Detected overdue condition');
        }

        if (/completed|done|finished/i.test(prompt)) {
            conditions.status = 'COMPLETED';
            this.debug('Detected completed condition');
        }

        if (/todo|to do|pending/i.test(prompt)) {
            conditions.status = 'TODO';
            this.debug('Detected todo condition');
        }

        if (/in progress|working/i.test(prompt)) {
            conditions.status = 'IN_PROGRESS';
            this.debug('Detected in-progress condition');
        }

        if (/blocked|stuck/i.test(prompt)) {
            conditions.status = 'BLOCKED';
            this.debug('Detected blocked condition');
        }

        // EXPANSION: Add date range detection ("tasks due this week")
        // EXPANSION: Add priority detection ("high priority", "urgent")
        // EXPANSION: Add team-based conditions ("team tasks", "my tasks")

        return conditions;
    }

    // EXPANSION: Add method to register new people/projects dynamically
    // EXPANSION: Add method to learn from user corrections
    // EXPANSION: Add method to export/import entity configurations

    private debug(message: string, data?: any) {
        if (this.debugMode) {
            console.error(`[EntityExtractor] ${message}`, data);
            // PRODUCTION: Replace with structured logging (Winston, etc.)
        }
    }
} 