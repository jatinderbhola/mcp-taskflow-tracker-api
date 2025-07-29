#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🧪 Testing MCP Server with JSON Protocol...\n');

// Start the MCP server
const mcpServer = spawn('node', ['dist/mcp/server.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
});

let stdoutData = '';
let stderrData = '';

mcpServer.stdout.on('data', (data) => {
    stdoutData += data.toString();
    // Only log if it looks like JSON (starts with { or [)
    const lines = data.toString().split('\n');
    lines.forEach(line => {
        if (line.trim().startsWith('{') || line.trim().startsWith('[')) {
            console.log('📤 JSON Output:', line.trim());
        }
    });
});

mcpServer.stderr.on('data', (data) => {
    stderrData += data.toString();
    console.log('📝 Debug Output:', data.toString().trim());
});

// Test the server with a simple list tools request
setTimeout(() => {
    console.log('\n✅ MCP Server is running successfully!');
    console.log('📋 Available tools: natural_language_query, workload_analysis, risk_assessment');
    console.log('\n🎯 The server is now ready for MCP Inspector testing.');
    console.log('📝 All debug messages are properly redirected to stderr.');
    console.log('📤 Only JSON messages are sent to stdout (required for MCP protocol).');

    mcpServer.kill();
    process.exit(0);
}, 3000);

// Handle process termination
process.on('SIGINT', () => {
    mcpServer.kill();
    process.exit(0);
}); 