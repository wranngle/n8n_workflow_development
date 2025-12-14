# /lookup-api - Find API Documentation for Integration

Find comprehensive API documentation for a service/integration using the documentation waterfall.

## Parameters
- `service`: Name of the service/API to look up

## Execution Waterfall

### Step 1: Check for Existing n8n Node
```
mcp__n8n-mcp__search_nodes({query: "{service}"})
```
If found: Get node documentation
```
mcp__n8n-mcp__get_node_documentation({nodeType: "nodes-base.{found-node}"})
```

### Step 2: Check Context7 for SDK/Library
```
mcp__context7__resolve-library-id({libraryName: "{service}"})
```
If found:
```
mcp__context7__get-library-docs({
  context7CompatibleLibraryID: "{resolved-id}",
  tokens: 15000
})
```

### Step 3: Search Ref for Documentation
```
mcp__ref-tools__ref_search_documentation({
  query: "{service} API documentation authentication endpoints"
})
```
If found, read the best result:
```
mcp__ref-tools__ref_read_url({url: "{best-result-url}"})
```

### Step 4: Exa Deep Research
If still not found:
```
mcp__exa__deep_researcher_start({
  instructions: "Find complete REST API documentation for {service} including: authentication methods, base URL, available endpoints, request/response formats, rate limits, and code examples",
  model: "exa-research"
})
```
Then check results:
```
mcp__exa__deep_researcher_check({taskId: "{task-id}"})
```

### Step 5: Direct Web Search
As last resort:
```
WebSearch: "{service} API documentation REST endpoints authentication"
```
Then fetch promising results:
```
WebFetch on official docs URL
```

## Output Format

```markdown
## API Documentation: {service}

### Source
Found via: [n8n Node / Context7 / Ref / Exa / Web Search]
Documentation URL: {url}

### Authentication
Method: [OAuth2 / API Key / Bearer Token / Basic Auth]
Setup:
```
{authentication setup instructions}
```

### Base URL
```
{base_url}
```

### Key Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /resource | Description |
| POST | /resource | Description |
| ... | ... | ... |

### Example Request
```javascript
{example code}
```

### Rate Limits
{rate limit info if available}

### n8n Integration Notes
- Recommended node: [HTTP Request / existing node]
- Authentication node type: [OAuth2 / Header Auth / etc]
- Special considerations: {any notes}

### Cached To
Saved documentation to: context/api-docs/{service}.md
```

## Post-Lookup Actions
1. Save documentation summary to `context/api-docs/{service}.md`
2. Add to memory knowledge graph if complex integration
3. Note any MCP servers that could be added for this service
