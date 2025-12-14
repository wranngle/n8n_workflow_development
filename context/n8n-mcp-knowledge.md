# n8n-MCP Complete Knowledge Reference

Extracted from czlonkowski/n8n-mcp repository documentation. Critical patterns for AI-assisted workflow development.

---

## Core Architecture Insights

### Tool Response Size Optimization

**get_node_essentials achieves 95% response size reduction**:
- Full `get_node_info`: 100KB+ payload, 20% failure rate
- Optimized `get_node_essentials`: ~5KB payload, 91.7% success rate
- ALWAYS use essentials first, only escalate to full info if needed

### Partial Workflow Updates (80-90% Token Savings)

**n8n_update_partial_workflow** is the most efficient workflow editing tool:
- Instead of sending entire workflow, send only diff operations
- 80-90% reduction in token usage vs full workflow updates
- 15 operation types available

**Operation Types**:
```javascript
// Node Operations
{ type: "addNode", node: {...} }
{ type: "removeNode", nodeId: "..." }
{ type: "updateNode", nodeId: "...", updates: {...} }
{ type: "moveNode", nodeId: "...", position: [x, y] }
{ type: "enableNode", nodeId: "..." }
{ type: "disableNode", nodeId: "..." }

// Connection Operations
{ type: "addConnection", source: "...", target: "...", branch: "true" }
{ type: "removeConnection", source: "...", target: "..." }

// Settings Operations
{ type: "updateSettings", settings: {...} }
{ type: "updateName", name: "..." }
{ type: "addTag", tag: "..." }
{ type: "removeTag", tag: "..." }
```

---

## AI Node Validation (Critical)

### Reverse Connection Pattern

**AI connections flow TO AI Agent nodes, not FROM**:
```
Standard nodes: Source → Target (data flows right)
AI tool nodes:  AI Agent ← Tool Node (tool connects TO agent)
```

**8 AI Connection Types**:
1. `ai_tool` - Tool connections to AI Agent
2. `ai_memory` - Memory providers
3. `ai_chain` - Chain connections
4. `ai_document` - Document loaders
5. `ai_embedding` - Embedding models
6. `ai_languageModel` - LLM connections
7. `ai_outputParser` - Output parsers
8. `ai_retriever` - Retriever connections

### AI-Capable Nodes

**269 AI-capable nodes** with specific validation rules:
- Primary AI nodes: `nodes-langchain.agent`, `nodes-langchain.chainLlm`
- All can accept AI tool connections
- Tool connections use dedicated AI ports, not main output

### AI Validation Rules

```javascript
// Validate AI connections
{
  nodeType: "nodes-langchain.agent",
  validate: {
    hasAiPort: true,
    connectionType: "ai_tool",
    requiresLlm: true
  }
}
```

---

## Semantic Connection Parameters

### IF Node Branches

**Use `branch` parameter instead of `sourceIndex`**:
```javascript
// Clear semantic naming
{ type: "addConnection", source: "IF", target: "TrueHandler", branch: "true" }
{ type: "addConnection", source: "IF", target: "FalseHandler", branch: "false" }

// Avoid index confusion
// ❌ sourceIndex: 0  (which output is this?)
// ✅ branch: "true"  (clear intent)
```

### Switch Node Cases

**Use `case` parameter for switch outputs**:
```javascript
{ type: "addConnection", source: "Switch", target: "CaseA", case: 0 }
{ type: "addConnection", source: "Switch", target: "CaseB", case: 1 }
{ type: "addConnection", source: "Switch", target: "Default", case: 2 }
```

---

## Validation Analysis Insights

### Error Distribution (from 12.6% error rate analysis)

**Top Error Categories**:
1. **Structure Errors** (35%) - Missing required node properties
2. **Connection Errors** (28%) - Invalid or broken connections
3. **Required Field Errors** (22%) - Missing mandatory parameters
4. **Expression Errors** (10%) - Invalid n8n expression syntax
5. **Type Errors** (5%) - Wrong data types

### Validation Profiles

| Profile | Use Case | Strictness |
|---------|----------|------------|
| `minimal` | Quick checks | Required fields only |
| `runtime` | Pre-deployment | Critical errors |
| `ai-friendly` | AI configuration | Reduced false positives |
| `strict` | Production | All checks + best practices |

**Recommended**: Use `ai-friendly` during building, `strict` before deployment.

### Common False Positives

```javascript
// These are valid but may trigger warnings:
1. Empty arrays in multi-value fields (valid initialization)
2. Placeholder credentials (valid before runtime)
3. Expression-only values (valid dynamic config)
4. Optional fields with defaults (can be omitted)
```

---

## Auto-Sanitization System

**Automatic fixes applied on ALL workflow updates**:

### Binary Operators (equals, contains)
```javascript
// Before
{ operator: { type: "equals", singleValue: true } }
// After (auto-fixed)
{ operator: { type: "equals" } }  // singleValue removed
```

### Unary Operators (isEmpty, isNotEmpty)
```javascript
// Before
{ operator: { type: "isEmpty" } }
// After (auto-fixed)
{ operator: { type: "isEmpty", singleValue: true } }  // singleValue added
```

### What CANNOT Be Auto-Fixed
- Broken connections between nodes
- Branch count mismatches
- Paradoxical corrupt states
- Invalid node types

---

## Workflow Structure Patterns

### Minimal Valid Workflow

```json
{
  "name": "My Workflow",
  "nodes": [
    {
      "id": "trigger-1",
      "name": "Start",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [250, 300],
      "parameters": {}
    }
  ],
  "connections": {},
  "settings": {
    "executionOrder": "v1"
  }
}
```

### Node Positioning Guidelines

```javascript
// Standard spacing
const HORIZONTAL_GAP = 200;  // Between sequential nodes
const VERTICAL_GAP = 100;    // Between parallel branches

// Position calculation
function positionNode(index, branch = 0) {
  return [250 + (index * HORIZONTAL_GAP), 300 + (branch * VERTICAL_GAP)];
}
```

---

## Multi-Tenant Configuration

### Instance Configuration Pattern

```javascript
// Multiple n8n instances supported
{
  instances: {
    development: {
      url: "https://dev.n8n.example.com",
      apiKey: "dev-key"
    },
    staging: {
      url: "https://staging.n8n.example.com",
      apiKey: "staging-key"
    },
    production: {
      url: "https://n8n.example.com",
      apiKey: "prod-key"
    }
  },
  defaultInstance: "development"
}
```

### Dynamic Instance Selection

```javascript
// Switch instance context
setActiveInstance("production")

// Or per-operation
n8n_create_workflow({
  instance: "staging",
  workflow: {...}
})
```

---

## Expression Gotchas

### Webhook Data Access

```javascript
// ❌ WRONG - Webhook body is nested
$json.name

// ✅ CORRECT - Access body explicitly
$json.body.name
```

### Expression Wrapper

```javascript
// Always wrap expressions in double braces
// ❌ Wrong
$json.field

// ✅ Correct
{{ $json.field }}
```

### Common Expression Patterns

```javascript
// Access previous node data
{{ $json.fieldName }}

// Access specific node by name
{{ $node["NodeName"].json.field }}

// Access workflow metadata
{{ $workflow.name }}
{{ $workflow.id }}

// Access execution context
{{ $execution.id }}
{{ $now }}
```

---

## Code Node Patterns

### Return Format (Critical)

```javascript
// ❌ WRONG - Returns raw data
return data;

// ✅ CORRECT - Returns n8n-compatible format
return [{ json: data }];

// For multiple items
return items.map(item => ({ json: item }));
```

### Available Built-ins

```javascript
// Built-in libraries (no require needed)
const { DateTime } = require('luxon');  // Date/time
const _ = require('lodash');            // Utility functions

// Available despite editor warnings
const crypto = require('crypto');        // Cryptography
const Buffer = global.Buffer;            // Binary data
```

### JMESPath with Special Characters

```javascript
// Use backticks for keys with special characters
const value = $jmespath(items, '[*].json.`field-with-dashes`');
```

---

## Task Template Categories

### 29 Pre-configured Templates

**HTTP/API**:
- `post_json_request`
- `get_request`
- `authenticated_api_call`

**Webhooks**:
- `receive_webhook`
- `respond_to_webhook`

**Database**:
- `query_database`
- `insert_record`
- `update_record`

**AI/LangChain**:
- `ai_agent_workflow`
- `chain_with_memory`
- `document_qa`

**Data Processing**:
- `transform_data`
- `merge_datasets`
- `filter_records`

**Communication**:
- `send_slack_message`
- `send_email`

**Error Handling**:
- `modern_error_handling_patterns`

---

## Performance Optimization

### Tool Selection Priority

```
1. search_nodes (99.9% success, <20ms)
2. get_node_essentials (91.7% success, <10ms, 5KB)
3. validate_node_minimal (97.4% success, <100ms)
4. n8n_update_partial_workflow (99.0% success, 50-200ms)
```

### Avoid

```
- get_node_info (80% success, 100KB+ payload)
- Full workflow updates (use partial instead)
- Skipping validation (causes runtime errors)
```

---

## Quick Reference Card

### Node Type Formats

| Context | Format | Example |
|---------|--------|---------|
| Search/Validate | `nodes-base.*` | `nodes-base.slack` |
| Workflow JSON | `n8n-nodes-base.*` | `n8n-nodes-base.slack` |
| LangChain | `nodes-langchain.*` | `nodes-langchain.agent` |
| Workflow JSON (LC) | `@n8n/n8n-nodes-langchain.*` | `@n8n/n8n-nodes-langchain.agent` |

### Common Operations

```javascript
// Find node
search_nodes({ query: "slack" })

// Get config (ALWAYS FIRST)
get_node_essentials({ nodeType: "nodes-base.slack" })

// Validate
validate_node_operation({ nodeType: "...", config: {...}, profile: "ai-friendly" })

// Create workflow
n8n_create_workflow({ name: "...", nodes: [...], connections: {...} })

// Update efficiently
n8n_update_partial_workflow({ id: "...", operations: [...] })
```

---

*Source: czlonkowski/n8n-mcp repository*
*Version: 2.0.0*
*Last Updated: 2025-12-14*
