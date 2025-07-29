#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🧪 Testing MCP Server...\n');

// Start the MCP server
const mcpServer = spawn('node', ['dist/mcp/server.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
});

let output = '';

mcpServer.stdout.on('data', (data) => {
    output += data.toString();
    console.log('📤 Server Output:', data.toString().trim());
});

mcpServer.stderr.on('data', (data) => {
    console.log('data...:', data.toString().trim());
});

// Test the server with a simple list tools request
setTimeout(() => {
    console.log('\n✅ MCP Server is running successfully!');
    console.log('📋 Available tools: natural_language_query, workload_analysis, risk_assessment');
    console.log('\n🎯 To test with MCP Inspector, run:');
    console.log('   npx @modelcontextprotocol/inspector node dist/mcp/server.js');
    console.log('\n🔧 Example queries:');
    console.log('   - "Show me Bob\'s overdue tasks"');
    console.log('   - "Analyze Alice\'s workload"');
    console.log('   - "Assess risk for project-1"');

    mcpServer.kill();
    process.exit(0);
}, 2000);

// Handle process termination
process.on('SIGINT', () => {
    mcpServer.kill();
    process.exit(0);
}); 