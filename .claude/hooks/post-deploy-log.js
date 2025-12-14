#!/usr/bin/env node
/**
 * post-deploy-log.js
 *
 * Hook: PostToolUse (n8n_create_workflow, n8n_update_full_workflow)
 * Purpose: Log all deployments for audit trail
 */

const fs = require('fs');
const path = require('path');
const { logHook, readStdinJson, outputResult, getProjectRoot } = require('./hook-utils');

async function main() {
  logHook('post-deploy-log', 'Hook triggered');

  try {
    const data = await readStdinJson();
    const projectDir = getProjectRoot();
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

    logHook('post-deploy-log', 'Creating log entry', logEntry);

    // Ensure workflows directory exists
    const workflowsDir = path.dirname(logFile);
    if (!fs.existsSync(workflowsDir)) {
      fs.mkdirSync(workflowsDir, { recursive: true });
    }

    // Append to log
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');

    outputResult({
      continue: true,
      systemMessage: `📋 Deployment logged: ${toolInput.name || 'workflow'} at ${logEntry.timestamp}`
    });

    process.exit(0);
  } catch (e) {
    logHook('post-deploy-log', 'Error occurred', { error: e.message });
    process.exit(0);
  }
}

main();
