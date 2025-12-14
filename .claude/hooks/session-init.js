#!/usr/bin/env node
/**
 * session-init.js
 *
 * Hook: SessionStart
 * Purpose: Initialize session with n8n development context
 */

const fs = require('fs');
const path = require('path');
const { logHook, getProjectRoot, outputResult } = require('./hook-utils');

const projectDir = getProjectRoot();

logHook('session-init', 'Hook triggered', { projectDir });

try {
  // Check if workflow directories exist
  const dirs = ['workflows/dev', 'workflows/staging', 'workflows/production'];
  const missingDirs = dirs.filter(d => !fs.existsSync(path.join(projectDir, d)));

  // Create missing directories
  missingDirs.forEach(d => {
    fs.mkdirSync(path.join(projectDir, d), { recursive: true });
  });

  // Count existing workflows
  let workflowCount = 0;
  dirs.forEach(d => {
    const dir = path.join(projectDir, d);
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
      workflowCount += files.length;
    }
  });

  const output = {
    continue: true,
    systemMessage: `🔧 n8n Development Session Initialized
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📂 Local workflows: ${workflowCount}
🔍 Community library: 4,343 workflows (GitHub)
📚 MCP templates: 2,709 templates
${missingDirs.length > 0 ? `📁 Created directories: ${missingDirs.join(', ')}` : ''}

Remember: /workflow for full pipeline, search before building!`
  };

  logHook('session-init', 'Output generated', { workflowCount, missingDirs });
  outputResult(output);
  process.exit(0);
} catch (e) {
  logHook('session-init', 'Error occurred', { error: e.message });
  process.exit(0);
}
