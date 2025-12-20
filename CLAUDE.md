# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# n8n Workflow Development Command Center

## HOOK-DRIVEN ARCHITECTURE (v2.0)

This repository uses a **hook-driven deterministic architecture** to ensure consistent, high-quality workflow development.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           UNIFIED PROTOCOL FLOW                              │
│                                                                              │
│  USER PROMPT                                                                 │
│       │                                                                      │
│       ▼                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ HOOK: detect-workflow-intent.js                                      │    │
│  │ Detects: workflow, n8n, automation, webhook, trigger...             │    │
│  │ OUTPUT: MANDATORY instruction to invoke Skill("n8n-workflow-dev")   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│       │                                                                      │
│       ▼                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ SKILL: n8n-workflow-dev (MASTER ORCHESTRATOR)                        │    │
│  │ Contains the complete 21-step protocol in 6 phases:                  │    │
│  │                                                                      │    │
│  │ PHASE 1: CALIBRATE (Steps 0-7)   - Search all knowledge bases       │    │
│  │ PHASE 2: DESIGN (Steps 8-10)     - Pattern + template analysis      │    │
│  │ PHASE 3: BUILD (Steps 11-14)     - Node config + JSON assembly      │    │
│  │ PHASE 4: VALIDATE (Steps 15-16)  - Iterative validation loop        │    │
│  │ PHASE 5: TEST (Steps 17-18)      - Dev deployment + testing         │    │
│  │ PHASE 6: DEPLOY (Steps 19-21)    - Stage → Production → Git         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│       │                                                                      │
│       ├──────────────────────────────────────────────────────────────┐      │
│       ▼                                                              ▼      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ n8n-workflow │  │ n8n-node-    │  │ n8n-express- │  │ n8n-validat- │    │
│  │ -patterns    │  │ configuration│  │ ion-syntax   │  │ ion-expert   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│       │                                                                      │
│       ▼                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ HOOKS: Pre/Post Tool Use                                             │    │
│  │ - pre-deploy-check.js  → Validates before n8n_create_workflow       │    │
│  │ - post-deploy-log.js   → Logs after deployment                      │    │
│  │ - workflow-file-guard.js → Protects workflow files                  │    │
│  │ - auto-git-stage.js    → Auto-stages changes                        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Why Hooks Are Foundational

**Without hooks**: Claude may ignore complex instructions in CLAUDE.md and build workflows ad-hoc.
**With hooks**: Claude receives mandatory systemMessage EVERY time a workflow request is detected.

The `detect-workflow-intent` hook:
1. Detects workflow-related keywords (workflow, n8n, automation, webhook, trigger...)
2. Outputs a MANDATORY instruction to invoke `Skill("n8n-workflow-dev")`
3. Fires once per session to avoid repetition

### The Master Skill

**Location**: `.claude/skills/n8n-workflow-dev/SKILL.md`

This skill is the **SINGLE SOURCE OF TRUTH** for all n8n workflow development. It contains:
- The complete 21-step protocol
- Skill invocation map (when to call which sub-skill)
- Knowledge base references
- Output format templates

**ALWAYS invoke this skill for workflow requests. DO NOT bypass it.**

---

## Philosophy: The Mechanic's Garage

Think of this folder as a master mechanic's garage with decades of specialized tools. Every tool has its place, every workflow request has a protocol.

**Core Principle**: Never reinvent the wheel. Before writing a single node, search for existing solutions across:
1. Our own n8n instance (existing workflows)
2. YouTube tutorial knowledge base (10,279+ indexed videos)
3. Discord community discussions (2,930+ Q&A indexed)
4. Reddit community insights (r/n8n and related)
5. The Zie619 community library (4,343 workflows)
6. n8n-MCP template database (2,709 templates)

---

## TOOL REGISTRY: The Garage Inventory

### Tier 1: n8n-MCP Server (Primary Workbench)
Your main toolbelt for n8n operations. **39 tools**, 528 nodes indexed, 87% documentation coverage.

#### Node Discovery & Configuration
| Tool | Purpose | When to Use |
|------|---------|-------------|
| `search_nodes` | Find nodes by keyword | Starting any workflow |
| `list_nodes` | List all nodes (filters available) | Exploring capabilities |
| `get_node_essentials` | Key properties (<5KB) | **ALWAYS use first** |
| `get_node_info` | Full schema (100KB+) | Only if essentials insufficient |
| `get_node_documentation` | Readable docs with examples | 87% coverage |

#### Task Templates (29 Pre-configured)
| Tool | Purpose |
|------|---------|
| `list_tasks` | List all 29 task templates by category |
| `get_node_for_task` | Get ready-to-use node configuration |

**Categories**: HTTP/API, Webhooks, Database, AI/LangChain, Data Processing, Communication, Error Handling

#### Validation (4 Profiles Available)
| Tool | Purpose |
|------|---------|
| `validate_node_operation` | Validate single node config |
| `validate_node_minimal` | Quick required-fields check |
| `validate_workflow` | Full workflow validation |
| `validate_workflow_connections` | Check node connections |
| `validate_workflow_expressions` | Validate n8n expressions |

**Profiles**: `minimal` (required only), `runtime` (critical errors), `ai-friendly` (default), `strict` (all checks)

#### Templates & Discovery
| Tool | Purpose |
|------|---------|
| `search_templates` | Search 2,709 templates |
| `list_node_templates` | Templates using specific nodes |
| `get_template` | Get full workflow JSON |

#### Workflow Management
| Tool | Purpose |
|------|---------|
| `n8n_list_workflows` | List existing workflows |
| `n8n_get_workflow` | Get workflow by ID |
| `n8n_create_workflow` | Deploy new workflow |
| `n8n_update_partial_workflow` | Incremental diff updates (80-90% token savings) |
| `n8n_validate_workflow` | Validate by ID |
| `n8n_trigger_webhook_workflow` | Trigger via webhook |

### Tier 2: Knowledge Bases

| Source | Location | Contents |
|--------|----------|----------|
| YouTube | `context/youtube-knowledge/` | 10,279 indexed tutorials |
| Discord | `context/discord-knowledge/` | 2,930 Q&A from community |
| Reddit | `mcp__reddit` tools | r/n8n, r/selfhosted |
| Community | GitHub Zie619/n8n-workflows | 4,343 community workflows |
| Patterns | `context/workflow-patterns/` | Reusable analysis files |

### Tier 3: Documentation Waterfall
For ANY new integration/API, follow this waterfall:
```
1. MCP Server for that service (if exists)
   ↓ not found
2. Context7: mcp__context7__resolve-library-id → get-library-docs
   ↓ not found
3. Ref: mcp__ref-tools__ref_search_documentation
   ↓ not found
4. Exa: mcp__exa__web_search_exa or deep_researcher_start
   ↓ not found
5. WebSearch or WebFetch on official docs
```

---

## REPOSITORY ARCHITECTURE

```
n8n_workflow_development/
├── .claude/
│   ├── hooks/              # Hook scripts (deterministic enforcement)
│   │   ├── detect-workflow-intent.js  # CRITICAL: Forces skill invocation
│   │   ├── session-init.js            # Session initialization
│   │   ├── pre-deploy-check.js        # Pre-deployment validation
│   │   ├── post-deploy-log.js         # Deployment logging
│   │   ├── workflow-file-guard.js     # File protection
│   │   ├── auto-git-stage.js          # Auto git staging
│   │   └── hook-utils.js              # Shared utilities
│   ├── skills/             # 8 specialized skills (modular protocol)
│   │   ├── n8n-workflow-dev/          # MASTER ORCHESTRATOR (21 steps)
│   │   ├── n8n-workflow-patterns/     # 5 core patterns
│   │   ├── n8n-validation-expert/     # Validation guidance
│   │   ├── n8n-mcp-tools-expert/      # MCP tool usage
│   │   ├── n8n-expression-syntax/     # Expression writing
│   │   ├── n8n-node-configuration/    # Node config
│   │   ├── n8n-code-javascript/       # JS code patterns
│   │   └── n8n-code-python/           # Python code patterns
│   ├── commands/           # Slash commands (shortcuts)
│   │   ├── quick-node.md              # Fast node lookup
│   │   ├── lookup-api.md              # API documentation search
│   │   ├── screenshot-to-workflow.md  # Visual conversion
│   │   └── analyze-workflow.md        # Workflow analysis
│   ├── agents/             # Specialized agents
│   │   └── n8n-workflow-architect.md  # Invokes master skill
│   ├── logs/               # Hook execution logs
│   └── settings.json       # Hook configuration
├── context/
│   ├── youtube-knowledge/  # 10,279 indexed videos
│   ├── discord-knowledge/  # 2,930 Q&A indexed
│   ├── reddit-knowledge/   # Reddit protocol
│   ├── api-docs/           # Cached API documentation
│   └── workflow-patterns/  # Reusable patterns
├── workflows/
│   ├── dev/                # Development workflows
│   ├── staging/            # Pre-production
│   └── production/         # Production-ready exports
├── tools/
│   └── search/             # Search utilities
├── scripts/                # Utility scripts
├── config/                 # Configuration files
├── CLAUDE.md               # This file (architecture reference)
└── package.json            # Dependencies
```

---

## SKILL SYSTEM

### 8 Installed Skills (Auto-Activating)

| Skill | Triggers When | Purpose |
|-------|---------------|---------|
| **n8n-workflow-dev** | Building workflows | Master 21-step protocol |
| **n8n-workflow-patterns** | Designing workflows | 5 proven patterns |
| **n8n-validation-expert** | Debugging errors | Error interpretation, profiles |
| **n8n-mcp-tools-expert** | Using n8n-mcp tools | Tool selection, nodeType formatting |
| **n8n-expression-syntax** | Writing expressions | Fix errors, $json/$node access |
| **n8n-node-configuration** | Configuring nodes | Operation-aware config |
| **n8n-code-javascript** | Writing Code nodes | Data access, return formats |
| **n8n-code-python** | Python Code nodes | Standard library only |

### Skill Invocation Map

The master skill (`n8n-workflow-dev`) invokes sub-skills at specific steps:

| Step | Condition | Skill Invoked |
|------|-----------|---------------|
| 8 | Always | `n8n-workflow-patterns` |
| 11 | Always | `n8n-node-configuration` |
| 11 | Using MCP tools | `n8n-mcp-tools-expert` |
| 12 | Has expressions | `n8n-expression-syntax` |
| 13 | Has Code nodes | `n8n-code-javascript` |
| 15 | Always | `n8n-validation-expert` |

---

## CRITICAL KNOWLEDGE

### Node Type Formats
- **Search/Validation tools**: `nodes-base.slack`
- **Workflow JSON**: `n8n-nodes-base.slack`
- **AI nodes**: `@n8n/n8n-nodes-langchain.agent`

### Webhook Data Access
```javascript
// WRONG - will be undefined
$json.name

// CORRECT - webhook data is nested in body
$json.body.name
```

### AI Connection Pattern (REVERSE!)
```
Standard nodes:  Source → Target  (data flows right)
AI tool nodes:   AI Agent ← Tool  (tool connects TO agent)
```

### Partial Updates (80-90% Token Savings)
**ALWAYS prefer `n8n_update_partial_workflow` over full updates**:
```javascript
n8n_update_partial_workflow({
  id: "workflow-id",
  operations: [
    { type: "addNode", node: {...} },
    { type: "addConnection", source: "A", target: "B", branch: "true" }
  ]
})
```

---

## INSTANCE CONFIGURATION

```yaml
n8n_instance:
  url: [CONFIGURE IN ENV]
  api_key: [CONFIGURE IN ENV]

mcp_servers:
  # CONNECTED
  n8n-mcp: ✅ (528 nodes, 2709 templates)
  exa: ✅ (web search, deep research)
  context7: ✅ (real-time docs)
  ref-tools: ✅ (doc search)
  playwright: ✅ (web automation)
  memory: ✅ (knowledge graph)
  desktop-commander: ✅ (file ops)

  # NOT CONNECTED (use fallbacks)
  youtube: ❌ - use local index + Exa crawl
  discord: ❌ - use local database only
  reddit: ❌ - use Exa site:reddit.com search

knowledge_bases:
  youtube: 10,279 videos indexed
  discord: 2,930 Q&A indexed
  community: 4,343 workflows
  templates: 2,709 official templates
```

---

## KNOWN LIMITATIONS

### External Service Access
| Service | Limitation | Workaround |
|---------|-----------|------------|
| n8n.io Template Pages | WebFetch returns CSS, no JSON | Use MCP `get_template` |
| Medium Articles | HTTP 403 (bot blocking) | Use community forum |
| YouTube Transcripts | MCP not connected | Use Exa crawling |

### API Requirements
| Feature | Requirement |
|---------|-------------|
| n8n Instance Access | N8N_API_KEY required |
| Discord Live Search | DISCORD_TOKEN required |
| YouTube Transcripts | Pre-cached available offline |

---

## HOOK DEBUGGING

If hooks don't fire, check `.claude/logs/hooks.log` for execution traces.

**Common Issues**:
1. **Session Continuation**: SessionStart hook only fires on fresh sessions
2. **Working Directory**: Hooks use relative paths, run from project root
3. **Permissions**: Check `.claude/settings.json` permissions block

---

## QUICK REFERENCE

### Most Used MCP Tools
```javascript
mcp__n8n-mcp__search_nodes({query: "keyword"})
mcp__n8n-mcp__get_node_essentials({nodeType: "nodes-base.httpRequest"})
mcp__n8n-mcp__validate_workflow({workflow: {...}})
mcp__n8n-mcp__n8n_create_workflow({name: "...", nodes: [...], connections: {...}})
```

### Git Commit Format
```
[n8n] {action}: {workflow-name} - {description}
```
Actions: `create`, `update`, `fix`, `deploy`, `stage`, `archive`

### File Locations
- Development: `workflows/dev/`
- Staging: `workflows/staging/`
- Production: `workflows/production/`

---

*Last Updated: 2025-12-17*
*Architecture Version: 2.0 - Hook-Driven Unified Protocol*
