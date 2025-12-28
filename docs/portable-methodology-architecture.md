# Portable Methodology Architecture

> **Goal**: Make this project's n8n research/development methodology invokable from ANY project

## Architecture Decision

Based on research, the optimal approach is a **3-tier hybrid**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PORTABLE METHODOLOGY STACK                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  TIER 1: MCP SERVER (Core Engine)                                       │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ n8n-methodology-mcp                                                │  │
│  │ ├── Tools: search_patterns, search_knowledge, validate_workflow   │  │
│  │ ├── Data: Indexed YouTube, Discord, Reddit, Templates             │  │
│  │ └── Mode: stdio (local) OR http (remote)                          │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                              ↑                                           │
│  TIER 2: CLAUDE PLUGIN (Distribution)                                   │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ claude-n8n-plugin                                                  │  │
│  │ ├── Bundles MCP server                                            │  │
│  │ ├── Includes Skills (8 specialized)                               │  │
│  │ ├── Includes Agents (workflow-architect)                          │  │
│  │ └── Includes Hooks (detect-workflow-intent)                       │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                              ↑                                           │
│  TIER 3: ENTRY POINTS (Invocation)                                      │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ • Claude Code: Plugin auto-loads in any project                   │  │
│  │ • Agent SDK: Programmatic invocation from scripts                 │  │
│  │ • n8n Workflow: HTTP webhook → methodology MCP → response         │  │
│  │ • CLI: claude -p "..." with methodology context                   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## MCP Server Design

### Tools Exposed

| Tool | Purpose | Data Source |
|------|---------|-------------|
| `search_patterns` | Find workflow patterns | context/workflow-patterns/ |
| `get_pattern` | Get specific pattern details | Indexed YAML/JSON |
| `search_knowledge` | Search across all knowledge bases | YouTube, Discord, Reddit |
| `get_tutorial` | Get YouTube tutorial transcript | context/youtube-knowledge/ |
| `get_discord_answer` | Get Discord Q&A | context/discord-knowledge/ |
| `validate_workflow` | Validate using our profiles | Validation engine |
| `get_node_template` | Get pre-configured node | Task templates |
| `invoke_skill` | Return skill prompt for Claude | .claude/skills/ |
| `get_methodology` | Return full CLAUDE.md | Project root |

### Directory Structure

```
n8n-methodology-mcp/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                    # MCP server entry
│   ├── tools/
│   │   ├── patterns.ts             # Pattern search/retrieval
│   │   ├── knowledge.ts            # Knowledge base search
│   │   ├── validation.ts           # Workflow validation
│   │   ├── templates.ts            # Node templates
│   │   └── skills.ts               # Skill prompt retrieval
│   ├── data/
│   │   ├── loader.ts               # Data loading utilities
│   │   └── indexer.ts              # Search indexing
│   └── utils/
│       └── search.ts               # Fuzzy search helpers
├── data/                           # Symlink or copy from project
│   ├── patterns/
│   ├── youtube-index.json
│   ├── discord-index.json
│   └── skills/
└── README.md
```

## Plugin Structure

```
claude-n8n-plugin/
├── plugin.json                      # Plugin manifest
├── README.md                        # Installation guide
├── mcpServers/
│   └── n8n-methodology/             # Bundled MCP
├── agents/
│   └── n8n-workflow-architect.md    # Main orchestrator agent
├── skills/
│   ├── n8n-workflow-dev.md          # Master 21-step protocol
│   ├── n8n-workflow-patterns.md
│   ├── n8n-validation-expert.md
│   ├── n8n-mcp-tools-expert.md
│   ├── n8n-expression-syntax.md
│   ├── n8n-node-configuration.md
│   ├── n8n-code-javascript.md
│   └── n8n-code-python.md
├── hooks/
│   ├── hooks.json                   # Hook definitions
│   └── detect-workflow-intent.js    # Intent detection
└── commands/
    ├── quick-node.md
    ├── lookup-api.md
    └── analyze-workflow.md
```

## Entry Points

### 1. From Another Claude Code Project

```bash
# Install plugin once
/plugin install claude-n8n-plugin

# Now available everywhere:
# - Skills auto-activate on n8n keywords
# - MCP tools accessible: mcp__n8n-methodology__*
# - Agents available via Task tool
```

### 2. From Agent SDK (Python/TypeScript)

```typescript
import { Agent } from "@anthropic-ai/agent-sdk";

const agent = new Agent({
  model: "claude-sonnet-4",
  mcpServers: {
    "n8n-methodology": {
      transport: "stdio",
      command: "npx",
      args: ["n8n-methodology-mcp"]
    }
  }
});

const result = await agent.run({
  prompt: "Build an n8n workflow that syncs Pipedrive with RingCentral"
});
```

### 3. From n8n Workflow (HTTP)

```
┌──────────────┐    ┌─────────────────────┐    ┌──────────────────┐
│   Webhook    │───▶│  n8n-methodology    │───▶│  Return Result   │
│   Trigger    │    │  MCP (HTTP mode)    │    │                  │
└──────────────┘    └─────────────────────┘    └──────────────────┘
```

### 4. From CLI Script

```bash
#!/bin/bash
# invoke-n8n-methodology.sh

claude -p "$1" \
  --mcp n8n-methodology:stdio:npx:n8n-methodology-mcp \
  --output-format json
```

## Implementation Phases

### Phase 1: MCP Server (This Session)
1. Create TypeScript MCP server skeleton
2. Implement core tools (patterns, knowledge, validation)
3. Index existing knowledge bases
4. Test locally with stdio transport

### Phase 2: Plugin Packaging
1. Create plugin.json manifest
2. Bundle MCP server
3. Copy skills/agents/hooks from current project
4. Test installation

### Phase 3: Distribution
1. Publish to npm (for MCP standalone use)
2. Submit plugin to Claude marketplace
3. Create documentation

## Benefits

| Aspect | Before | After |
|--------|--------|-------|
| **Portability** | Manual copy CLAUDE.md | Plugin install, works everywhere |
| **Team Sharing** | Share git repo | Plugin marketplace |
| **Updates** | Manual sync | Plugin version updates |
| **Invocation** | Only in project | Any project, SDK, CLI, n8n |
| **Knowledge Access** | Read files manually | MCP tools with search |

---

*Architecture designed: 2025-12-26*
*Target: Claude Code Plugin + MCP Server*
