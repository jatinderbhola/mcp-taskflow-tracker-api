#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🧪 Testing Bob\'s Finished Tasks Query\n');

// Test the specific query that was failing
const testQuery = {
    name: 'natural_language_query',
    arguments: { prompt: 'Query Bob finished tasks' },
    description: 'Query Bob\'s finished tasks (should return only Bob\'s completed tasks)'
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
                    console.log(`   👤 Assignee Filter: ${result.analysis.filters_applied.assignee}`);

                    if (result.data.length > 0) {
                        console.log('   📋 Tasks found:');
                        result.data.forEach((task, index) => {
                            console.log(`      ${index + 1}. ${task.title} (${task.status}) - ${task.assigneeName}`);
                        });

                        // Check if all tasks belong to Bob
                        const bobTasks = result.data.filter(task => task.assigneeName === 'Bob');
                        const otherTasks = result.data.filter(task => task.assigneeName !== 'Bob');

                        console.log(`   ✅ Bob's tasks: ${bobTasks.length}`);
                        console.log(`   ❌ Other people's tasks: ${otherTasks.length}`);

                        if (otherTasks.length > 0) {
                            console.log('   ⚠️  WARNING: Found tasks for other people!');
                            otherTasks.forEach(task => {
                                console.log(`      - ${task.title} (${task.assigneeName})`);
                            });
                        }
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
    console.log('🚀 Testing Bob\'s Finished Tasks Query...\n');

    await testMCPQuery();

    console.log('\n🎉 Test completed!');
    console.log('\n📋 Expected Results:');
    console.log('   ✅ Should detect "Bob" as assignee');
    console.log('   ✅ Should detect "finished" as completed status');
    console.log('   ✅ Should return only Bob\'s completed tasks');
    console.log('   ✅ Should NOT return Alice\'s or Charlie\'s tasks');
}

runTest().catch(console.error); 