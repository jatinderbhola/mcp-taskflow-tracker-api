#!/usr/bin/env node

/**
 * Comprehensive MCP Server Testing Script
 * Tests all functionality systematically for assessment preparation
 */

const { spawn } = require('child_process');

const testCases = [
    // Natural Language Query Tests
    {
        category: "Natural Language Query - Valid Person",
        tool: "natural_language_query",
        prompt: "show me alice tasks",
        expected: { success: true, hasData: true, confidence: "high" }
    },
    {
        category: "Natural Language Query - Invalid Person",
        tool: "natural_language_query",
        prompt: "show me hello tasks",
        expected: { success: false, hasData: false, confidence: "low" }
    },
    {
        category: "Natural Language Query - Possessive Pattern",
        tool: "natural_language_query",
        prompt: "show me bob's overdue tasks",
        expected: { success: true, hasData: true, confidence: "high" }
    },
    {
        category: "Natural Language Query - Complex Query",
        tool: "natural_language_query",
        prompt: "find all completed tasks for charlie",
        expected: { success: true, hasData: true, confidence: "medium" }
    },
    {
        category: "Natural Language Query - No Person",
        tool: "natural_language_query",
        prompt: "show me all tasks",
        expected: { success: true, hasData: true, confidence: "medium" }
    },
    {
        category: "Natural Language Query - Fuzzy Match",
        tool: "natural_language_query",
        prompt: "show me alice's tasks",
        expected: { success: true, hasData: true, confidence: "high" }
    },

    // Workload Analysis Tests
    {
        category: "Workload Analysis - Valid Person",
        tool: "workload_analysis",
        assignee: "alice",
        expected: { success: true, hasData: true }
    },
    {
        category: "Workload Analysis - Invalid Person",
        tool: "workload_analysis",
        assignee: "nonexistent",
        expected: { success: false, hasData: false }
    },

    // Risk Assessment Tests
    {
        category: "Risk Assessment - Valid Project",
        tool: "risk_assessment",
        projectId: "cmdtg4q6k0000r0lkucg0tnm0",
        expected: { success: true, hasData: true }
    },
    {
        category: "Risk Assessment - Invalid Project",
        tool: "risk_assessment",
        projectId: "invalid-project-id",
        expected: { success: false, hasData: false }
    }
];

async function runTest(testCase) {
    return new Promise((resolve) => {
        let args = [];

        if (testCase.tool === "natural_language_query") {
            args = ["natural_language_query", "prompt", testCase.prompt];
        } else if (testCase.tool === "workload_analysis") {
            args = ["workload_analysis", "assignee", testCase.assignee];
        } else if (testCase.tool === "risk_assessment") {
            args = ["risk_assessment", "projectId", testCase.projectId];
        }

        const request = {
            jsonrpc: "2.0",
            id: 1,
            method: "tools/call",
            params: {
                name: testCase.tool,
                arguments: testCase.tool === "natural_language_query"
                    ? { prompt: testCase.prompt }
                    : testCase.tool === "workload_analysis"
                        ? { assignee: testCase.assignee }
                        : { projectId: testCase.projectId }
            }
        };

        const child = spawn('node', ['dist/mcp/server.js'], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let error = '';

        child.stdout.on('data', (data) => {
            output += data.toString();
        });

        child.stderr.on('data', (data) => {
            error += data.toString();
        });

        child.on('close', (code) => {
            try {
                const response = JSON.parse(output);
                const result = JSON.parse(response.result.content[0].text);

                const testResult = {
                    category: testCase.category,
                    success: result.success === testCase.expected.success,
                    hasData: testCase.expected.hasData ? result.data && result.data.length > 0 : !result.data || result.data.length === 0,
                    confidence: result.analysis?.confidence_score || 0,
                    error: result.error || null,
                    insights: result.insights || [],
                    recommendations: result.recommendations || []
                };

                resolve(testResult);
            } catch (e) {
                resolve({
                    category: testCase.category,
                    success: false,
                    error: `Failed to parse response: ${e.message}`,
                    output: output.substring(0, 200) + "..."
                });
            }
        });

        child.stdin.write(JSON.stringify(request) + '\n');
        child.stdin.end();
    });
}

async function runAllTests() {
    console.log("🧪 Starting Comprehensive MCP Server Testing\n");

    const results = [];

    for (const testCase of testCases) {
        console.log(`Testing: ${testCase.category}`);
        const result = await runTest(testCase);
        results.push(result);

        const status = result.success ? "✅ PASS" : "❌ FAIL";
        console.log(`${status} - ${result.error || 'No error'}`);
        console.log(`   Confidence: ${result.confidence}`);
        console.log(`   Insights: ${result.insights.length}`);
        console.log(`   Recommendations: ${result.recommendations.length}\n`);
    }

    // Generate summary
    const passed = results.filter(r => r.success).length;
    const total = results.length;

    console.log("📊 TEST SUMMARY");
    console.log("================");
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${total - passed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

    return results;
}

// Run tests if this script is executed directly
if (require.main === module) {
    runAllTests().then(results => {
        console.log("🎯 Assessment-Ready Test Results:");
        console.log("=================================");

        results.forEach(result => {
            const status = result.success ? "✅" : "❌";
            console.log(`${status} ${result.category}`);
        });
    }).catch(console.error);
}

module.exports = { runAllTests, testCases }; 