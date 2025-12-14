# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# n8n Workflow Development Command Center

This is the **master playbook** for AI-assisted n8n workflow development. Follow these protocols for every workflow request to leverage the full arsenal of tools and ensure production-quality output with minimal developer intervention.

## Philosophy: The Mechanic's Garage

Think of this folder as a master mechanic's garage with decades of specialized tools. Every tool has its place, every workflow request has a protocol. You should be able to reach for the right 4 tools blindfolded and work on any automation challenge.

**Core Principle**: Never reinvent the wheel. Before writing a single node, search for existing solutions across:
1. Our own n8n instance (existing workflows)
2. YouTube tutorial knowledge base (10,279+ indexed videos with transcripts)
3. Discord community discussions (n8n Discord server)
4. Reddit community insights (r/n8n and related subreddits)
5. The Zie619 community library (4,343 workflows)
6. n8n-MCP template database (2,709 templates)
7. Official n8n documentation

---

## MANDATORY PRE-FLIGHT CHECKLIST

For **EVERY** n8n workflow development request, execute this checklist IN ORDER:

### 1. SEARCH EXISTING INSTANCE
```
Tool: mcp__n8n-mcp__n8n_list_workflows
Purpose: Check if we already have a similar workflow
Action: Search by tags, name patterns, trigger types
```

### 2. SEARCH YOUTUBE TUTORIALS
```
File: context/youtube-knowledge/video-index.json
Purpose: Find video tutorials explaining similar workflows
Action: Search tagIndex for relevant keywords, fetch transcripts for implementation details

Tags available: beginner, ai-agents, webhook, course, langchain, slack,
telegram, whatsapp, chatbot, rag, memory, voice, multi-agent, error-handling,
gmail, templates, business, no-code, self-host, workflow-builder

Tools:
- mcp__youtube__transcripts_getTranscript({videoId: "..."}) - Get transcript
- mcp__youtube__videos_getVideo({videoId: "...", parts: ["snippet"]}) - Get description
```

### 3. SEARCH DISCORD COMMUNITY
```
LOCAL DATABASE (RECOMMENDED):
  File: context/discord-knowledge/discord-questions.json
  Stats: 2,930 real Q&A from April-December 2025
  Topics: 15 categories, 5,197 keywords indexed
  Protocol: context/discord-knowledge/PROTOCOL.md (Part 1)

  Top topics: workflows (1,263), error-handling (560), ai-agents (509),
              http-requests (509), conditional (444), scheduling (333)

  Quick search:
  const keywordIndex = require('./context/discord-knowledge/keyword-index.json');
  const webhookQuestions = keywordIndex['webhook']; // Returns question indexes

LIVE MCP SERVER (FALLBACK):
  Server: v-3/discordmcp (requires DISCORD_TOKEN)
  Target: n8n Discord server (discord.gg/n8n)
  Protocol: context/discord-knowledge/PROTOCOL.md (Part 2)

  Tools:
  - read-messages({ channel: "support", limit: 50 }) - Get recent messages
  - Channels: #support, #general, #showcase, #integrations

When to search:
- ALWAYS search local database FIRST (instant, offline)
- Use live MCP only for post-Dec 2025 questions or real-time discussions
- Error messages not in docs
- Community workarounds
- Integration-specific questions
```

### 4. SEARCH REDDIT COMMUNITY
```
MCP Server: adhikasp/mcp-reddit (~307 stars)
Target: r/n8n and related subreddits
Protocol: context/reddit-knowledge/PROTOCOL.md

Tools:
- fetch_reddit_hot_threads({ subreddit: "n8n", limit: 10 })
- fetch_reddit_post_content({ post_id: "...", comment_limit: 20 })

Related subreddits: n8n, selfhosted, homeautomation, nocode

When to search:
- Deployment experiences
- Self-hosting configurations
- Community best practices
- Alternative approaches
```

### 5. SEARCH COMMUNITY LIBRARY
```
Primary: GitHub API (always works)
  https://api.github.com/repos/Zie619/n8n-workflows/contents/workflows/{Category}

Fallback: Render API (may sleep - 503 errors)
  https://n8n-workflows-1-xxgm.onrender.com/api/workflows?q={keywords}

Fetch workflow: GitHub Raw (always works)
  https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/{Category}/{file}.json

Purpose: Find pre-built solutions from 4,343 community workflows
```

### 6. SEARCH MCP TEMPLATES
```
Tool: mcp__n8n-mcp__search_templates
Purpose: Find among 2,709 official n8n templates
Tool: mcp__n8n-mcp__list_node_templates
Purpose: Find templates using specific nodes
```

### 7. DOCUMENT FINDINGS
Before building, document:
- [ ] Similar workflows found (list IDs/names)
- [ ] Reusable patterns identified
- [ ] Nodes required for this workflow
- [ ] APIs/integrations needed
- [ ] Credentials required

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
| `search_node_properties` | Find specific properties | Finding auth, headers, body options |
| `get_property_dependencies` | Check visibility rules | Understanding conditional fields |
| `get_node_as_tool_info` | Use any node as AI tool | AI agent workflows |

#### Task Templates (29 Pre-configured) - **NEW!**
| Tool | Purpose |
|------|---------|
| `list_tasks` | List all 29 task templates by category |
| `get_node_for_task` | Get ready-to-use node configuration |

**Categories**: HTTP/API, Webhooks, Database, AI/LangChain, Data Processing, Communication, Error Handling

**Common Tasks**: `receive_webhook`, `post_json_request`, `send_slack_message`, `ai_agent_workflow`, `modern_error_handling_patterns`

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
| `get_templates_for_task` | Curated templates by task type |

#### Workflow Management (Instance)
| Tool | Purpose |
|------|---------|
| `n8n_list_workflows` | List existing workflows |
| `n8n_get_workflow` | Get workflow by ID |
| `n8n_create_workflow` | Deploy new workflow |
| `n8n_update_full_workflow` | Full workflow update |
| `n8n_update_partial_workflow` | Incremental diff updates |
| `n8n_delete_workflow` | Remove workflow |
| `n8n_validate_workflow` | Validate by ID |

#### Execution & Monitoring
| Tool | Purpose |
|------|---------|
| `n8n_trigger_webhook_workflow` | Trigger via webhook |
| `n8n_list_executions` | View execution history |
| `n8n_get_execution` | Get execution details |
| `n8n_health_check` | Verify API connectivity |
| `n8n_diagnostic` | Debug n8n API config |

#### AI Tools
| Tool | Purpose |
|------|---------|
| `list_ai_tools` | List 263 AI-optimized nodes |
| `get_node_as_tool_info` | Configure any node as AI tool |

### Tier 2: YouTube Knowledge Base (10,279+ Tutorial Videos)

Comprehensive searchable index of n8n tutorial videos from 20 top channels with on-demand transcript fetching.

**Location**: `context/youtube-knowledge/`

| File | Purpose |
|------|---------|
| `video-index.json` | Searchable metadata index with tag-based lookup |
| `transcripts/{videoId}.json` | Cached transcripts for reuse |
| `PROTOCOL.md` | Full search/fetch documentation |

**Search by Tag**:
```javascript
// Read video-index.json, search tagIndex for keywords
// Available tags: beginner, ai-agents, webhook, langchain, slack, telegram,
// whatsapp, chatbot, rag, memory, voice, multi-agent, error-handling, gmail, etc.
```

**Fetch Transcript**:
```javascript
mcp__youtube__transcripts_getTranscript({videoId: "VIDEO_ID"})
// Returns: {videoId, language, transcript: [{text, offset, duration}...]}

// Fallback if transcript empty - get video description:
mcp__youtube__videos_getVideo({videoId: "VIDEO_ID", parts: ["snippet"]})
```

**Top Videos by Topic**:
| Topic | Video ID | Title |
|-------|----------|-------|
| Beginner | `GIZzRGYpCbM` | freeCodeCamp 6-hour course |
| AI Agents | `ZHH3sr234zY` | Nate Herk masterclass |
| Webhooks | `lK3veuZAg0c` | Nick Saraev beginner to pro |
| LangChain | `4o0AJYBEiBo` | LangChain Code Node |
| Error Handling | `Zy4cVtHJNvc` | 5 production techniques |

### Tier 2b: Discord Knowledge Base (n8n Community)

Real-time access to n8n Discord community discussions.

**MCP Server**: `v-3/discordmcp` (160 stars)
**Repository**: https://github.com/v-3/discordmcp
**Target**: n8n Discord (discord.gg/n8n)
**Protocol**: `context/discord-knowledge/PROTOCOL.md`

| Tool | Purpose |
|------|---------|
| `read-messages` | Fetch recent messages from a channel |
| `send-message` | Post message (requires approval) |

**Key Channels**:
- `#support` - Troubleshooting, error help
- `#general` - Announcements, general discussion
- `#showcase` - Workflow demos
- `#integrations` - Third-party integration help

**When to Use**: Error debugging, community workarounds, real-time help

### Tier 2c: Reddit Knowledge Base (r/n8n Community)

Access to r/n8n and related automation subreddits.

**MCP Server**: `adhikasp/mcp-reddit` (~307 stars - highest)
**Repository**: https://github.com/adhikasp/mcp-reddit
**Protocol**: `context/reddit-knowledge/PROTOCOL.md`

| Tool | Purpose |
|------|---------|
| `fetch_reddit_hot_threads` | Get trending posts from subreddit |
| `fetch_reddit_post_content` | Get full post with comments |

**Target Subreddits**:
- `n8n` - Official community
- `selfhosted` - Deployment tips
- `homeautomation` - Automation use cases

**When to Use**: Deployment experiences, self-hosting configs, community opinions

### Tier 3: Workflow Library (Community Wisdom - 4,343 workflows)

**Primary Access (Always Works):**
| Method | URL Pattern |
|--------|-------------|
| List categories | `https://api.github.com/repos/Zie619/n8n-workflows/contents/workflows` |
| List workflows | `https://api.github.com/repos/Zie619/n8n-workflows/contents/workflows/{Category}` |
| Get workflow | `https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/{Category}/{file}.json` |

**Search API (May Sleep - Render.com Free Tier):**
```
Base: https://n8n-workflows-1-xxgm.onrender.com
```
| Endpoint | Purpose |
|----------|---------|
| `/api/workflows?q={query}` | Search workflows |
| `/api/categories` | List categories |
| `/health` | Check if awake |

⚠️ 503 = sleeping. Use GitHub methods instead.

### Tier 4: Documentation Lookup (Waterfall)
For ANY new integration/API, follow this waterfall:

```
1. MCP Server for that service (if exists)
   ↓ not found
2. Context7 for library docs
   Tool: mcp__context7__resolve-library-id → mcp__context7__get-library-docs
   ↓ not found  
3. Ref documentation search
   Tool: mcp__ref-tools__ref_search_documentation
   ↓ not found
4. Exa deep research
   Tool: mcp__exa__web_search_exa or mcp__exa__deep_researcher_start
   ↓ not found
5. General web search
   Tool: WebSearch or WebFetch on official docs
```

### Tier 5: Validation & Quality Gates
```
Pre-deployment checklist:
□ validate_node_operation - Each node validated
□ validate_workflow - Full workflow validated  
□ validate_workflow_connections - No broken links
□ validate_workflow_expressions - All expressions valid
□ Test in dev environment first
□ Backup existing workflow if updating
```

---

## REPOSITORY ARCHITECTURE

### High-Level Structure

This repository is organized as a **knowledge-first workflow development toolkit**. The architecture follows three tiers:

1. **Knowledge Layer** (`context/`) - Pre-indexed searchable knowledge bases
2. **Tooling Layer** (`.claude/`, `scripts/`, `tools/`) - Development utilities and automation
3. **Workflow Layer** (`workflows/`) - Actual n8n workflow artifacts in dev/staging/production

### Directory Structure

```
n8n/
├── .claude/
│   ├── commands/           # Slash commands for common operations
│   │   ├── new-workflow.md    # /new-workflow
│   │   ├── search-library.md  # /search-library
│   │   ├── validate.md        # /validate
│   │   ├── deploy.md          # /deploy
│   │   ├── preflight.md       # /preflight - Pre-flight checklist
│   │   ├── quick-node.md      # /quick-node - Fast node lookup
│   │   ├── lookup-api.md      # /lookup-api - API doc search
│   │   └── screenshot-to-workflow.md  # /screenshot-to-workflow
│   ├── skills/             # 8 specialized n8n skills (auto-activate)
│   │   ├── n8n-workflow-dev/
│   │   ├── n8n-expression-syntax/
│   │   ├── n8n-mcp-tools-expert/
│   │   ├── n8n-workflow-patterns/
│   │   ├── n8n-validation-expert/
│   │   ├── n8n-node-configuration/
│   │   ├── n8n-code-javascript/
│   │   └── n8n-code-python/
│   └── agents/             # Specialized agent definitions
│       └── n8n-workflow-architect.md  # Main workflow architect agent
├── context/
│   ├── api-docs/           # Cached API documentation
│   ├── workflow-patterns/  # Reusable workflow patterns
│   ├── youtube-knowledge/  # YouTube tutorial knowledge base
│   │   ├── video-index.json    # Searchable video metadata (10,279 videos)
│   │   ├── transcripts/        # Cached transcript files
│   │   └── PROTOCOL.md         # Search/fetch documentation
│   ├── discord-knowledge/  # Discord community knowledge
│   │   └── PROTOCOL.md         # Discord MCP integration guide
│   └── reddit-knowledge/   # Reddit community knowledge
│       └── PROTOCOL.md         # Reddit MCP integration guide
├── tools/
│   └── search/             # Search utilities and wrappers
│       └── workflow-library-api.md  # Community library API docs
├── workflows/
│   ├── dev/                # Development/testing workflows
│   │   └── example-webhook-to-slack.json  # Example workflow
│   ├── staging/            # Pre-production validation
│   └── production/         # Production-ready exports
├── scripts/
│   ├── youtube-indexer.js  # Systematic video indexing script
│   └── git-workflow.md     # Git workflow documentation
├── config/
│   └── mcp-servers.json    # MCP server registry
├── CLAUDE.md               # This file (master playbook)
├── RUNBOOK.md              # Operational procedures
├── INVENTORY.md            # Asset inventory
├── CONTRIBUTING.md         # Contribution guidelines
├── .env.example            # Environment variables template
└── package.json            # Node.js dependencies and scripts
```

### Key Files to Understand

| File | Purpose | Read First? |
|------|---------|-------------|
| `CLAUDE.md` | Master playbook for all n8n development | ✅ Yes - Start here |
| `RUNBOOK.md` | Step-by-step operational procedures | ⭐ Reference for execution |
| `context/youtube-knowledge/video-index.json` | 10,279 indexed videos | 📚 Search before building |
| `.claude/skills/n8n-workflow-dev/SKILL.md` | Master workflow dev skill | 🎯 Auto-activates |
| `workflows/dev/example-webhook-to-slack.json` | Example workflow structure | 📖 Template reference |
| `.env.example` | Required environment variables | ⚙️ Setup guide |

### Important Conventions

1. **Node Type Prefixes**:
   - Use `nodes-base.{name}` for search/validation tools
   - Use `n8n-nodes-base.{name}` when creating workflows
   - AI nodes: `@n8n/n8n-nodes-langchain.{name}`

2. **Workflow Storage**:
   - Dev workflows → `workflows/dev/` (testing only)
   - Staging → `workflows/staging/` (pre-production)
   - Production → `workflows/production/` (deployed, git-tracked)

3. **Git Commit Format**:
   - `[n8n] {action}: {workflow-name} - {description}`
   - Example: `[n8n] deploy: webhook-to-slack - Production release`

4. **Knowledge Base Priority**:
   - ALWAYS search existing instance first
   - Then YouTube → Discord → Reddit → Community Library → Templates
   - Document findings before building

---

## WORKFLOW DEVELOPMENT PROTOCOL

### Phase 1: Discovery (5 min)
```markdown
1. Parse user request → identify:
   - Trigger type (webhook, schedule, manual, event)
   - Data sources (APIs, databases, files)
   - Transformations needed
   - Output destinations
   - Error handling requirements

2. Execute Pre-Flight Checklist (above)

3. Document findings in context/workflow-patterns/
```

### Phase 2: Design (10 min)
```markdown
1. Map the workflow flow:
   - Trigger → Process → Output
   - Branch conditions
   - Error paths
   - Retry logic

2. Identify nodes needed:
   Tool: search_nodes for each capability
   Tool: get_node_essentials for each node

3. Check credential requirements:
   - What OAuth/API keys needed?
   - Are they already configured in instance?
```

### Phase 3: Build (variable)
```markdown
1. Start with trigger node
   - Configure and validate

2. Add processing nodes one-by-one
   - Validate each: validate_node_operation
   - Test expressions: validate_workflow_expressions

3. Add error handling
   - Error Trigger node for failures
   - Notification on errors (Slack/Email)

4. Full validation: validate_workflow
```

### Phase 4: Test (mandatory)
```markdown
1. Save to workflows/dev/ as JSON
2. Import to n8n test instance
3. Execute with test data
4. Verify outputs
5. Check error handling paths
```

### Phase 5: Deploy
```markdown
1. Move validated JSON to workflows/staging/
2. Review with stakeholder
3. Deploy via: n8n_create_workflow
4. Activate workflow
5. Archive to workflows/production/
6. Git commit with changelog
```

---

## CRITICAL INSIGHTS (n8n-mcp Repository Wisdom)

### AI Node Connections (REVERSE PATTERN)

**AI connections flow TO the AI Agent node, not FROM it**:
```
Standard nodes:  Source → Target  (data flows right)
AI tool nodes:   AI Agent ← Tool  (tool connects TO agent)
```

8 AI connection types: `ai_tool`, `ai_memory`, `ai_chain`, `ai_document`, `ai_embedding`, `ai_languageModel`, `ai_outputParser`, `ai_retriever`

269 AI-capable nodes with specific validation rules.

### Partial Workflow Updates (80-90% Token Savings)

**ALWAYS prefer `n8n_update_partial_workflow` over full updates**:
```javascript
// Instead of sending entire workflow, send operations:
n8n_update_partial_workflow({
  id: "workflow-id",
  operations: [
    { type: "addNode", node: {...} },
    { type: "addConnection", source: "A", target: "B", branch: "true" },
    { type: "updateNode", nodeId: "...", updates: {...} }
  ]
})
```

15 operation types: `addNode`, `removeNode`, `updateNode`, `moveNode`, `enableNode`, `disableNode`, `addConnection`, `removeConnection`, `updateSettings`, `updateName`, `addTag`, `removeTag`

### Semantic Connection Parameters

**Use `branch` and `case` instead of `sourceIndex`**:
```javascript
// IF node - semantic branch names
{ type: "addConnection", source: "IF", target: "Handler", branch: "true" }
{ type: "addConnection", source: "IF", target: "Handler", branch: "false" }

// Switch node - semantic case numbers
{ type: "addConnection", source: "Switch", target: "HandlerA", case: 0 }
```

### Validation Error Distribution

From 12.6% error rate analysis:
- Structure Errors (35%) - Missing required node properties
- Connection Errors (28%) - Invalid or broken connections
- Required Field Errors (22%) - Missing mandatory parameters
- Expression Errors (10%) - Invalid n8n expression syntax

### Auto-Sanitization (Runs on ALL Updates)

The system automatically fixes operator structures on every workflow update:
- Binary operators (equals, contains) → removes `singleValue`
- Unary operators (isEmpty, isNotEmpty) → adds `singleValue: true`

Cannot auto-fix: broken connections, branch count mismatches, corrupt states.

---

## NODE CONFIGURATION REFERENCE

### Critical: Node-Level Properties
These go at NODE level, NOT inside parameters:

```json
{
  "id": "unique_id",
  "name": "Descriptive Name",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [450, 300],
  "parameters": { },
  "credentials": {
    "httpBasicAuth": { "id": "cred-id", "name": "My Auth" }
  },
  "onError": "continueErrorOutput",
  "retryOnFail": true,
  "maxTries": 3,
  "waitBetweenTries": 1000
}
```

### Common Node Patterns

**HTTP Request with Auth:**
```
get_node_essentials("n8n-nodes-base.httpRequest")
```

**Webhook Trigger:**
```
get_node_essentials("n8n-nodes-base.webhook")
```

**Code Node (Custom Logic):**
```
get_node_essentials("n8n-nodes-base.code")
```

**Database Operations:**
```
get_node_essentials("n8n-nodes-base.postgres")
get_node_essentials("n8n-nodes-base.mysql")
```

---

## API DOCUMENTATION PROTOCOL

When workflow requires a NEW integration (not in n8n nodes):

### Step 1: Check for Existing Node
```
search_nodes({query: "service_name"})
```

### Step 2: If No Node, Check for MCP Server
Common MCP servers for integrations:
- Slack, Discord, GitHub, Linear (check your MCP config)

### Step 3: Fetch API Documentation
```javascript
// Try Context7 first for SDK/library docs
mcp__context7__resolve-library-id({libraryName: "service-sdk"})
mcp__context7__get-library-docs({context7CompatibleLibraryID: "/org/lib"})

// Try Ref for general docs
mcp__ref-tools__ref_search_documentation({query: "service API documentation"})

// Deep research if needed
mcp__exa__deep_researcher_start({
  instructions: "Find complete API documentation for {service}",
  model: "exa-research"
})
```

### Step 4: Cache Documentation
Save fetched docs to: `context/api-docs/{service-name}.md`

---

## SELF-ORCHESTRATION GUIDELINES

Claude Code should autonomously:

### 1. Maintain Context Files
- Update `context/workflow-patterns/` with new patterns discovered
- Cache API docs in `context/api-docs/`
- Log workflow decisions in git commits

### 2. Version Control
- Every workflow change = git commit
- Commit message format: `[n8n] {action}: {workflow-name} - {description}`
- Tag production deployments: `v{workflow-name}-{date}`

### 3. Quality Enforcement
- NEVER deploy without validation
- ALWAYS test in dev first
- REQUIRE stakeholder approval for production

### 4. Tool Discovery
- When encountering new integration, search for MCP server
- Suggest installing relevant MCP servers
- Document new tools in config/mcp-servers.json

---

## ERROR HANDLING STANDARDS

Every production workflow MUST have:

```json
{
  "errorWorkflow": "error-handler-workflow-id",
  "nodes": [
    {
      "type": "n8n-nodes-base.errorTrigger",
      "name": "On Error",
      "position": [100, 500]
    },
    {
      "type": "n8n-nodes-base.slack",
      "name": "Alert Team",
      "parameters": {
        "channel": "#n8n-alerts",
        "text": "Workflow failed: {{ $workflow.name }}"
      }
    }
  ]
}
```

---

## SECURITY CHECKLIST

Before deploying ANY workflow:

- [ ] No hardcoded API keys in workflow JSON
- [ ] Credentials use n8n credential store
- [ ] Webhook URLs are not exposed in logs
- [ ] Sensitive data is not logged
- [ ] Input validation on webhook triggers
- [ ] Rate limiting considered for public webhooks

---

## CLAUDE CODE SKILLS (8 Installed)

Auto-activating skills that provide expert guidance. Skills compose seamlessly - a single request triggers multiple skills.

### Installed Skills

| Skill | Triggers When | Purpose |
|-------|---------------|---------|
| **n8n-workflow-dev** | Building workflows | Master skill with task templates, code guide, validation |
| **n8n-expression-syntax** | Writing expressions, `{{}}` syntax | Fix expression errors, $json/$node access |
| **n8n-mcp-tools-expert** | Using n8n-mcp tools | Tool selection, nodeType formatting, profiles |
| **n8n-workflow-patterns** | Designing workflows | 5 proven patterns: webhook, API, database, AI, scheduled |
| **n8n-validation-expert** | Debugging errors | Error interpretation, false positives, profiles |
| **n8n-node-configuration** | Configuring nodes | Operation-aware config, property dependencies |
| **n8n-code-javascript** | Writing Code nodes | Data access, return formats, patterns |
| **n8n-code-python** | Python Code nodes | Standard library only, use JS for 95% of cases |

### Skill Location
```
.claude/skills/
├── n8n-workflow-dev/           # Custom master skill
├── n8n-expression-syntax/      # From czlonkowski/n8n-skills
├── n8n-mcp-tools-expert/
├── n8n-workflow-patterns/
├── n8n-validation-expert/
├── n8n-node-configuration/
├── n8n-code-javascript/
└── n8n-code-python/
```

### Key Insights from Skills

**Expression Gotcha**: Webhook data is at `$json.body.name`, NOT `$json.name`!

**Tool Format Distinction**:
- Search/validation: `nodes-base.slack`
- Workflow creation: `n8n-nodes-base.slack`

**Code Node Default**: Use JavaScript, "Run Once for All Items", return `[{json: {...}}]`

---

## DEVELOPMENT COMMANDS

### Available npm Scripts

```bash
# Index YouTube knowledge base (re-fetch all videos from 20 channels)
npm run index:youtube

# Run tests (currently placeholder)
npm test
```

### Custom Slash Commands

These are available in `.claude/commands/` and can be invoked with `/command-name`:

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/preflight` | Run pre-flight checklist | Before starting any workflow |
| `/new-workflow` | Start new workflow development | Creating new workflow |
| `/search-library` | Search community workflows | Finding existing solutions |
| `/validate` | Validate workflow | Before deploying |
| `/deploy` | Deploy to n8n instance | Production deployment |
| `/quick-node` | Quick node configuration lookup | Getting node config fast |
| `/lookup-api` | Find API documentation | Integrating new services |
| `/analyze-workflow` | Analyze existing workflow | Understanding workflow |
| `/workflow` | General workflow operations | Common workflow tasks |
| `/screenshot-to-workflow` | Convert screenshot to workflow | Building from visual |

## QUICK REFERENCE: Most Used MCP Tools

```bash
# Search for nodes
mcp__n8n-mcp__search_nodes({query: "keyword"})

# Get node config (ALWAYS use this first)
mcp__n8n-mcp__get_node_essentials({nodeType: "nodes-base.httpRequest"})

# Validate before deploy
mcp__n8n-mcp__validate_workflow({workflow: {...}})

# Search community library
WebFetch: https://zie619.github.io/n8n-workflows/api/workflows?q=keyword

# Deploy workflow
mcp__n8n-mcp__n8n_create_workflow({name: "...", nodes: [...], connections: {...}})
```

---

## INSTANCE CONFIGURATION

```yaml
n8n_instance:
  url: https://your-n8n-instance.com
  api_key: [CONFIGURE IN ENV]
  webhook_base: https://your-n8n-instance.com/webhook/

workflow_library:
  api: https://zie619.github.io/n8n-workflows/api
  github: https://github.com/Zie619/n8n-workflows

mcp_servers:
  n8n-mcp: enabled (528 nodes, 2709 templates)
  youtube: enabled (video search, transcripts)
  discord: pending (v-3/discordmcp - requires DISCORD_TOKEN)
  reddit: enabled (adhikasp/mcp-reddit - no credentials, ~10 req/min)
  context7: enabled (real-time docs)
  exa: enabled (deep research)
  ref-tools: enabled (doc search)
  playwright: enabled (web automation)
  memory: enabled (knowledge graph)

youtube_knowledge:
  video_index: context/youtube-knowledge/video-index.json
  transcripts_cache: context/youtube-knowledge/transcripts/
  total_videos: 10,279
  total_channels: 20
  tags: beginner, ai-agents, webhook, langchain, slack, telegram, whatsapp, rag, memory, voice, multi-agent, error-handling, course, business, templates, etc.

discord_knowledge:
  local_database: context/discord-knowledge/discord-questions.json
  total_questions: 2,930
  date_range: April 23 - December 13, 2025
  topics_indexed: 15
  keywords_indexed: 5,197
  mcp_server: v-3/discordmcp (fallback for real-time)
  target_server: discord.gg/n8n
  protocol: context/discord-knowledge/PROTOCOL.md
  status: ✅ Local DB ready | ⚠️ Live MCP pending (requires DISCORD_TOKEN)

reddit_knowledge:
  mcp_server: adhikasp/mcp-reddit
  target_subreddits: [n8n, selfhosted, homeautomation]
  protocol: context/reddit-knowledge/PROTOCOL.md
  status: enabled (no API credentials - ~10 req/min limit)
```

---

## KNOWN LIMITATIONS

### External Service Access

| Service | Limitation | Workaround |
|---------|-----------|------------|
| **n8n.io Template Pages** | WebFetch returns CSS/marketing content, no workflow JSON | Use MCP `get_template` or Zie619 GitHub library |
| **Medium Articles** | HTTP 403 Forbidden (bot blocking) | Use n8n community forum or Reddit instead |
| **YouTube Transcripts** | WebFetch blocked for youtube.com | Use YouTube MCP or pre-cached transcripts |
| **MCP Template IDs** | Some template IDs from external sources don't exist in MCP database | Use `search_templates` with keywords instead of `get_template` with IDs |

### API Requirements

| Feature | Requirement | Configuration |
|---------|-------------|---------------|
| **n8n Instance Access** | N8N_API_KEY required | Set in `.env` file |
| **Discord Live Search** | DISCORD_TOKEN required | Optional - use local database instead |
| **YouTube Transcripts** | YOUTUBE_API_KEY for live fetch | Pre-cached transcripts available offline |

### PDF/Document Processing with AI

**Critical**: OpenAI/Claude/Gemini APIs do NOT handle PDF files natively like their web UIs do.

**Solution Architecture**:
1. **Text-based PDFs**: Use `Extract from File` node
2. **Scanned/Image PDFs**: Use Mistral OCR API (Template 3102)
3. **Pass extracted content** to AI Agent

---

## VIOLATION PREVENTION CHECKLIST

**STOP before every workflow request. Did you:**

### Mandatory Pre-Checks
- [ ] Run `n8n_health_check()` FIRST to verify API connectivity
- [ ] Check YouTube transcript cache before WebFetch
- [ ] Check Discord local database before live MCP
- [ ] Check for existing workflows with `n8n_list_workflows`

### Use Specialized Tools
- [ ] Invoke `n8n-workflow-architect` agent for complex workflows
- [ ] Use Skill tool to invoke `n8n-workflow-dev` skill
- [ ] Check task templates with `list_tasks` before manual config
- [ ] Use `/preflight` or `/workflow` slash commands

### Documentation Protocol
- [ ] Follow waterfall: MCP Server → Context7 → Ref → Exa → Web
- [ ] Cache fetched API docs to `context/api-docs/`
- [ ] Document findings in RUNBOOK format

### Output Standards
- [ ] Validate workflows before deployment
- [ ] Save workflows to correct directory (dev/staging/production)
- [ ] Follow git commit format: `[n8n] {action}: {workflow-name}`

---

## HOOK DEBUGGING

If hooks don't appear to fire, check `.claude/logs/hooks.log` for execution traces.

**Common Issues**:
1. **Session Continuation**: SessionStart hook only fires on fresh sessions
2. **Working Directory**: Hooks use relative paths, must run from project root
3. **Permissions**: Check `.claude/settings.json` permissions block

---

*Last Updated: 2025-12-14*
*Version: 1.5.0* - Added Known Limitations, Violation Prevention Checklist, Hook debugging
