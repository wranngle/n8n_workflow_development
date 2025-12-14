# /new-workflow - Start New Workflow Development

You are starting a new n8n workflow development request. Execute the MANDATORY PRE-FLIGHT CHECKLIST before writing any code.

## Step 1: Parse the Request
Identify from the user's request:
- **Trigger Type**: webhook, schedule, manual, event-based, or other
- **Data Sources**: APIs, databases, files, webhooks
- **Transformations**: Data processing, filtering, mapping needed
- **Outputs**: Where does data go? Slack, email, database, API call?
- **Error Requirements**: What happens on failure?

## Step 2: Search Existing Solutions (MANDATORY)

### 2.1 Search Our Instance
```
mcp__n8n-mcp__n8n_list_workflows with relevant filters
```
Report: "Found X similar workflows in our instance: [list names]"

### 2.2 Search Community Library  
```
WebFetch: https://zie619.github.io/n8n-workflows/api/workflows?q={keywords}
```
Report: "Found X relevant community workflows: [list top 3 with links]"

### 2.3 Search MCP Templates
```
mcp__n8n-mcp__search_templates with keywords
```
Report: "Found X matching templates: [list top 3]"

## Step 3: Design Decision
Based on search results, recommend:
- [ ] **Adapt existing**: Use workflow X as base, modify for this use case
- [ ] **Combine patterns**: Merge patterns from workflows A + B
- [ ] **Build new**: No suitable existing solution, build from scratch

## Step 4: Get Node Information
For each node needed:
```
mcp__n8n-mcp__get_node_essentials({nodeType: "nodes-base.{nodename}"})
```

## Step 5: Build Workflow
Construct the workflow JSON with proper:
- Node configurations
- Connections
- Error handling
- Credentials references

## Step 6: Validate
```
mcp__n8n-mcp__validate_workflow({workflow: {...}})
```

## Step 7: Save to Dev
Save workflow JSON to: `workflows/dev/{workflow-name}.json`

Report completion with:
- Workflow summary
- Nodes used
- Credentials required
- Next steps for testing
