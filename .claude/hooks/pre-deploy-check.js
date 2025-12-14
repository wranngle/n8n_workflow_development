#!/usr/bin/env node
/**
 * pre-deploy-check.js
 *
 * Hook: PreToolUse (n8n_create_workflow)
 * Purpose: Block deployment if validation wasn't performed
 */

const fs = require('fs');
const { logHook, readStdinJson, outputResult } = require('./hook-utils');

async function main() {
  logHook('pre-deploy-check', 'Hook triggered');

  try {
    const data = await readStdinJson();
    const transcriptPath = data.transcript_path;
    const toolInput = data.tool_input || {};

    logHook('pre-deploy-check', 'Checking deployment', {
      workflowName: toolInput.name,
      hasTranscript: !!transcriptPath
    });

    // Check if this workflow has a name (required)
    if (!toolInput.name) {
      logHook('pre-deploy-check', 'BLOCKED: No workflow name');
      console.error('ERROR: Workflow must have a name before deployment');
      process.exit(2); // Block the action
    }

    // Read transcript to check if validation was performed
    if (transcriptPath && fs.existsSync(transcriptPath)) {
      const fileContent = fs.readFileSync(transcriptPath, 'utf8');

      const hasValidation = fileContent.includes('validate_workflow') ||
                           fileContent.includes('validate_node_operation');

      if (!hasValidation) {
        logHook('pre-deploy-check', 'Warning: No validation detected');
        outputResult({
          continue: true,
          systemMessage: `⚠️ WARNING: Deploying workflow without validation detected.
Consider running mcp__n8n-mcp__validate_workflow before deployment.`
        });
      }
    }

    process.exit(0);
  } catch (e) {
    logHook('pre-deploy-check', 'Error occurred', { error: e.message });
    process.exit(0);
  }
}

main();
