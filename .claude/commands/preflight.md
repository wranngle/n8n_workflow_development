# /preflight - Pre-Development Checklist

Run this BEFORE starting any workflow development to ensure all systems are ready.

## System Checks

### 1. n8n Instance Connectivity
```
mcp__n8n-mcp__n8n_health_check
```
Expected: `success: true`
If fails: Check N8N_API_KEY environment variable

### 2. MCP Server Status
Verify these tools respond:
- `mcp__n8n-mcp__get_database_statistics` → Should show 528 nodes
- `mcp__context7__resolve-library-id` → Test with "react"
- `mcp__exa__web_search_exa` → Test with "n8n automation"

### 3. Workflow Library API
```
WebFetch: https://zie619.github.io/n8n-workflows/api/stats
Prompt: Extract total workflows count
```
Expected: ~4,343 workflows

### 4. File System Access
```
List: D:\Things\Work\Wranngle\n8n\workflows\dev
```
Confirm directories exist and are writable

## Pre-Flight Report

```markdown
## Pre-Flight Check: {timestamp}

### System Status
| Component | Status | Details |
|-----------|--------|---------|
| n8n Instance | ✅/❌ | {url} |
| n8n-MCP | ✅/❌ | {node count} nodes |
| Context7 | ✅/❌ | |
| Exa Search | ✅/❌ | |
| Workflow Library | ✅/❌ | {count} workflows |
| File System | ✅/❌ | |

### Ready to Proceed: YES / NO
```

## If Checks Fail

### n8n Instance Down
1. Check if instance is running
2. Verify API key is set
3. Can still develop workflows locally, deploy later

### MCP Server Issues
1. Check MCP configuration
2. Restart Claude Code
3. Verify network connectivity

### Workflow Library Unreachable
1. GitHub Pages may be down
2. Use cached patterns from context/workflow-patterns/
3. Rely on n8n-MCP templates instead
