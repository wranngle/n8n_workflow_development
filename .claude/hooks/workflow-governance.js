#!/usr/bin/env node
/**
 * workflow-governance.js
 * 
 * WORKFLOW HYGIENE & ANTIPOLLUTION SYSTEM
 * ========================================
 * 
 * Core principles:
 * - Deletion BLOCKED, archiving ENCOURAGED
 * - Deployment phases: DEV → ALPHA → BETA → GA → PROD
 * - Only DEV workflows can be modified
 * - ALPHA/BETA/GA/PROD can be cloned but not modified
 * - Before creating, check for similar existing workflows
 * - New workflows auto-tagged as DEV
 * 
 * Hook types:
 * - PreToolUse: n8n_create_workflow, n8n_update_*, n8n_delete_workflow
 * - PostToolUse: Auto-tag new workflows as DEV
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { logHook, readStdinJson, outputResult, getProjectRoot } = require('./hook-utils');

const PROJECT_ROOT = getProjectRoot();
const REGISTRY_PATH = path.join(PROJECT_ROOT, 'workflows', 'registry.yaml');
const GOVERNANCE_PATH = path.join(PROJECT_ROOT, 'workflows', 'governance.yaml');

// Deployment phases in order
const PHASES = ['DEV', 'ALPHA', 'BETA', 'GA', 'PROD', 'ARCHIVED'];
const MODIFIABLE_PHASES = ['DEV'];
const CLONABLE_PHASES = ['ALPHA', 'BETA', 'GA', 'PROD'];
const PROTECTED_PHASES = ['ALPHA', 'BETA', 'GA', 'PROD'];

/**
 * Load governance configuration
 */
function loadGovernance() {
  try {
    if (fs.existsSync(GOVERNANCE_PATH)) {
      return yaml.load(fs.readFileSync(GOVERNANCE_PATH, 'utf8'));
    }
  } catch (e) {
    logHook('governance', 'Failed to load governance.yaml', { error: e.message });
  }
  return { workflows: {}, settings: {} };
}

/**
 * Save governance configuration
 */
function saveGovernance(governance) {
  try {
    fs.writeFileSync(GOVERNANCE_PATH, yaml.dump(governance, { lineWidth: 120 }));
    return true;
  } catch (e) {
    logHook('governance', 'Failed to save governance.yaml', { error: e.message });
    return false;
  }
}

/**
 * Load workflow registry
 */
function loadRegistry() {
  try {
    if (fs.existsSync(REGISTRY_PATH)) {
      return yaml.load(fs.readFileSync(REGISTRY_PATH, 'utf8'));
    }
  } catch (e) {
    logHook('governance', 'Failed to load registry.yaml', { error: e.message });
  }
  return { workflows: {} };
}

/**
 * Get workflow phase from governance
 */
function getWorkflowPhase(workflowId, workflowName) {
  const governance = loadGovernance();
  
  // Check by ID first
  if (governance.workflows && governance.workflows[workflowId]) {
    return governance.workflows[workflowId].phase || 'DEV';
  }
  
  // Check by name (fallback)
  if (governance.workflows) {
    for (const [id, meta] of Object.entries(governance.workflows)) {
      if (meta.name === workflowName) {
        return meta.phase || 'DEV';
      }
    }
  }
  
  return null; // Not tracked yet
}

/**
 * Calculate similarity between two workflow names/descriptions
 * Returns score 0-100
 */
function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  str1 = str1.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  str2 = str2.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  
  const words1 = new Set(str1.split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(str2.split(/\s+/).filter(w => w.length > 2));
  
  if (words1.size === 0 || words2.size === 0) return 0;
  
  const intersection = [...words1].filter(w => words2.has(w)).length;
  const union = new Set([...words1, ...words2]).size;
  
  return Math.round((intersection / union) * 100);
}

/**
 * Find similar workflows in registry and governance
 */
function findSimilarWorkflows(name, description = '') {
  const registry = loadRegistry();
  const governance = loadGovernance();
  const searchText = `${name} ${description}`;
  const matches = [];
  
  // Check registry workflows
  if (registry.workflows) {
    for (const [key, workflow] of Object.entries(registry.workflows)) {
      const workflowText = `${key} ${workflow.description || ''}`;
      const score = calculateSimilarity(searchText, workflowText);
      if (score >= 30) {
        matches.push({
          id: workflow.n8n_id || key,
          name: key,
          description: workflow.description,
          similarity: score,
          phase: governance.workflows?.[workflow.n8n_id]?.phase || 'UNTRACKED',
          path: workflow.path
        });
      }
    }
  }
  
  // Check governance tracked workflows
  if (governance.workflows) {
    for (const [id, meta] of Object.entries(governance.workflows)) {
      const workflowText = `${meta.name} ${meta.description || ''}`;
      const score = calculateSimilarity(searchText, workflowText);
      if (score >= 30 && !matches.find(m => m.id === id)) {
        matches.push({
          id,
          name: meta.name,
          description: meta.description,
          similarity: score,
          phase: meta.phase || 'DEV'
        });
      }
    }
  }
  
  return matches.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Register a new workflow in governance
 */
function registerWorkflow(workflowId, name, phase = 'DEV') {
  const governance = loadGovernance();
  
  if (!governance.workflows) {
    governance.workflows = {};
  }
  
  governance.workflows[workflowId] = {
    name,
    phase,
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    history: [{
      action: 'created',
      phase,
      timestamp: new Date().toISOString()
    }]
  };
  
  saveGovernance(governance);
  logHook('governance', 'Registered workflow', { workflowId, name, phase });
}

/**
 * Handle pre-create workflow check
 */
async function handlePreCreate(toolInput) {
  const name = toolInput.name || '';
  const nodes = toolInput.nodes || [];
  
  logHook('governance', 'Pre-create check', { name, nodeCount: nodes.length });
  
  // Find similar existing workflows
  const similar = findSimilarWorkflows(name);
  
  if (similar.length > 0) {
    const top = similar[0];
    
    if (top.similarity >= 70) {
      // Very similar - strongly suggest clone
      return {
        continue: true,
        systemMessage: `⚠️ GOVERNANCE: Found very similar workflow "${top.name}" (${top.similarity}% match, phase: ${top.phase}).
Consider cloning instead of creating new. Use n8n_get_workflow(id: "${top.id}") to review.
If you proceed, this will be tagged as DEV phase.`
      };
    } else if (top.similarity >= 40) {
      // Somewhat similar - inform
      const topMatches = similar.slice(0, 3).map(m => 
        `  - "${m.name}" (${m.similarity}% match, ${m.phase})`
      ).join('\n');
      
      return {
        continue: true,
        systemMessage: `📋 GOVERNANCE: Found similar workflows:\n${topMatches}
New workflow will be tagged as DEV phase.`
      };
    }
  }
  
  // No similar workflows - proceed with DEV tag reminder
  return {
    continue: true,
    systemMessage: `📋 GOVERNANCE: No similar workflows found. New workflow "${name}" will be auto-tagged as DEV phase.`
  };
}

/**
 * Handle pre-update workflow check
 */
async function handlePreUpdate(toolInput) {
  const workflowId = toolInput.id;
  const name = toolInput.name;
  
  if (!workflowId) {
    return { continue: true }; // Can't check without ID
  }
  
  const phase = getWorkflowPhase(workflowId, name);
  
  logHook('governance', 'Pre-update check', { workflowId, name, phase });
  
  if (phase === null) {
    // Not tracked - allow but register as DEV
    return {
      continue: true,
      systemMessage: `📋 GOVERNANCE: Workflow not tracked. Will register as DEV phase after update.`
    };
  }
  
  if (PROTECTED_PHASES.includes(phase)) {
    // Protected phase - BLOCK modification
    return {
      continue: false,
      systemMessage: `❌ GOVERNANCE BLOCKED: Workflow "${name}" is in ${phase} phase and cannot be modified.
Protected phases (${PROTECTED_PHASES.join(', ')}) can only be CLONED, not edited.
To modify: Clone the workflow, work on the DEV copy, then promote when ready.`
    };
  }
  
  if (phase === 'ARCHIVED') {
    return {
      continue: false,
      systemMessage: `❌ GOVERNANCE BLOCKED: Workflow "${name}" is ARCHIVED.
Archived workflows cannot be modified. Clone to a new DEV workflow if you need to resurrect this.`
    };
  }
  
  // DEV phase - allow
  return {
    continue: true,
    systemMessage: `✅ GOVERNANCE: Workflow "${name}" is in ${phase} phase - modification allowed.`
  };
}

/**
 * Handle pre-delete workflow check - ALWAYS BLOCK
 */
async function handlePreDelete(toolInput) {
  const workflowId = toolInput.id;
  
  logHook('governance', 'Pre-delete BLOCKED', { workflowId });
  
  return {
    continue: false,
    systemMessage: `❌ GOVERNANCE BLOCKED: Deletion is not allowed in this organization.

Instead, use one of these approaches:
1. ARCHIVE: Update the workflow phase to ARCHIVED
2. DEACTIVATE: Deactivate the workflow but keep it for reference
3. RENAME: Prefix with "[DEPRECATED] " to mark as obsolete

To archive a workflow, update governance.yaml or use:
n8n_update_partial_workflow({ id: "${workflowId}", operations: [{ type: "addTag", tag: "archived" }] })`
  };
}

/**
 * Handle post-create - register new workflow as DEV
 */
async function handlePostCreate(toolInput, toolOutput) {
  try {
    const output = typeof toolOutput === 'string' ? JSON.parse(toolOutput) : toolOutput;
    const workflowId = output.id || output.workflow?.id;
    const name = toolInput.name || output.name || output.workflow?.name;
    
    if (workflowId && name) {
      registerWorkflow(workflowId, name, 'DEV');
      return {
        systemMessage: `✅ GOVERNANCE: Workflow "${name}" registered as DEV phase (ID: ${workflowId})`
      };
    }
  } catch (e) {
    logHook('governance', 'Post-create registration failed', { error: e.message });
  }
  
  return {};
}

/**
 * Main hook handler
 */
async function main() {
  const hookType = process.env.CLAUDE_HOOK_TYPE || 'PreToolUse';
  const toolName = process.env.CLAUDE_TOOL_NAME || '';
  
  logHook('governance', `Hook triggered: ${hookType}`, { toolName });
  
  try {
    const data = await readStdinJson();
    const toolInput = data.tool_input || {};
    const toolOutput = data.tool_output || {};
    
    let result = { continue: true };
    
    if (hookType === 'PreToolUse') {
      if (toolName.includes('n8n_create_workflow')) {
        result = await handlePreCreate(toolInput);
      } else if (toolName.includes('n8n_update') || toolName.includes('n8n_update_full') || toolName.includes('n8n_update_partial')) {
        result = await handlePreUpdate(toolInput);
      } else if (toolName.includes('n8n_delete_workflow')) {
        result = await handlePreDelete(toolInput);
      }
    } else if (hookType === 'PostToolUse') {
      if (toolName.includes('n8n_create_workflow')) {
        result = await handlePostCreate(toolInput, toolOutput);
      }
    }
    
    outputResult(result);
    process.exit(result.continue === false ? 2 : 0);
    
  } catch (e) {
    logHook('governance', 'Error', { error: e.message, stack: e.stack });
    outputResult({ continue: true }); // Fail open
    process.exit(0);
  }
}

// Export for testing
module.exports = {
  PHASES,
  MODIFIABLE_PHASES,
  PROTECTED_PHASES,
  calculateSimilarity,
  findSimilarWorkflows,
  getWorkflowPhase,
  registerWorkflow
};

// Run if called directly
if (require.main === module) {
  main();
}
