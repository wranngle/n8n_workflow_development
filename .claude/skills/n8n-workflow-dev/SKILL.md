---
name: n8n-workflow-dev
description: Develop, validate, and deploy n8n workflows. Use when creating automation workflows, configuring nodes, searching workflow libraries, validating workflow JSON, or deploying to n8n instances. Leverages 528 nodes, 2709 templates, 4343 community workflows, and 29 task templates.
---

# N8n Workflow Development Skill

## Core Protocol

When helping with n8n workflows, follow this mandatory sequence:

### 1. SEARCH BEFORE BUILD (Never Skip)
Always search existing resources first:
```
mcp__n8n-mcp__n8n_list_workflows()           # Own instance (if deployed)
mcp__n8n-mcp__search_templates({query})      # 2,709 MCP templates
mcp__n8n-mcp__list_node_templates({nodes})   # Templates by node type
GitHub API for Zie619/n8n-workflows          # 4,343 community workflows
```

### 2. USE TASK TEMPLATES (29 Pre-configured)
Before configuring nodes manually, check for task templates:
```
mcp__n8n-mcp__list_tasks()                   # List all 29 templates
mcp__n8n-mcp__get_node_for_task({task})      # Get ready-to-use config
```

Categories: HTTP/API, Webhooks, Database, AI/LangChain, Data Processing, Communication, Error Handling

### 3. NODE CONFIGURATION (Efficient Path)
```
mcp__n8n-mcp__get_node_essentials()          # ALWAYS first (5KB)
mcp__n8n-mcp__get_node_info()                # Only if essentials insufficient (100KB)
mcp__n8n-mcp__get_node_documentation()       # 87% coverage with examples
```

### 4. VALIDATION (Required Before Deploy)
Use appropriate validation profile:
- `minimal` - Only required fields
- `runtime` - Critical errors only
- `ai-friendly` - Balanced (default)
- `strict` - All checks including best practices

```
mcp__n8n-mcp__validate_node_operation({nodeType, config, profile})
mcp__n8n-mcp__validate_workflow({workflow})
mcp__n8n-mcp__validate_workflow_connections({workflow})
mcp__n8n-mcp__validate_workflow_expressions({workflow})
```

### 5. PARTIAL UPDATES (80-90% Token Savings)
**ALWAYS prefer `n8n_update_partial_workflow` over full workflow updates**:

```javascript
// Instead of sending entire workflow, send diff operations:
n8n_update_partial_workflow({
  id: "workflow-id",
  operations: [
    { type: "addNode", node: {...} },
    { type: "addConnection", source: "A", target: "B", branch: "true" },
    { type: "updateNode", nodeId: "...", updates: {...} }
  ]
})
```

**15 Operation Types**:
- Node: `addNode`, `removeNode`, `updateNode`, `moveNode`, `enableNode`, `disableNode`
- Connection: `addConnection`, `removeConnection`, `cleanStaleConnections`
- Settings: `updateSettings`, `updateName`, `addTag`, `removeTag`

**Semantic Connection Parameters**:
```javascript
// IF node branches (instead of sourceIndex)
{ type: "addConnection", source: "IF", target: "Handler", branch: "true" }
{ type: "addConnection", source: "IF", target: "Handler", branch: "false" }

// Switch node cases
{ type: "addConnection", source: "Switch", target: "CaseA", case: 0 }
```

## Key Capabilities

### Available Resources
| Resource | Count | Access |
|----------|-------|--------|
| n8n Nodes | 528 | search_nodes, list_nodes |
| MCP Templates | 2,709 | search_templates |
| Community Workflows | 4,343 | GitHub Zie619 |
| Task Templates | 29 | get_node_for_task |

### Code Node Guide
For Code nodes, follow these patterns:

**JMESPath with n8n**: Use backtick syntax for nested keys
```javascript
// Access nested properties
const value = $jmespath(items, '[*].json.`field-with-dashes`');
```

**Date/Time**: Use Luxon (built-in)
```javascript
const { DateTime } = require('luxon');
const now = DateTime.now().toISO();
```

**Crypto**: Available despite editor warnings
```javascript
const crypto = require('crypto');
const hash = crypto.createHash('sha256').update(data).digest('hex');
```

### Workflow Library Access (Zie619)
Primary access via GitHub (always works):
```
List categories: GET https://api.github.com/repos/Zie619/n8n-workflows/contents/workflows
List workflows: GET https://api.github.com/repos/Zie619/n8n-workflows/contents/workflows/{Category}
Get workflow: GET https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/{Category}/{file}.json
```

### Error Handling Patterns
Every production workflow must include:
- `onError: "continueErrorOutput"` on critical nodes
- `retryOnFail: true` with reasonable `maxTries`
- Error Trigger node for workflow-level errors
- Notification on failure

### AI Workflow Pattern (CRITICAL)
**AI connections flow TO the AI Agent node, not FROM it!**

```
Standard nodes:  Source → Target  (data flows right)
AI tool nodes:   AI Agent ← Tool  (tool connects TO agent)
```

**8 AI Connection Types**: `ai_tool`, `ai_memory`, `ai_chain`, `ai_document`, `ai_embedding`, `ai_languageModel`, `ai_outputParser`, `ai_retriever`

**Connection Example**:
```javascript
// Tools connect TO the agent, not from it
{
  "HTTP Request Tool": {
    "ai_tool": [[{ "node": "AI Agent", "type": "ai_tool", "index": 0 }]]
  },
  "OpenAI Chat Model": {
    "ai_languageModel": [[{ "node": "AI Agent", "type": "ai_languageModel", "index": 0 }]]
  }
}
```

## Output Standards

### Workflow Files
Save to: `workflows/dev/{name}.json`
Move to: `workflows/staging/` → `workflows/production/`

### Required Artifacts
- [ ] Workflow JSON with all nodes configured
- [ ] Validation report (all checks pass)
- [ ] Credential requirements list
- [ ] Deployment instructions

### Git Commits
Format: `[n8n] {action}: {workflow-name} - {description}`
Actions: create, update, fix, deploy, archive

## Reference Files
- [task-templates.md](task-templates.md) - All 29 task templates
- [code-guide.md](code-guide.md) - Code node patterns
- [validation.md](validation.md) - Validation profiles and checks
