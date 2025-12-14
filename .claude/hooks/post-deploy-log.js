#!/usr/bin/env node
/**
 * post-deploy-log.js
 * 
 * Hook: PostToolUse (n8n_create_workflow, n8n_update_full_workflow)
 * Purpose: Log all deployments for audit trail
 */

const fs = require('fs');
const path = require('path');

let input = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const projectDir = process.env.CLAUDE_PROJECT_DIR || '.';
    const logFile = path.join(projectDir, 'workflows', 'deployment-log.jsonl');
    
    const toolInput = data.tool_input || {};
    const toolOutput = data.tool_output || {};
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: data.tool_name,
      workflowName: toolInput.name || 'unknown',
      workflowId: toolOutput.id || null,
      sessionId: data.session_id,
      success: !toolOutput.error
    };
    
    // Ensure workflows directory exists
    const workflowsDir = path.dirname(logFile);
    if (!fs.existsSync(workflowsDir)) {
      fs.mkdirSync(workflowsDir, { recursive: true });
    }
    
    // Append to log
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    
    // Output confirmation
    const output = {
      continue: true,
      systemMessage: `📋 Deployment logged: ${toolInput.name || 'workflow'} at ${logEntry.timestamp}`
    };
    console.log(JSON.stringify(output));
    
    process.exit(0);
  } catch (e) {
    process.exit(0);
  }
});
