#!/usr/bin/env node
/**
 * detect-workflow-intent.js
 *
 * Hook: UserPromptSubmit
 * Purpose: Detect workflow development requests and inject comprehensive protocol reminder
 *
 * When user submits a prompt that looks like an n8n workflow request,
 * this injects a system message reminding Claude of the mandatory
 * pre-flight checklist and search-first protocol.
 */

const { logHook, readStdinJson, outputResult } = require('./hook-utils');

async function main() {
  logHook('detect-workflow-intent', 'Hook triggered');

  try {
    const data = await readStdinJson();
    const userPrompt = (data.user_prompt || '').toLowerCase();

    logHook('detect-workflow-intent', 'Processing prompt', {
      promptLength: userPrompt.length,
      promptPreview: userPrompt.substring(0, 100)
    });

    // Keywords that indicate workflow development intent
    const workflowKeywords = [
      'workflow', 'automation', 'automate', 'n8n',
      'webhook', 'trigger', 'schedule', 'cron',
      'integrate', 'integration', 'connect', 'sync',
      'when', 'whenever', 'every time', 'if this then',
      'send to slack', 'send email', 'notify',
      'fetch data', 'pull from', 'push to',
      'api call', 'http request',
      'build', 'create', 'make'
    ];

    // Check if this looks like a workflow request
    const matchedKeywords = workflowKeywords.filter(kw => userPrompt.includes(kw));
    const isWorkflowRequest = matchedKeywords.length > 0;

    logHook('detect-workflow-intent', 'Keyword analysis', {
      isWorkflowRequest,
      matchedKeywords
    });

    if (isWorkflowRequest) {
      // Output comprehensive system message with all mandatory steps
      const output = {
        continue: true,
        systemMessage: `⚠️ WORKFLOW DEVELOPMENT DETECTED - MANDATORY PROTOCOL:

**STEP 1: PRE-FLIGHT (REQUIRED)**
- Run mcp__n8n-mcp__n8n_health_check() FIRST
- Invoke Skill: n8n-workflow-dev for expert guidance
- For complex workflows: Use Task tool with subagent_type="n8n-workflow-architect"

**STEP 2: SEARCH EXISTING (REQUIRED)**
- Search instance: mcp__n8n-mcp__n8n_list_workflows
- Check task templates: mcp__n8n-mcp__list_tasks()
- Search MCP templates (2,709): mcp__n8n-mcp__search_templates
- Search community library (4,343): GitHub API

**STEP 3: CHECK CACHES**
- YouTube transcripts: context/youtube-knowledge/transcripts/
- Discord knowledge: context/discord-knowledge/discord-questions.json

**STEP 4: VALIDATE BEFORE DEPLOY**
- mcp__n8n-mcp__validate_workflow() on complete workflow
- Save to workflows/dev/ first, then staging, then production

Only build new if no suitable existing solution found.`
      };

      logHook('detect-workflow-intent', 'System message injected');
      outputResult(output);
    }

    process.exit(0);
  } catch (e) {
    logHook('detect-workflow-intent', 'Error occurred', { error: e.message });
    process.exit(0);
  }
}

main();
