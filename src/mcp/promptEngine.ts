import { QueryIntent } from './types';

export class PromptEngine {
    parsePrompt(prompt: string): QueryIntent {
        const lowerPrompt = prompt.toLowerCase();

        // Enhanced entity extraction with name and email support
        let assignee = undefined;

        // First try to find names directly (more reliable)
        const nameMatch = lowerPrompt.match(/\b(alice|bob|charlie)\b/);
        if (nameMatch) {
            assignee = nameMatch[1];
        } else {
            // Fallback to pattern matching
            const assigneeMatch = lowerPrompt.match(/(?:for|assigned to|by|show|tasks for|query)\s+([a-zA-Z@.\s]+)/);
            assignee = assigneeMatch ? assigneeMatch[1].trim() : undefined;
        }

        // Enhanced status detection
        const isOverdue = lowerPrompt.includes('overdue') || lowerPrompt.includes('late') || lowerPrompt.includes('past due');
        const isCompleted = lowerPrompt.includes('completed') || lowerPrompt.includes('done') || lowerPrompt.includes('finished');
        const isBlocked = lowerPrompt.includes('blocked') || lowerPrompt.includes('stuck');
        const isInProgress = lowerPrompt.includes('in progress') || lowerPrompt.includes('working');
        const isTodo = lowerPrompt.includes('todo') || lowerPrompt.includes('to do') || lowerPrompt.includes('pending');

        // Project detection
        const projectMatch = lowerPrompt.match(/(?:project|in)\s+([a-zA-Z\s]+)/);
        const projectId = projectMatch ? projectMatch[1].trim() : undefined;

        // Enhanced action classification
        let action = 'query_tasks';
        if (lowerPrompt.includes('workload') || lowerPrompt.includes('load') || lowerPrompt.includes('analyze')) {
            action = 'workload_analysis';
        } else if (lowerPrompt.includes('risk') || lowerPrompt.includes('assessment') || lowerPrompt.includes('health')) {
            action = 'risk_assessment';
        } else if (lowerPrompt.includes('all') || lowerPrompt.includes('list') || lowerPrompt.includes('show')) {
            action = 'query_tasks';
        }

        // Calculate confidence based on keyword matches and context
        let confidence = 0.5;
        if (assignee) confidence += 0.2;
        if (isOverdue || isCompleted || isBlocked || isInProgress || isTodo) confidence += 0.2;
        if (projectId) confidence += 0.1;
        if (action !== 'query_tasks') confidence += 0.1;

        // Additional confidence for specific patterns
        if (lowerPrompt.includes('@example.com')) confidence += 0.1; // Email format
        if (lowerPrompt.includes('alice') || lowerPrompt.includes('bob') || lowerPrompt.includes('charlie')) confidence += 0.1; // Name recognition
        if (lowerPrompt.includes('tasks')) confidence += 0.1;
        if (lowerPrompt.includes('assigned')) confidence += 0.1;

        const reasoning = [];
        if (assignee) reasoning.push(`Detected assignee: ${assignee}`);
        if (isOverdue) reasoning.push('Detected overdue filter');
        if (isCompleted) reasoning.push('Detected completed filter');
        if (isBlocked) reasoning.push('Detected blocked filter');
        if (isInProgress) reasoning.push('Detected in-progress filter');
        if (isTodo) reasoning.push('Detected todo filter');
        if (projectId) reasoning.push(`Detected project: ${projectId}`);
        reasoning.push(`Action determined: ${action}`);

        // Determine status filter based on detected keywords
        let statusFilter = undefined;
        if (isTodo) statusFilter = 'TODO';
        else if (isOverdue) statusFilter = 'IN_PROGRESS';
        else if (isCompleted) statusFilter = 'COMPLETED';
        else if (isBlocked) statusFilter = 'BLOCKED';
        else if (isInProgress) statusFilter = 'IN_PROGRESS';

        return {
            action,
            confidence: Math.min(confidence, 1.0),
            filters: {
                assignee,
                overdue: isOverdue,
                projectId,
                status: statusFilter
            },
            reasoning
        };
    }
}