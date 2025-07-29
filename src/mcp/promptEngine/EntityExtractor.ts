import { ExtractedEntities } from './types';

export class EntityExtractor {
    // Known people in the system - EXPANSION: Load from database/dynamic configuration
    private knownPeople = ['alice', 'bob', 'charlie'];

    // Known projects - EXPANSION: Load from database/dynamic configuration
    private knownProjects = ['website redesign', 'mobile app', 'database migration'];

    constructor(private debugMode: boolean = false) { }

    extract(prompt: string): ExtractedEntities {
        const startTime = Date.now();

        try {
            const lowerPrompt = prompt.toLowerCase();

            const entities: ExtractedEntities = {
                people: this.extractPeople(lowerPrompt),
                projects: this.extractProjects(lowerPrompt),
                conditions: this.extractConditions(lowerPrompt)
            };

            const processingTime = Date.now() - startTime;
            this.debug(`Entity extraction completed in ${processingTime}ms`, entities);

            return entities;

        } catch (error) {
            this.debug(`Entity extraction failed: ${error}`);
            // EXPANSION: Add fallback extraction strategies
            return { people: [], projects: [], conditions: {} };
        }
    }

    extractPeople(prompt: string): string[] {
        const people: string[] = [];

        // Pattern 1: Direct name matching (most reliable)
        for (const person of this.knownPeople) {
            if (prompt.includes(person)) {
                people.push(person);
                this.debug(`Found person via direct match: ${person}`);
            }
        }

        // Pattern 2: Possessive form ("Bob's tasks")
        const possessiveMatch = prompt.match(/([a-z]+)'s\s+(tasks|workload|projects)/i);
        if (possessiveMatch && this.knownPeople.includes(possessiveMatch[1].toLowerCase())) {
            const person = possessiveMatch[1].toLowerCase();
            if (!people.includes(person)) {
                people.push(person);
                this.debug(`Found person via possessive: ${person}`);
            }
        }

        // Pattern 3: "assigned to" format
        const assignedMatch = prompt.match(/assigned\s+to\s+([a-z]+)/i);
        if (assignedMatch && this.knownPeople.includes(assignedMatch[1].toLowerCase())) {
            const person = assignedMatch[1].toLowerCase();
            if (!people.includes(person)) {
                people.push(person);
                this.debug(`Found person via assigned to: ${person}`);
            }
        }

        // EXPANSION: Add fuzzy matching for misspelled names
        // EXPANSION: Add email format detection (alice@example.com)
        // EXPANSION: Add team-based queries ("marketing team", "dev team")

        return people;
    }

    extractProjects(prompt: string): string[] {
        const projects: string[] = [];

        // Pattern 1: Direct project name matching
        for (const project of this.knownProjects) {
            if (prompt.includes(project)) {
                projects.push(project);
                this.debug(`Found project via direct match: ${project}`);
            }
        }

        // Pattern 2: "project" keyword followed by name
        const projectMatch = prompt.match(/project\s+([a-z\s]+)/i);
        if (projectMatch) {
            const projectName = projectMatch[1].trim();
            if (!projects.includes(projectName)) {
                projects.push(projectName);
                this.debug(`Found project via project keyword: ${projectName}`);
            }
        }

        // EXPANSION: Add project ID detection (project-123)
        // EXPANSION: Add project alias matching
        // EXPANSION: Add fuzzy matching for project names

        return projects;
    }

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
            console.log(`[EntityExtractor] ${message}`, data);
            // PRODUCTION: Replace with structured logging (Winston, etc.)
        }
    }
} 