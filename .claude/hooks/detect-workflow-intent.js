#!/usr/bin/env node
/**
 * detect-workflow-intent.js
 * 
 * Hook: UserPromptSubmit
 * Purpose: Detect workflow development requests and inject search reminder
 * 
 * When user submits a prompt that looks like an n8n workflow request,
 * this injects a system message reminding Claude to search existing
 * workflows first before building new ones.
 */

const fs = require('fs');

// Read hook input from stdin
let input = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const userPrompt = (data.user_prompt || '').toLowerCase();
    
    // Keywords that indicate workflow development intent
    const workflowKeywords = [
      'workflow', 'automation', 'automate', 'n8n',
      'webhook', 'trigger', 'schedule', 'cron',
      'integrate', 'integration', 'connect', 'sync',
      'when', 'whenever', 'every time', 'if this then',
      'send to slack', 'send email', 'notify',
      'fetch data', 'pull from', 'push to',
      'api call', 'http request'
    ];
    
    // Check if this looks like a workflow request
    const isWorkflowRequest = workflowKeywords.some(kw => userPrompt.includes(kw));
    
    if (isWorkflowRequest) {
      // Output system message to remind about search-first protocol
      const output = {
        continue: true,
        systemMessage: `⚠️ WORKFLOW DEVELOPMENT DETECTED - MANDATORY SEARCH PROTOCOL:
Before building ANY workflow:
1. Search existing instance: mcp__n8n-mcp__n8n_list_workflows
2. Search community library (4,343 workflows): Use GitHub API
3. Search MCP templates (2,709): mcp__n8n-mcp__search_templates
4. Analyze matching workflow JSON structures for reusable patterns
Only build new if no suitable existing solution found.`
      };
      
      console.log(JSON.stringify(output));
    }
    
    process.exit(0);
  } catch (e) {
    // Non-blocking error - continue normally
    process.exit(0);
  }
});
