# n8n Workflow Validation Guide

Comprehensive validation using n8n-mcp tools and profiles.

---

## Validation Profiles

Choose the appropriate profile based on context:

| Profile | Use Case | Checks |
|---------|----------|--------|
| `minimal` | Quick check | Required fields only |
| `runtime` | Pre-execution | Critical errors only |
| `ai-friendly` | Default | Balanced - errors + key warnings |
| `strict` | Production deploy | All checks including best practices |

---

## Node Validation

### Validate Single Node
```javascript
mcp__n8n-mcp__validate_node_operation({
  nodeType: "nodes-base.httpRequest",
  config: {
    method: "POST",
    url: "https://api.example.com/data",
    sendBody: true,
    bodyParameters: {
      parameters: [
        { name: "key", value: "value" }
      ]
    }
  },
  profile: "ai-friendly"  // or minimal, runtime, strict
})
```

### Minimal Validation (Quick Check)
```javascript
mcp__n8n-mcp__validate_node_minimal({
  nodeType: "nodes-base.slack",
  config: {
    resource: "message",
    operation: "post"
    // Will fail - missing required: channel, text
  }
})
```

Returns only missing required fields without warnings or suggestions.

---

## Workflow Validation

### Full Workflow Validation
```javascript
mcp__n8n-mcp__validate_workflow({
  workflow: {
    name: "My Workflow",
    nodes: [...],
    connections: {...},
    settings: {...}
  },
  options: {
    validateNodes: true,        // Validate each node config
    validateConnections: true,  // Check node connections
    validateExpressions: true,  // Validate n8n expressions
    profile: "ai-friendly"      // Validation profile
  }
})
```

### Connection Validation Only
```javascript
mcp__n8n-mcp__validate_workflow_connections({
  workflow: {
    nodes: [...],
    connections: {...}
  }
})
```

Checks:
- Valid node references in connections
- No orphaned nodes
- Proper trigger placement
- No circular dependencies
- AI tool connections (if applicable)

### Expression Validation Only
```javascript
mcp__n8n-mcp__validate_workflow_expressions({
  workflow: {...}
})
```

Validates:
- `{{ }}` expression syntax
- Variable references (`$json`, `$node`, etc.)
- Node references in expressions
- JMESPath syntax

---

## Property Dependencies

Some node properties depend on others. Check visibility rules:

```javascript
mcp__n8n-mcp__get_property_dependencies({
  nodeType: "nodes-base.httpRequest",
  config: {
    sendBody: true  // When true, reveals body-related fields
  }
})
```

Common dependency patterns:
- `sendBody: true` → reveals `bodyParameters`, `contentType`
- `authentication: "oauth2"` → reveals OAuth fields
- `operation: "update"` → reveals update-specific fields

---

## Validation Response Format

```json
{
  "valid": false,
  "errors": [
    {
      "type": "missing_required",
      "field": "channel",
      "message": "Required field 'channel' is missing"
    }
  ],
  "warnings": [
    {
      "type": "best_practice",
      "message": "Consider adding error handling"
    }
  ],
  "suggestions": [
    {
      "type": "optimization",
      "message": "Use batch mode for multiple items"
    }
  ]
}
```

---

## Pre-Deployment Checklist

### Automated Checks
```javascript
// 1. Validate all nodes
for (const node of workflow.nodes) {
  await mcp__n8n-mcp__validate_node_operation({
    nodeType: node.type.replace('n8n-nodes-base.', 'nodes-base.'),
    config: node.parameters,
    profile: "strict"
  });
}

// 2. Validate workflow structure
await mcp__n8n-mcp__validate_workflow({
  workflow,
  options: { profile: "strict" }
});

// 3. Validate connections
await mcp__n8n-mcp__validate_workflow_connections({ workflow });

// 4. Validate expressions
await mcp__n8n-mcp__validate_workflow_expressions({ workflow });
```

### Manual Security Checks
- [ ] No hardcoded API keys or secrets
- [ ] Credentials use n8n credential store references
- [ ] No PII in node names or notes
- [ ] Webhook paths are not easily guessable
- [ ] Sensitive data not exposed in logs
- [ ] Error messages don't leak internal details

---

## Common Validation Errors

### Missing Required Fields
```
Error: Required field 'channel' is missing
Fix: Add the required field to node parameters
```

### Invalid Node Type
```
Error: Unknown node type 'nodes-base.slackk'
Fix: Check spelling, use search_nodes to find correct type
```

### Invalid Expression
```
Error: Expression syntax error in {{ $jso.field }}
Fix: Correct to {{ $json.field }}
```

### Orphaned Node
```
Error: Node 'Process Data' has no connections
Fix: Connect node to workflow or remove if unused
```

### Invalid Credential Reference
```
Error: Credential 'Slack' not found
Fix: Ensure credential exists or use correct ID
```

---

## Validation in Workflow Pipeline

```
BUILD → VALIDATE → DEPLOY

           │
           ▼
     ┌─────────────┐
     │ Validate    │
     │ Each Node   │
     └─────────────┘
           │
           ▼
     ┌─────────────┐
     │ Validate    │
     │ Workflow    │
     └─────────────┘
           │
           ▼
     ┌─────────────┐
     │ Validate    │
     │ Connections │
     └─────────────┘
           │
           ▼
     ┌─────────────┐
     │ Validate    │
     │ Expressions │
     └─────────────┘
           │
           ▼
     ┌─────────────┐
     │ Security    │
     │ Checklist   │
     └─────────────┘
           │
           ▼
       PASS/FAIL
```

---

*Validation tools from n8n-mcp: validate_node_operation, validate_workflow, validate_workflow_connections, validate_workflow_expressions*
