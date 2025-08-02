/**
 * Tools Index - Modular MCP tool exports
 * 
 * PURPOSE: Centralized tool registry for enterprise-level tool management
 * EXPANSION: Dynamic tool registration, plugin architecture, tool versioning
 * PERFORMANCE: Lazy loading, intelligent caching, tool orchestration
 * INTEGRATION: Seamless integration with MCP server and client applications
 */

// EXPANSION: Export individual tool processors for advanced usage
export { NaturalLanguageQueryProcessor, naturalLanguageQueryTool } from './natural_language_query';
export { WorkloadAnalysisProcessor, workloadAnalysisTool } from './workload_analysis';
export { RiskAssessmentProcessor, riskAssessmentTool } from './risk_assessment';

// Import tools for registry
import { naturalLanguageQueryTool } from './natural_language_query';
import { workloadAnalysisTool } from './workload_analysis';
import { riskAssessmentTool } from './risk_assessment';

// EXPANSION: Consolidated tool registry for MCP server
export const mcpTools = [
    naturalLanguageQueryTool,
    workloadAnalysisTool,
    riskAssessmentTool
];

// EXPANSION: Tool metadata for dynamic discovery
export const toolMetadata = {
    naturalLanguageQueryTool: {
        category: 'query',
        complexity: 'standard',
        capabilities: ['entity-discovery', 'intent-classification', 'dynamic-filtering']
    },
    workloadAnalysisTool: {
        category: 'analytics',
        complexity: 'advanced',
        capabilities: ['predictive-modeling', 'trend-analysis', 'proactive-insights']
    },
    riskAssessmentTool: {
        category: 'analytics',
        complexity: 'advanced',
        capabilities: ['pattern-detection', 'early-warning', 'mitigation-planning']
    }
};

// EXPANSION: Tool orchestration utilities
export const toolUtils = {
    /**
     * Get all tools by category
     * EXPANSION: Add dynamic filtering, capability matching
     */
    getToolsByCategory: (category: string) => {
        return mcpTools.filter(tool =>
            toolMetadata[tool.name as keyof typeof toolMetadata]?.category === category
        );
    },

    /**
     * Get tools by capability
     * EXPANSION: Add fuzzy matching, requirement scoring
     */
    getToolsByCapability: (capability: string) => {
        return mcpTools.filter(tool =>
            toolMetadata[tool.name as keyof typeof toolMetadata]?.capabilities.includes(capability)
        );
    },

    /**
     * Get tool complexity level
     * EXPANSION: Add performance metrics, resource requirements
     */
    getToolComplexity: (toolName: string) => {
        return toolMetadata[toolName as keyof typeof toolMetadata]?.complexity || 'unknown';
    }
};

// EXPANSION: Export type definitions for tool development
export interface ToolRegistration {
    name: string;
    description: string;
    parameters: any;
    handler: (params: any) => Promise<any>;
    metadata?: {
        category: string;
        complexity: string;
        capabilities: string[];
    };
}

// EXPANSION: Tool registry management
export class ToolRegistry {
    private static tools = new Map<string, ToolRegistration>();

    /**
     * Register a new tool dynamically
     * EXPANSION: Add validation, versioning, conflict resolution
     */
    static registerTool(tool: ToolRegistration): void {
        this.tools.set(tool.name, tool);
    }

    /**
     * Get registered tool by name
     * EXPANSION: Add caching, lazy loading, dependency resolution
     */
    static getTool(name: string): ToolRegistration | undefined {
        return this.tools.get(name);
    }

    /**
     * Get all registered tools
     * EXPANSION: Add filtering, sorting, capability matching
     */
    static getAllTools(): ToolRegistration[] {
        return Array.from(this.tools.values());
    }

    /**
     * Remove tool from registry
     * EXPANSION: Add dependency checking, graceful degradation
     */
    static unregisterTool(name: string): boolean {
        return this.tools.delete(name);
    }
}

// ENTERPRISE: Initialize tool registry with default tools
mcpTools.forEach(tool => {
    ToolRegistry.registerTool({
        ...tool,
        metadata: toolMetadata[tool.name as keyof typeof toolMetadata]
    });
});

// EXPANSION: Export helper functions for tool development
// ENTERPRISE: Add tool validation, testing utilities, performance monitoring
// SCALE: Add distributed tool execution, load balancing
// PRODUCTION: Add comprehensive logging, metrics, health monitoring