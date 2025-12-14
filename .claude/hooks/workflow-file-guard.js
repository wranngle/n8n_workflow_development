#!/usr/bin/env node
/**
 * workflow-file-guard.js
 *
 * Hook: PreToolUse (Write)
 * Purpose: Ensure workflow JSON files go to correct directories
 */

const { logHook, readStdinJson, outputResult } = require('./hook-utils');

async function main() {
  logHook('workflow-file-guard', 'Hook triggered');

  try {
    const data = await readStdinJson();
    const filePath = (data.tool_input?.file_path || '').toLowerCase();
    const content = data.tool_input?.content || '';

    // Check if this looks like a workflow file
    const isWorkflowFile = filePath.endsWith('.json') &&
                          (content.includes('"nodes"') || content.includes('"connections"'));

    logHook('workflow-file-guard', 'File analysis', {
      filePath,
      isWorkflowFile
    });

    if (isWorkflowFile) {
      // Check if it's in the correct directory (handle both / and \ separators)
      const normalizedPath = filePath.replace(/\\/g, '/');
      const validPaths = ['workflows/dev', 'workflows/staging', 'workflows/production'];
      const isInValidPath = validPaths.some(p => normalizedPath.includes(p));

      if (!isInValidPath && !normalizedPath.includes('workflows/')) {
        logHook('workflow-file-guard', 'Warning: Non-standard location');
        outputResult({
          continue: true,
          systemMessage: `📁 WORKFLOW FILE LOCATION: Writing workflow to ${filePath}
Recommended structure:
- workflows/dev/ for development
- workflows/staging/ for pre-production
- workflows/production/ for deployed workflows`
        });
      }
    }

    process.exit(0);
  } catch (e) {
    logHook('workflow-file-guard', 'Error occurred', { error: e.message });
    process.exit(0);
  }
}

main();
