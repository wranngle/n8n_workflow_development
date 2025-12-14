# /search-library - Search All Workflow Sources

Search across all available workflow libraries and templates for solutions.

## Parameters
Accept from user: {query} - keywords to search for

## Execution

### 1. Search Our n8n Instance
```
mcp__n8n-mcp__n8n_list_workflows
```
Filter results matching the query keywords.

### 2. Search Zie619 Community Library (4,343 workflows)

**Method A: GitHub API (Recommended - Always Works)**
```
WebFetch URL: https://api.github.com/repos/Zie619/n8n-workflows/contents/workflows/{Category}
Prompt: List all workflow filenames matching '{query}'
```
First identify relevant category, then list workflows in that category.

**Method B: Render API (May Be Sleeping)**
```
WebFetch URL: https://n8n-workflows-1-xxgm.onrender.com/api/workflows?q={query}&per_page=10
Prompt: Extract workflow names, descriptions, trigger types, complexity, and node counts
```
⚠️ If 503 error, API is sleeping. Use GitHub method instead.

**To fetch a specific workflow:**
```
WebFetch URL: https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/{Category}/{filename}.json
Prompt: Extract nodes, connections, and workflow structure
```

### 3. Search n8n-MCP Templates (2,709 templates)
```
mcp__n8n-mcp__search_templates({query: "{query}", limit: 10})
```

### 4. Search by Specific Nodes (if query mentions specific services)
```
mcp__n8n-mcp__list_node_templates({nodeTypes: ["n8n-nodes-base.{service}"]})
```

## Output Format

```markdown
## Workflow Search Results for: "{query}"

### Our Instance
| Name | Status | Trigger | Last Modified |
|------|--------|---------|---------------|
| ... | ... | ... | ... |

### Community Library (Zie619)
| Name | Complexity | Trigger | Nodes | Link |
|------|------------|---------|-------|------|
| ... | ... | ... | ... | ... |

### n8n Templates  
| ID | Name | Description |
|----|------|-------------|
| ... | ... | ... |

### Recommendation
Based on search results, the best starting point is: [recommendation]
```
