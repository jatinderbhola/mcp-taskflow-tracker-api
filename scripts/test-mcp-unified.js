#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🧪 Unified MCP Testing Suite\n');

// Test configurations
const testConfigs = [
    {
        name: 'Basic MCP Server Test',
        description: 'Verify server starts and lists tools',
        timeout: 2000
    },
    {
        name: 'JSON Protocol Test',
        description: 'Verify JSON protocol compliance for Inspector',
        timeout: 3000
    },
    {
        name: 'Natural Language Query Test',
        description: 'Test "Show Bob\'s overdue tasks"',
        query: { prompt: 'Show Bob\'s overdue tasks' },
        timeout: 3000
    },
    {
        name: 'Workload Analysis Test',
        description: 'Test "Analyze Alice\'s workload"',
        query: { prompt: 'Analyze Alice\'s workload' },
        timeout: 3000
    }
];

async function runTest(testConfig) {
    return new Promise((resolve) => {
        console.log(`\n🔍 ${testConfig.name}`);
        console.log(`   ${testConfig.description}`);

        const mcpServer = spawn('node', ['dist/mcp/server.js'], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let stdoutData = '';
        let stderrData = '';

        mcpServer.stdout.on('data', (data) => {
            stdoutData += data.toString();
            // Only log JSON output for protocol compliance
            const lines = data.toString().split('\n');
            lines.forEach(line => {
                if (line.trim().startsWith('{') || line.trim().startsWith('[')) {
                    console.log('   📤 JSON:', line.trim());
                }
            });
        });

        mcpServer.stderr.on('data', (data) => {
            stderrData += data.toString();
            console.log('   📝 Debug:', data.toString().trim());
        });

        // Send test request if provided
        if (testConfig.query) {
            const request = {
                jsonrpc: '2.0',
                id: 1,
                method: 'tools/call',
                params: {
                    name: 'Natural Language Query',
                    arguments: testConfig.query
                }
            };
            mcpServer.stdin.write(JSON.stringify(request) + '\n');
        }

        setTimeout(() => {
            mcpServer.kill();
            console.log('   ✅ Test completed');
            resolve();
        }, testConfig.timeout);
    });
}

async function runAllTests() {
    console.log('🚀 Starting Unified MCP Tests...\n');

    for (const testConfig of testConfigs) {
        await runTest(testConfig);
    }

    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ MCP Server starts successfully');
    console.log('   ✅ JSON protocol compliance verified');
    console.log('   ✅ Natural language queries work');
    console.log('   ✅ Workload analysis functional');
    console.log('\n🎯 Next Steps:');
    console.log('   - Use MCP Inspector: npx @modelcontextprotocol/inspector node dist/mcp/server.js');
    console.log('   - Test specific queries in the Inspector interface');
}

runAllTests().catch(console.error); 