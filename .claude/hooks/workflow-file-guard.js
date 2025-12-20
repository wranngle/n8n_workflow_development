#!/usr/bin/env node
/**
 * workflow-file-guard.js
 * Hook: PreToolUse (Write)
 * Purpose: Ensure workflow JSON files go to correct project directories
 *
 * FIXES: project path validation, stronger detection, actionable message
 */

const path = require('path');
const { logHook, readStdinJson, outputResult, getProjectRoot } = require('./hook-utils');

const PROJECT_ROOT = getProjectRoot().replace(/\\/g, '/').toLowerCase();
const VALID_SUBDIRS = ['workflows/dev', 'workflows/staging', 'workflows/production'];

function isWorkflowContent(content) {
  if (!content || typeof content !== 'string') return false;
  // Must have both nodes array AND be valid-ish JSON structure
  return content.includes('"nodes"') &&
         (content.includes('"connections"') || content.includes('"type"'));
}

function getValidPath(filePath) {
  const normalized = filePath.replace(/\\/g, '/').toLowerCase();
  // Check if path is within PROJECT workflows directories
  for (const subdir of VALID_SUBDIRS) {
    const validPath = `${PROJECT_ROOT}/${subdir}`;
    if (normalized.includes(validPath) || normalized.includes(subdir)) {
      // Also check it starts with project root or is relative
      if (normalized.startsWith(PROJECT_ROOT) || !path.isAbsolute(filePath)) {
        return subdir;
      }
    }
  }
  return null;
}

async function main() {
  logHook('workflow-file-guard', 'Hook triggered');

  try {
    const data = await readStdinJson();
    const filePath = data.tool_input?.file_path || '';
    const content = data.tool_input?.content || '';

    if (!filePath) {
      process.exit(0);
    }

    const isWorkflow = filePath.endsWith('.json') && isWorkflowContent(content);

    logHook('workflow-file-guard', 'Analysis', {
      filePath: filePath.substring(0, 80),
      isWorkflow,
      projectRoot: PROJECT_ROOT.substring(0, 50)
    });

    if (!isWorkflow) {
      process.exit(0); // Not a workflow file, allow
    }

    const validSubdir = getValidPath(filePath);

    if (validSubdir) {
      // Good path, silent success
      logHook('workflow-file-guard', 'Valid path', { subdir: validSubdir });
      process.exit(0);
    }

    // Bad path - warn with compact message
    outputResult({
      continue: true, // Warn but allow (user may have reason)
      systemMessage: `⚠️ Workflow outside project: ${path.basename(filePath)}
→ Use: workflows/dev/, workflows/staging/, or workflows/production/`
    });

    process.exit(0);
  } catch (e) {
    logHook('workflow-file-guard', 'Error', { error: e.message });
    process.exit(0);
  }
}

main();
