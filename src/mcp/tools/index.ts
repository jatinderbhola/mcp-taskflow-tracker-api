/**
 * Tools Index - Simplified MCP tool exports
 * 
 * PURPOSE: Centralized tool registry for enterprise-level tool management
 * EXPANSION: Dynamic tool registration, plugin architecture, tool versioning
 * PERFORMANCE: Lazy loading, intelligent caching, tool orchestration
 * INTEGRATION: Seamless integration with MCP server and client applications
 */

// Import individual tools
import { naturalLanguageQueryTool } from './natural_language_query';
import { workloadAnalysisTool } from './workload_analysis';
import { riskAssessmentTool } from './risk_assessment';

// EXPANSION: Consolidated tool registry for MCP server
export const mcpTools = [
    naturalLanguageQueryTool,
    workloadAnalysisTool,
    riskAssessmentTool
];
