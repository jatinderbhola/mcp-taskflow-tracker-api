// Core interfaces for the prompt engine architecture
// EXPANSION: Add more intent types as the system grows
export type IntentType = 'query_tasks' | 'analyze_workload' | 'assess_risk' | 'general_query';

// EXPANSION: Add more entity types for complex queries
export interface ExtractedEntities {
    people: string[];
    projects: string[];
    conditions: Record<string, any>;
}

// EXPANSION: Add more filter types for advanced querying
export interface QueryFilters {
    assignee?: string;
    assigneeName?: string;
    status?: string;
    overdue?: boolean;
    projectId?: string;
    priority?: string;
    // EXPANSION: Add date ranges, team filters, custom conditions
}

// Main result interface - clean and focused
export interface ParsedQuery {
    intent: IntentType;
    entities: ExtractedEntities;
    filters: QueryFilters;
    confidence: number;
    metadata: {
        originalQuery: string;
        processingTime: number;
        debugInfo?: any; // For development insights
        reasoning: string[]; // Track decision-making process
    };
}

// EXPANSION: Add more pattern types for different query styles
export interface IntentPattern {
    patterns: RegExp[];
    weight: number;
    // EXPANSION: Add confidence boosters, required entities
}

// EXPANSION: Add more extraction patterns for complex entities
export interface EntityPattern {
    type: 'person' | 'project' | 'condition';
    patterns: RegExp[];
    weight: number;
} 