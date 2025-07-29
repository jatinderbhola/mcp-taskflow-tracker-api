import { IntentType, IntentPattern } from './types';

export class IntentClassifier {
    // Pattern-based approach that can scale easily
    // EXPANSION: Move patterns to configuration file for easier management
    private patterns: Record<IntentType, IntentPattern> = {
        query_tasks: {
            patterns: [
                /show.*tasks/i,
                /find.*tasks/i,
                /list.*tasks/i,
                /get.*tasks/i,
                /what.*tasks/i,
                /query.*tasks/i
                // EXPANSION: Add /search.*tasks/i, /display.*tasks/i for broader coverage
            ],
            weight: 0.3
        },
        analyze_workload: {
            patterns: [
                /workload/i,
                /analyze.*capacity/i,
                /how busy/i,
                /work.*load/i,
                /capacity.*analysis/i
                // EXPANSION: Add /team.*load/i, /resource.*utilization/i for team queries
            ],
            weight: 0.4
        },
        assess_risk: {
            patterns: [
                /risk.*assessment/i,
                /assess.*risk/i,
                /project.*health/i,
                /risk.*level/i,
                /health.*check/i,
                /risk.*for/i,
                /what.*risk/i
                // EXPANSION: Add /vulnerability.*analysis/i, /threat.*assessment/i
            ],
            weight: 0.5
        },
        general_query: {
            patterns: [/.*/], // Catch-all for unrecognized patterns
            weight: 0.1
        }
    };

    constructor(private debugMode: boolean = false) { }

    classify(prompt: string): IntentType {
        const startTime = Date.now();

        try {
            // Input validation
            if (!prompt?.trim()) {
                this.debug('Empty prompt received, defaulting to general_query');
                return 'general_query';
            }

            const lowerPrompt = prompt.toLowerCase();
            let bestIntent: IntentType = 'general_query';
            let bestScore = 0;

            // Score each intent based on pattern matches
            for (const [intent, pattern] of Object.entries(this.patterns)) {
                const score = this.calculateIntentScore(lowerPrompt, pattern);

                this.debug(`Intent ${intent} scored: ${score}`);

                if (score > bestScore) {
                    bestScore = score;
                    bestIntent = intent as IntentType;
                }
            }

            const processingTime = Date.now() - startTime;
            this.debug(`Intent classification completed in ${processingTime}ms: ${bestIntent}`);

            return bestIntent;

        } catch (error) {
            this.debug(`Intent classification failed: ${error}`);
            // EXPANSION: Add query suggestion engine for failed classifications
            return 'general_query';
        }
    }

    private calculateIntentScore(prompt: string, pattern: IntentPattern): number {
        let score = 0;

        // Check each pattern for matches
        for (const regex of pattern.patterns) {
            if (regex.test(prompt)) {
                score += pattern.weight;
                // EXPANSION: Add pattern-specific confidence boosters
                // EXPANSION: Add context validation (e.g., person names for workload analysis)
            }
        }

        return score;
    }

    private debug(message: string, data?: any) {
        if (this.debugMode) {
            console.error(`[IntentClassifier] ${message}`, data);
            // PRODUCTION: Replace with structured logging (Winston, etc.)
        }
    }

    // EXPANSION: Add method to register new patterns dynamically
    // EXPANSION: Add method to learn from user corrections
    // EXPANSION: Add method to export/import pattern configurations
} 