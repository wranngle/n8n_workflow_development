# Knowledge Graph Seed for n8n Development

Initial knowledge to populate the memory MCP server for n8n workflow development context.

## Core Entities

### n8n Platform
```json
{
  "name": "n8n",
  "entityType": "platform",
  "observations": [
    "n8n is a workflow automation platform with 528+ nodes",
    "Self-hosted at https://your-n8n-instance.com",
    "Workflows are stored as JSON files",
    "Uses credential store for secure authentication",
    "Supports webhooks, schedules, and event triggers"
  ]
}
```

### n8n-MCP Server
```json
{
  "name": "n8n-MCP",
  "entityType": "tool",
  "observations": [
    "Primary MCP server for n8n operations",
    "Contains 528 node definitions with 89% documentation coverage",
    "Provides 2,709 workflow templates",
    "Key tools: search_nodes, get_node_essentials, validate_workflow",
    "Requires N8N_API_KEY for instance management features"
  ]
}
```

### Zie619 Workflow Library
```json
{
  "name": "Zie619-Library",
  "entityType": "resource",
  "observations": [
    "Community collection of 4,343 n8n workflows",
    "Searchable via REST API at zie619.github.io/n8n-workflows/api",
    "Filters: query, trigger type, complexity level",
    "Includes workflow JSON and Mermaid diagrams",
    "GitHub repo: Zie619/n8n-workflows"
  ]
}
```

### Workflow Development Protocol
```json
{
  "name": "Development-Protocol",
  "entityType": "process",
  "observations": [
    "ALWAYS search existing solutions before building new",
    "Search order: Own instance → Community library → MCP templates",
    "Validate all nodes before adding to workflow",
    "Full workflow validation required before deployment",
    "Error handling mandatory for production workflows",
    "Git version control for all workflow changes"
  ]
}
```

## Key Relations

```json
[
  {"from": "n8n-MCP", "to": "n8n", "relationType": "integrates_with"},
  {"from": "Zie619-Library", "to": "n8n", "relationType": "provides_templates_for"},
  {"from": "Development-Protocol", "to": "n8n", "relationType": "governs_development_of"},
  {"from": "n8n-MCP", "to": "Development-Protocol", "relationType": "enforces"},
  {"from": "Context7", "to": "Development-Protocol", "relationType": "supports"},
  {"from": "Exa", "to": "Development-Protocol", "relationType": "supports"}
]
```

## Common Patterns (Observations to Add)

### Webhook Pattern
- "Webhook nodes use httpMethod, path, and responseMode parameters"
- "Response modes: onReceived (immediate), lastNode (after processing)"
- "Always validate incoming data in webhook workflows"

### Error Handling Pattern  
- "Use onError: 'continueErrorOutput' for graceful error handling"
- "Error Trigger node catches errors from other workflows"
- "Include retryOnFail with maxTries for external API calls"

### API Integration Pattern
- "HTTP Request node is the primary tool for custom API calls"
- "Use credential store for API keys, never hardcode"
- "Check for existing n8n node before using HTTP Request"

## MCP Tool Commands for Knowledge Graph

### Create Initial Entities
```javascript
mcp__memory__create_entities({
  entities: [
    {name: "n8n", entityType: "platform", observations: [...]},
    {name: "n8n-MCP", entityType: "tool", observations: [...]},
    // ... more entities
  ]
})
```

### Add Relations
```javascript
mcp__memory__create_relations({
  relations: [
    {from: "n8n-MCP", to: "n8n", relationType: "integrates_with"},
    // ... more relations
  ]
})
```

### Query Knowledge
```javascript
mcp__memory__search_nodes({query: "workflow development"})
mcp__memory__read_graph()
```

## Usage in Development

When starting a new workflow development session, optionally load this knowledge:

1. Check if knowledge graph is populated:
   ```
   mcp__memory__search_nodes({query: "n8n"})
   ```

2. If empty, seed with entities and relations above

3. Add new learnings during development:
   ```
   mcp__memory__add_observations({
     observations: [{
       entityName: "n8n",
       contents: ["New pattern discovered: ..."]
     }]
   })
   ```
