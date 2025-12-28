# n8n Methodology MCP Server

> Exposes the n8n workflow development methodology as MCP tools for cross-project invocation.

## Overview

This MCP server makes the entire n8n workflow development methodology available to Claude from ANY project. It provides tools for:

- **Methodology Access**: Get the full CLAUDE.md or specific sections
- **Skill Retrieval**: Load specialized skill prompts (9 skills available)
- **Knowledge Search**: Search 10,279 YouTube videos and 2,930 Discord Q&A
- **Pattern Library**: 5 proven workflow patterns with best practices
- **Quick Reference**: Common gotchas, expression syntax, and tips

## Installation

### Option 1: Add to Claude Config (Recommended)

Add to `~/.claude.json`:

```json
{
  "mcpServers": {
    "n8n-methodology": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/n8n-methodology-mcp/dist/index.js"],
      "env": {
        "N8N_METHODOLOGY_ROOT": "/path/to/n8n_workflow_development"
      }
    }
  }
}
```

### Option 2: Use with Agent SDK

```typescript
import { Agent } from "@anthropic-ai/agent-sdk";

const agent = new Agent({
  model: "claude-sonnet-4",
  mcpServers: {
    "n8n-methodology": {
      transport: "stdio",
      command: "node",
      args: ["/path/to/dist/index.js"],
      env: { N8N_METHODOLOGY_ROOT: "/path/to/project" }
    }
  }
});
```

## Available Tools

### `get_methodology`
Returns the complete CLAUDE.md or a specific section.

```
get_methodology()                    # Full methodology
get_methodology("CRITICAL KNOWLEDGE") # Specific section
```

### `get_skill`
Returns a skill prompt for Claude to use.

```
get_skill("n8n-workflow-dev")        # Master 21-step protocol
get_skill("n8n-validation-expert")   # Validation guidance
```

### `list_skills`
Lists all 9 available skills with descriptions.

### `search_knowledge`
Searches across YouTube tutorials and Discord Q&A.

```
search_knowledge("webhook authentication")
search_knowledge("AI agent memory", ["youtube"], 5)
```

### `get_workflow_pattern`
Returns a workflow pattern with examples and best practices.

```
get_workflow_pattern("webhook-processing")
get_workflow_pattern("ai-agent-workflow")
```

### `list_patterns`
Lists all 5 available patterns.

### `get_quick_reference`
Quick reference for common operations.

```
get_quick_reference()                # All topics
get_quick_reference("node-types")    # Specific topic
get_quick_reference("expressions")
```

## Skills Available

| Skill | Purpose |
|-------|---------|
| `n8n-workflow-dev` | Master 21-step protocol |
| `n8n-workflow-patterns` | 5 core patterns |
| `n8n-validation-expert` | Error interpretation |
| `n8n-mcp-tools-expert` | MCP tool usage |
| `n8n-expression-syntax` | Expression writing |
| `n8n-node-configuration` | Node config |
| `n8n-code-javascript` | JS code patterns |
| `n8n-code-python` | Python code patterns |
| `n8n-pipeline-middleware` | Pipeline integration |

## Patterns Available

| Pattern | Description |
|---------|-------------|
| `webhook-processing` | Receive and process webhooks |
| `http-api-integration` | API calls with auth/pagination |
| `database-operations` | CRUD with transactions |
| `ai-agent-workflow` | AI agents with tools/memory |
| `scheduled-tasks` | Cron-based automation |

## Quick Reference Topics

- `node-types` - Format differences (nodes-base vs n8n-nodes-base)
- `expressions` - Common expression patterns
- `webhook-data` - Accessing webhook body/headers/query
- `ai-connections` - Tool → Agent reverse connection
- `partial-updates` - 80-90% token savings with diff updates
- `validation-profiles` - minimal/runtime/ai-friendly/strict

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run in development
npm run dev
```

## Version

v1.1.0 - Production-ready with actual knowledge base integration.

## License

MIT
