#!/usr/bin/env node
/**
 * elevenlabs-agent-governance.js
 * 
 * ELEVENLABS AGENT GOVERNANCE SYSTEM
 * ==================================
 * 
 * Mirrors the n8n workflow governance system for ElevenLabs voice agents.
 * 
 * Core principles:
 * - Deletion BLOCKED (ElevenLabs MCP doesn't expose delete, but we track for audit)
 * - Archiving ENCOURAGED via phase tags
 * - Deployment phases: DEV, ALPHA, BETA, GA, PROD
 * - Only DEV agents can be modified
 * - Before creating, check for similar existing agents
 * - New agents auto-tagged as DEV
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { logHook, readStdinJson, outputResult, getProjectRoot } = require('./hook-utils');

const PROJECT_ROOT = getProjectRoot();
const GOVERNANCE_PATH = path.join(PROJECT_ROOT, 'context', 'elevenlabs-agents', 'governance.yaml');

// Deployment phases (same as workflow governance)
const PHASES = ['DEV', 'ALPHA', 'BETA', 'GA', 'PROD', 'ARCHIVED'];
const MODIFIABLE_PHASES = ['DEV'];
const PROTECTED_PHASES = ['ALPHA', 'BETA', 'GA', 'PROD'];

/**
 * Ensure governance directory exists
 */
function ensureGovernanceDir() {
  const dir = path.dirname(GOVERNANCE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Load agent governance configuration
 */
function loadGovernance() {
  try {
    ensureGovernanceDir();
    if (fs.existsSync(GOVERNANCE_PATH)) {
      return yaml.load(fs.readFileSync(GOVERNANCE_PATH, 'utf8'));
    }
  } catch (e) {
    logHook('elevenlabs-governance', 'Failed to load governance.yaml', { error: e.message });
  }
  return { agents: {}, settings: {} };
}

/**
 * Save agent governance configuration
 */
function saveGovernance(governance) {
  try {
    ensureGovernanceDir();
    fs.writeFileSync(GOVERNANCE_PATH, yaml.dump(governance, { lineWidth: 120 }));
    return true;
  } catch (e) {
    logHook('elevenlabs-governance', 'Failed to save governance.yaml', { error: e.message });
    return false;
  }
}

/**
 * Get agent phase from governance
 */
function getAgentPhase(agentId, agentName) {
  const governance = loadGovernance();
  
  // Check by ID first
  if (governance.agents && governance.agents[agentId]) {
    return governance.agents[agentId].phase || 'DEV';
  }
  
  // Check by name (fallback)
  if (governance.agents) {
    for (const [id, meta] of Object.entries(governance.agents)) {
      if (meta.name === agentName) {
        return meta.phase || 'DEV';
      }
    }
  }
  
  return null; // Not tracked yet
}

/**
 * Calculate similarity between two agent names/descriptions
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
 * Find similar agents in governance
 */
function findSimilarAgents(name, systemPrompt = '') {
  const governance = loadGovernance();
  const searchText = `${name} ${systemPrompt}`;
  const matches = [];
  
  if (governance.agents) {
    for (const [id, meta] of Object.entries(governance.agents)) {
      const agentText = `${meta.name} ${meta.description || ''} ${meta.system_prompt_snippet || ''}`;
      const score = calculateSimilarity(searchText, agentText);
      if (score >= 30) {
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
 * Register a new agent in governance
 */
function registerAgent(agentId, name, systemPrompt = '', phase = 'DEV') {
  const governance = loadGovernance();
  
  if (!governance.agents) {
    governance.agents = {};
  }
  
  governance.agents[agentId] = {
    name,
    phase,
    description: `Voice agent: ${name}`,
    system_prompt_snippet: systemPrompt.substring(0, 200),
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    history: [{
      action: 'created',
      phase,
      timestamp: new Date().toISOString()
    }]
  };
  
  saveGovernance(governance);
  logHook('elevenlabs-governance', 'Registered agent', { agentId, name, phase });
}

/**
 * Handle pre-create agent check
 */
async function handlePreCreate(toolInput) {
  const name = toolInput.name || '';
  const systemPrompt = toolInput.system_prompt || '';
  
  logHook('elevenlabs-governance', 'Pre-create check', { name });
  
  // Find similar existing agents
  const similar = findSimilarAgents(name, systemPrompt);
  
  if (similar.length > 0) {
    const top = similar[0];
    
    if (top.similarity >= 70) {
      return {
        continue: true,
        systemMessage: `⚠️ ELEVENLABS GOVERNANCE: Found very similar agent "${top.name}" (${top.similarity}% match, phase: ${top.phase}).
Consider cloning/modifying existing agent instead of creating new.
Use mcp__elevenlabs-mcp__get_agent(agent_id: "${top.id}") to review.
If you proceed, this will be tagged as DEV phase.`
      };
    } else if (top.similarity >= 40) {
      const topMatches = similar.slice(0, 3).map(m => 
        `  - "${m.name}" (${m.similarity}% match, ${m.phase})`
      ).join('\n');
      
      return {
        continue: true,
        systemMessage: `📋 ELEVENLABS GOVERNANCE: Found similar agents:\n${topMatches}
New agent will be tagged as DEV phase.`
      };
    }
  }
  
  return {
    continue: true,
    systemMessage: `📋 ELEVENLABS GOVERNANCE: No similar agents found. New agent "${name}" will be auto-tagged as DEV phase.
Remember: Agents without phase tags are grounds for archival review.`
  };
}

/**
 * Handle post-create - register new agent as DEV
 */
async function handlePostCreate(toolInput, toolOutput) {
  try {
    const output = typeof toolOutput === 'string' ? JSON.parse(toolOutput) : toolOutput;
    
    // Extract agent ID from response
    let agentId = null;
    if (output.text) {
      const match = output.text.match(/agent_[a-z0-9]+/i);
      if (match) agentId = match[0];
    }
    
    const name = toolInput.name || 'Unnamed Agent';
    const systemPrompt = toolInput.system_prompt || '';
    
    if (agentId) {
      registerAgent(agentId, name, systemPrompt, 'DEV');
      return {
        systemMessage: `✅ ELEVENLABS GOVERNANCE: Agent "${name}" registered as DEV phase (ID: ${agentId})`
      };
    }
  } catch (e) {
    logHook('elevenlabs-governance', 'Post-create registration failed', { error: e.message });
  }
  
  return {};
}

/**
 * Main hook handler
 */
async function main() {
  const hookType = process.env.CLAUDE_HOOK_TYPE || 'PreToolUse';
  const toolName = process.env.CLAUDE_TOOL_NAME || '';
  
  logHook('elevenlabs-governance', `Hook triggered: ${hookType}`, { toolName });
  
  try {
    const data = await readStdinJson();
    const toolInput = data.tool_input || {};
    const toolOutput = data.tool_output || {};
    
    let result = { continue: true };
    
    if (hookType === 'PreToolUse') {
      if (toolName.includes('create_agent')) {
        result = await handlePreCreate(toolInput);
      }
    } else if (hookType === 'PostToolUse') {
      if (toolName.includes('create_agent')) {
        result = await handlePostCreate(toolInput, toolOutput);
      }
    }
    
    outputResult(result);
    process.exit(result.continue === false ? 2 : 0);
    
  } catch (e) {
    logHook('elevenlabs-governance', 'Error', { error: e.message, stack: e.stack });
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
  findSimilarAgents,
  getAgentPhase,
  registerAgent
};

// Run if called directly
if (require.main === module) {
  main();
}
