# n8n Instance-Level MCP Integration

> **Status**: ACTIVE (configured in ~/.claude.json)
> **Requires**: n8n v1.121.2+ (enabled at instance level)

## Overview

n8n's Instance-Level MCP (Model Context Protocol) exposes your entire n8n instance as an MCP server. This allows AI assistants like Claude to:

- **Discover workflows** on your instance
- **Read workflow details** including nodes, connections, and parameters
- **Execute workflows** directly from Claude
- **Search workflows** by name or tags
- **Debug workflow executions**

## Architecture: Two Complementary MCP Servers

| MCP Server | Purpose | Data Source |
|------------|---------|-------------|
| **n8n-mcp** (npm) | Node schemas, templates, validation | Static database (528 nodes, 2709 templates) |
| **n8n Instance MCP** | Live workflows, executions, runtime | Your actual n8n instance |

Both should be used together for maximum capability.

## Instance-Level MCP Endpoint

```
https://n8n.wranngle.com/mcp-server/http
```

## Setup Instructions

### Step 1: Generate MCP Access Token (Required)

1. Go to your n8n instance: https://n8n.wranngle.com
2. Navigate to **Settings** → **API**
3. Create a new **MCP Access Token** (separate from API key)
4. Save the token securely

### Step 2: Enable Workflows for MCP

For each workflow you want exposed via MCP:

1. Open the workflow in n8n editor
2. Go to **Workflow Settings** (gear icon)
3. Toggle **"Allow MCP Access"** to ON
4. Save the workflow

### Step 3: Add to Claude Code Configuration

Add to `~/.claude.json` in the `mcpServers` section:

```json
"n8n-instance": {
  "command": "npx",
  "args": [
    "-y",
    "supergateway",
    "--streamableHttp",
    "https://n8n.wranngle.com/mcp-server/http",
    "--header",
    "authorization:Bearer <YOUR_MCP_TOKEN>"
  ]
}
```

Or use the Claude CLI with supergateway (required for streamable HTTP):
```bash
claude mcp add n8n-instance -- npx -y supergateway \
  --streamableHttp https://n8n.wranngle.com/mcp-server/http \
  --header "authorization:Bearer <YOUR_MCP_TOKEN>"
```

## Available MCP Tools

Once connected, Claude will have access to:

| Tool | Description |
|------|-------------|
| `list_workflows` | List all MCP-enabled workflows |
| `get_workflow` | Get full workflow details by ID |
| `execute_workflow` | Trigger workflow execution |
| `search_workflows` | Search by name/tags |
| `get_execution` | Get execution details/results |

## Use Cases for This Project

### 1. Direct Workflow Deployment
Instead of using `n8n_create_workflow` from n8n-mcp, Claude can directly execute a deployment workflow on the instance.

### 2. Workflow Testing
Claude can trigger test workflows and retrieve execution results without leaving the conversation.

### 3. Lovable Integration
Connect Lovable (frontend generator) to your n8n instance for AI-generated UIs backed by n8n workflows.

### 4. Multi-Agent Orchestration
Create a "meta-workflow" that orchestrates other workflows, callable via MCP.

## Comparison with n8n-mcp

| Feature | n8n-mcp (npm) | Instance MCP |
|---------|---------------|--------------|
| Node schemas | ✅ 528 nodes | ❌ |
| Templates | ✅ 2709 templates | ❌ |
| Validation | ✅ Full validation | ❌ |
| Live workflows | ❌ | ✅ |
| Execute workflows | ❌ | ✅ |
| Execution history | ❌ | ✅ |
| Real-time data | ❌ | ✅ |

**Recommendation**: Use both. n8n-mcp for building, instance MCP for deploying/executing.

## Security Considerations

- MCP tokens are separate from API keys
- Enable MCP only on workflows that should be AI-accessible
- Avoid enabling MCP on workflows with sensitive credentials
- Consider using workflow tags like "mcp-enabled" for organization

## Troubleshooting

### Connection Issues
1. Verify instance is publicly accessible
2. Check MCP is enabled in n8n settings
3. Confirm token is valid and not expired

### Workflows Not Appearing
1. Ensure workflow has "Allow MCP Access" enabled
2. Workflow must be saved after enabling MCP
3. Check n8n version is 1.121.2+

---

*Documentation created: 2025-12-26*
*Based on n8n v1.121.2+ Instance-Level MCP (Beta)*

## Sources

- [n8n Docs - Accessing n8n MCP Server](https://docs.n8n.io/advanced-ai/accessing-n8n-mcp-server/)
- [n8n Community - Instance-Level MCP Beta](https://community.n8n.io/t/introducing-instance-level-mcp-access-in-n8n-beta/223178)
- [n8n YouTube - Instance Level MCP](https://www.youtube.com/watch?v=JihC9nR_DqQ)
