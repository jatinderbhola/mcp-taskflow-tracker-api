#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🧪 Testing TODO Status Detection Fix\n');

// Test the specific query that was failing
const testQuery = {
    name: 'natural_language_query',
    arguments: { prompt: 'show bob\'s todo tasks' },
    description: 'Query Bob\'s TODO tasks (should return 2 tasks)'
};

function testMCPQuery() {
    return new Promise((resolve) => {
        console.log(`🔍 Testing: ${testQuery.description}`);
        console.log(`   Tool: ${testQuery.name}`);
        console.log(`   Args: ${JSON.stringify(testQuery.arguments)}`);

        const mcpServer = spawn('node', ['dist/mcp/server.js'], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let errorOutput = '';

        mcpServer.stdout.on('data', (data) => {
            output += data.toString();
        });

        mcpServer.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        // Send the tool call request
        const request = {
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
                name: testQuery.name,
                arguments: testQuery.arguments
            }
        };

        mcpServer.stdin.write(JSON.stringify(request) + '\n');

        setTimeout(() => {
            mcpServer.kill();

            try {
                const response = JSON.parse(output);
                if (response.result) {
                    const result = JSON.parse(response.result.content[0].text);
                    console.log('   ✅ Success!');
                    console.log(`   📊 Found: ${result.data.length} tasks`);
                    console.log(`   💡 Summary: ${result.summary}`);
                    console.log(`   🎯 Status Filter: ${result.analysis.filters_applied.status}`);
                    console.log(`   📝 Reasoning: ${result.analysis.reasoning ? result.analysis.reasoning.join(', ') : 'N/A'}`);

                    if (result.data.length > 0) {
                        console.log('   📋 Tasks found:');
                        result.data.forEach((task, index) => {
                            console.log(`      ${index + 1}. ${task.title} (${task.status})`);
                        });
                    }
                } else {
                    console.log('   ❌ Failed:', response.error);
                }
            } catch (e) {
                console.log('   ⚠️  Parse error:', e.message);
            }

            resolve();
        }, 2000);
    });
}

async function runTest() {
    console.log('🚀 Testing TODO Status Detection...\n');

    await testMCPQuery();

    console.log('\n🎉 Test completed!');
    console.log('\n📋 Expected Results:');
    console.log('   ✅ Should detect "todo" keyword in prompt');
    console.log('   ✅ Should apply status filter: TODO');
    console.log('   ✅ Should return 2 tasks for Bob');
    console.log('   ✅ Should show proper reasoning in analysis');
}

runTest().catch(console.error); 