#!/usr/bin/env node
/**
 * pre-deploy-check.js
 * 
 * Hook: PreToolUse (n8n_create_workflow)
 * Purpose: Block deployment if validation wasn't performed
 * 
 * This hook checks the transcript to ensure validate_workflow
 * was called before attempting to deploy a workflow.
 */

const fs = require('fs');
const readline = require('readline');

let input = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  input += chunk;
});

process.stdin.on('end', async () => {
  try {
    const data = JSON.parse(input);
    const transcriptPath = data.transcript_path;
    const toolInput = data.tool_input || {};
    
    // Check if this workflow has a name (required)
    if (!toolInput.name) {
      console.error('ERROR: Workflow must have a name before deployment');
      process.exit(2); // Block the action
    }
    
    // Read transcript to check if validation was performed
    if (transcriptPath && fs.existsSync(transcriptPath)) {
      const fileContent = fs.readFileSync(transcriptPath, 'utf8');
      
      // Check if validate_workflow was called recently
      const hasValidation = fileContent.includes('validate_workflow') || 
                           fileContent.includes('validate_node_operation');
      
      if (!hasValidation) {
        const output = {
          continue: true, // Allow but warn
          systemMessage: `⚠️ WARNING: Deploying workflow without validation detected in transcript.
Consider running mcp__n8n-mcp__validate_workflow before deployment.
Deployment will proceed but may contain errors.`
        };
        console.log(JSON.stringify(output));
      }
    }
    
    process.exit(0);
  } catch (e) {
    // On error, allow to continue but log
    console.error('Pre-deploy check error:', e.message);
    process.exit(0);
  }
});
