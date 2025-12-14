/**
 * Unified Workflow Search - Conceptual Implementation
 * 
 * This file documents the search strategy for finding existing workflows
 * across all available sources before building new ones.
 * 
 * In Claude Code context, this is executed via tool calls, not as runnable JS.
 */

const SOURCES = {
  // Source 1: Our n8n Instance
  ownInstance: {
    name: "Our n8n Instance",
    priority: 1,
    tool: "mcp__n8n-mcp__n8n_list_workflows",
    description: "Check existing workflows in our own instance first"
  },
  
  // Source 2: Zie619 Community Library
  communityLibrary: {
    name: "Zie619 Community Library",
    priority: 2,
    endpoint: "https://zie619.github.io/n8n-workflows/api/workflows",
    description: "4,343 community workflows",
    params: ["q", "trigger", "complexity", "page", "per_page"]
  },
  
  // Source 3: n8n-MCP Template Database
  mcpTemplates: {
    name: "n8n-MCP Templates",
    priority: 3,
    tool: "mcp__n8n-mcp__search_templates",
    description: "2,709 official n8n templates"
  },
  
  // Source 4: n8n-MCP Node Templates
  nodeTemplates: {
    name: "Node-Specific Templates",
    priority: 4,
    tool: "mcp__n8n-mcp__list_node_templates",
    description: "Find templates using specific nodes"
  }
};

/**
 * Search Strategy for Claude Code
 * 
 * When user requests workflow development:
 * 
 * 1. Parse request to identify:
 *    - Keywords (e.g., "slack", "google sheets", "webhook")
 *    - Trigger type (webhook, schedule, manual)
 *    - Services involved
 * 
 * 2. Execute searches in priority order:
 */

const searchStrategy = {
  step1_ownInstance: `
    // Check our instance first
    mcp__n8n-mcp__n8n_list_workflows()
    // Filter results by keywords from request
  `,
  
  step2_communityLibrary: `
    // Search Zie619 library
    WebFetch({
      url: "https://zie619.github.io/n8n-workflows/api/workflows?q={keywords}&trigger={type}&per_page=10",
      prompt: "Extract workflow names, descriptions, complexity, nodes used"
    })
  `,
  
  step3_mcpTemplates: `
    // Search official templates
    mcp__n8n-mcp__search_templates({
      query: "{keywords}",
      limit: 10
    })
  `,
  
  step4_nodeTemplates: `
    // If specific services mentioned, search by node
    mcp__n8n-mcp__list_node_templates({
      nodeTypes: ["n8n-nodes-base.{service1}", "n8n-nodes-base.{service2}"]
    })
  `
};

/**
 * Result Aggregation
 * 
 * After all searches complete, present findings:
 */

const resultTemplate = `
## Existing Workflow Search Results

### Our Instance
Found: X workflows
- [name] - [trigger] - [last modified]

### Community Library (Zie619)
Found: X workflows  
- [name] - [complexity] - [nodes] - [link]

### n8n Templates
Found: X templates
- [id] - [name] - [description]

### Recommendation
Based on findings:
- [ ] Use existing: [workflow name] as starting point
- [ ] Adapt template: [template id]
- [ ] Build from scratch: No suitable existing solution
`;

/**
 * Export configuration for reference
 */
module.exports = { SOURCES, searchStrategy, resultTemplate };
