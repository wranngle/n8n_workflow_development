#!/usr/bin/env node
/**
 * post-deploy-log.js
 * Hook: PostToolUse (n8n_create_workflow, n8n_update_full_workflow)
 * FIXES: Validate input, consistent naming, compact output
 */

const fs = require('fs');
const path = require('path');
const { logHook, readStdinJson, outputResult, getProjectRoot } = require('./hook-utils');

async function main() {
  logHook('post-deploy-log', 'Hook triggered');

  try {
    const data = await readStdinJson();
    const toolName = data.tool_name || '';

    // Only log actual deploy actions
    if (!toolName.includes('create_workflow') && !toolName.includes('update_full_workflow')) {
      logHook('post-deploy-log', 'Skipped - not a deploy action', { toolName });
      process.exit(0);
    }

    const projectDir = getProjectRoot();
    const logFile = path.join(projectDir, 'workflows', 'deployment-log.jsonl');

    const toolInput = data.tool_input || {};
    const toolOutput = data.tool_output || {};
    const workflowName = toolInput.name || 'unnamed';
    const workflowId = toolOutput.id || null;
    const hasError = !!toolOutput.error;
    const success = !hasError && !!workflowId;

    const logEntry = {
      ts: new Date().toISOString(),
      action: toolName.includes('update') ? 'update' : 'create',
      name: workflowName,
      id: workflowId,
      success
    };

    // Ensure workflows directory exists
    const workflowsDir = path.dirname(logFile);
    if (!fs.existsSync(workflowsDir)) {
      fs.mkdirSync(workflowsDir, { recursive: true });
    }

    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    logHook('post-deploy-log', 'Logged', logEntry);

    // Compact message
    const status = success ? '✅' : '❌';
    const idPart = workflowId ? ` (${workflowId})` : '';
    outputResult({
      continue: true,
      systemMessage: `${status} ${logEntry.action}: ${workflowName}${idPart}`
    });

    process.exit(0);
  } catch (e) {
    logHook('post-deploy-log', 'Error', { error: e.message });
    process.exit(0);
  }
}

main();
