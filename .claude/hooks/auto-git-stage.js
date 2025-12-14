#!/usr/bin/env node
/**
 * auto-git-stage.js
 * 
 * Hook: PostToolUse (Write)
 * Purpose: Auto-stage workflow files after writing
 */

const { execSync } = require('child_process');
const path = require('path');

let input = '';
process.stdin.setEncoding('utf8');

process.stdin.on('data', chunk => {
  input += chunk;
});

process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const filePath = data.tool_input?.file_path || '';
    const projectDir = process.env.CLAUDE_PROJECT_DIR || '.';
    
    // Only auto-stage workflow files
    if (filePath.includes('workflows') && filePath.endsWith('.json')) {
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
        
        const output = {
          continue: true,
          systemMessage: `📎 Auto-staged: ${relativePath}`
        };
        console.log(JSON.stringify(output));
      } catch (gitError) {
        // Not a git repo or git not available - skip silently
      }
    }
    
    process.exit(0);
  } catch (e) {
    process.exit(0);
  }
});
