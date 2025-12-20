#!/usr/bin/env node
/**
 * session-init.js
 * Hook: SessionStart
 * FIXES: Leaner message, no redundancy with intent hook
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { logHook, getProjectRoot, outputResult } = require('./hook-utils');

const projectDir = getProjectRoot();
const stateFile = path.join(projectDir, '.claude', 'logs', 'session-state.json');

logHook('session-init', 'Hook triggered', { projectDir });

function checkN8nHealth() {
  try {
    execSync(
      'node -e "const h=require(\'http\');const r=h.get((process.env.N8N_API_URL||\'http://localhost:5678\')+\'/healthz\',res=>{process.exit(res.statusCode===200?0:1)});r.on(\'error\',()=>process.exit(1));r.setTimeout(2000,()=>process.exit(1))"',
      { timeout: 3000, stdio: 'pipe', env: process.env }
    );
    return true;
  } catch { return false; }
}

function countWorkflows(dir) {
  try {
    if (!fs.existsSync(dir)) return 0;
    return fs.readdirSync(dir).filter(f => f.endsWith('.json')).length;
  } catch { return 0; }
}

try {
  const dirs = ['workflows/dev', 'workflows/staging', 'workflows/production'];
  const missingDirs = dirs.filter(d => !fs.existsSync(path.join(projectDir, d)));
  missingDirs.forEach(d => fs.mkdirSync(path.join(projectDir, d), { recursive: true }));

  const workflowCount = dirs.reduce((sum, d) => sum + countWorkflows(path.join(projectDir, d)), 0);
  const n8nUp = checkN8nHealth();

  // Save state for other hooks
  const state = { n8nUp, workflowCount, timestamp: Date.now() };
  fs.writeFileSync(stateFile, JSON.stringify(state));

  // Compact message - intent hook handles the protocol details
  const msg = `🔧 n8n: ${workflowCount} local | instance ${n8nUp ? '✅' : '⚠️ down'}${missingDirs.length ? ' | created: ' + missingDirs.join(', ') : ''}`;

  outputResult({ continue: true, systemMessage: msg });
  logHook('session-init', 'Success', { workflowCount, n8nUp, msgLen: msg.length });
  process.exit(0);
} catch (e) {
  logHook('session-init', 'ERROR', { error: e.message });
  outputResult({ continue: true, systemMessage: `⚠️ Init error: ${e.message}` });
  process.exit(1);
}
