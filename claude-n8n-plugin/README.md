# n8n Methodology Plugin for Claude Code

> Complete n8n workflow development methodology as a portable Claude Code plugin.

## What's Included

| Component | Count | Description |
|-----------|-------|-------------|
| Skills | 9 | Specialized workflow development skills |
| Agents | 9 | Task-specific agents |
| Commands | 5 | Slash commands for quick actions |
| Hooks | 8 | Automatic quality enforcement |
| MCP Server | 1 | 7 tools for methodology access |
| Knowledge Bases | 2 | YouTube (10,279) + Discord (2,930) |

## Installation

### Option 1: Local Plugin Directory

```bash
# Clone or copy to your plugins location
cp -r claude-n8n-plugin ~/.claude/plugins/n8n-methodology

# Or test directly
claude --plugin-dir ./claude-n8n-plugin
```

### Option 2: Install from Path

```bash
claude plugin install ./claude-n8n-plugin
```

## Skills Available

| Skill | Trigger | Purpose |
|-------|---------|---------|
| `n8n-workflow-dev` | Workflow requests | Master 21-step protocol |
| `n8n-workflow-patterns` | Pattern questions | 5 proven patterns |
| `n8n-validation-expert` | Validation errors | Error interpretation |
| `n8n-mcp-tools-expert` | MCP tool usage | Tool selection |
| `n8n-expression-syntax` | Expression errors | Fix {{}} syntax |
| `n8n-node-configuration` | Node config | Operation-aware setup |
| `n8n-code-javascript` | Code nodes | JS patterns |
| `n8n-code-python` | Python Code | Python patterns |
| `n8n-pipeline-middleware` | Pipeline work | AI pipeline integration |

## Commands Available

| Command | Purpose |
|---------|---------|
| `/quick-node` | Fast node configuration lookup |
| `/lookup-api` | API documentation search |
| `/analyze-workflow` | Deep workflow analysis |
| `/screenshot-to-workflow` | Convert screenshots to workflows |
| `/technical-research` | Integration research for proposals |

## MCP Tools

Once installed, these tools are available from any project:

```javascript
mcp__n8n-methodology__get_methodology()           // Full CLAUDE.md
mcp__n8n-methodology__get_skill("n8n-workflow-dev") // Skill prompt
mcp__n8n-methodology__list_skills()               // All 9 skills
mcp__n8n-methodology__search_knowledge("webhook") // Search knowledge bases
mcp__n8n-methodology__get_workflow_pattern("ai-agent-workflow")
mcp__n8n-methodology__list_patterns()             // 5 patterns
mcp__n8n-methodology__get_quick_reference("research-quota")
```

## Research Quota Enforcement

This plugin enforces a **25-source minimum** for non-trivial workflows:

| Complexity | Minimum | Diversity |
|------------|---------|-----------|
| Trivial | 5 | ≥2 types |
| Moderate+ | **25** | ≥4 types |

Source types: YouTube, Discord, Templates, Community workflows, API docs, Reddit, WebSearch

## Hooks Behavior

| Hook | Trigger | Action |
|------|---------|--------|
| `detect-workflow-intent` | UserPromptSubmit | Detects n8n keywords, invokes skill |
| `pre-deploy-check` | PreToolUse (create workflow) | Validates before deploy |
| `post-deploy-log` | PostToolUse (create/update) | Logs deployment |
| `workflow-file-guard` | PreToolUse (Write) | Protects workflow files |
| `auto-git-stage` | PostToolUse (Write) | Auto-stages changes |
| `session-init` | SessionStart | Initializes session |

## Directory Structure

```
claude-n8n-plugin/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── skills/                   # 9 skills
│   ├── n8n-workflow-dev/
│   ├── n8n-workflow-patterns/
│   └── ...
├── agents/                   # 9 agents
├── commands/                 # 5 commands
├── hooks/
│   ├── hooks.json           # Hook configuration
│   └── scripts/             # Hook scripts
├── servers/
│   └── n8n-methodology-mcp/ # MCP server
├── context/
│   ├── youtube-knowledge/   # 10,279 videos
│   └── discord-knowledge/   # 2,930 Q&A
├── CLAUDE.md                # Methodology reference
└── README.md                # This file
```

## Requirements

- Claude Code CLI
- Node.js 18+
- n8n-mcp server (for workflow operations)

## Version

v1.1.0 - Includes 25-source research quota enforcement

## License

MIT - Wranngle Systems
