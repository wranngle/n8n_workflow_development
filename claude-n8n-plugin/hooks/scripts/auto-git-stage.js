#!/usr/bin/env node
/**
 * auto-git-stage.js
 * Hook: PostToolUse (Write)
 * FIXES: File existence check, normalized paths, cleaner output
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { logHook, readStdinJson, outputResult, getProjectRoot } = require('./hook-utils');

const projectDir = getProjectRoot();

async function main() {
  logHook('auto-git-stage', 'Hook triggered');

  try {
    const data = await readStdinJson();
    const filePath = data.tool_input?.file_path || '';

    if (!filePath) {
      process.exit(0);
    }

    const normalized = filePath.replace(/\\/g, '/');

    // Only auto-stage workflow JSON files
    if (!normalized.includes('workflows') || !normalized.endsWith('.json')) {
      process.exit(0);
    }

    // Get relative path for git
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(projectDir, filePath);
    const relativePath = path.relative(projectDir, fullPath).replace(/\\/g, '/');

    logHook('auto-git-stage', 'Processing', { relativePath, exists: fs.existsSync(fullPath) });

    // Check file exists before trying to stage
    if (!fs.existsSync(fullPath)) {
      logHook('auto-git-stage', 'File not found', { fullPath });
      process.exit(0); // Silent - file might be deleted intentionally
    }

    // Check if in git repo
    try {
      execSync('git rev-parse --is-inside-work-tree', { cwd: projectDir, stdio: 'pipe' });
    } catch {
      logHook('auto-git-stage', 'Not a git repo');
      process.exit(0);
    }

    // Stage the file
    try {
      execSync(`git add "${relativePath}"`, { cwd: projectDir, stdio: 'pipe' });
      logHook('auto-git-stage', 'Staged', { relativePath });
      outputResult({
        continue: true,
        systemMessage: `📎 Staged: ${relativePath}`
      });
    } catch (e) {
      logHook('auto-git-stage', 'Git add failed', { error: e.message });
      // Silent fail - don't interrupt workflow
    }

    process.exit(0);
  } catch (e) {
    logHook('auto-git-stage', 'Error', { error: e.message });
    process.exit(0);
  }
}

main();
