#!/usr/bin/env node
/**
 * auto-git-stage.js
 *
 * Hook: PostToolUse (Write)
 * Purpose: Auto-stage workflow files after writing
 */

const { execSync } = require('child_process');
const path = require('path');
const { logHook, readStdinJson, outputResult, getProjectRoot } = require('./hook-utils');

async function main() {
  logHook('auto-git-stage', 'Hook triggered');

  try {
    const data = await readStdinJson();
    const filePath = data.tool_input?.file_path || '';
    const projectDir = getProjectRoot();

    // Normalize path separators for comparison
    const normalizedPath = filePath.replace(/\\/g, '/');

    logHook('auto-git-stage', 'File analysis', {
      filePath,
      normalizedPath,
      projectDir
    });

    // Only auto-stage workflow files
    if (normalizedPath.includes('workflows') && normalizedPath.endsWith('.json')) {
      try {
        // Check if we're in a git repo
        execSync('git rev-parse --is-inside-work-tree', {
          cwd: projectDir,
          stdio: 'pipe'
        });

        // Stage the file
        const relativePath = path.relative(projectDir, filePath);
        execSync(`git add "${relativePath}"`, {
          cwd: projectDir,
          stdio: 'pipe'
        });

        logHook('auto-git-stage', 'File staged', { relativePath });
        outputResult({
          continue: true,
          systemMessage: `📎 Auto-staged: ${relativePath}`
        });
      } catch (gitError) {
        logHook('auto-git-stage', 'Git operation failed', { error: gitError.message });
      }
    }

    process.exit(0);
  } catch (e) {
    logHook('auto-git-stage', 'Error occurred', { error: e.message });
    process.exit(0);
  }
}

main();
