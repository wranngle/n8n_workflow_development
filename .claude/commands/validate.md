# /validate - Comprehensive Workflow Validation

Run full validation suite on a workflow before deployment.

## Input
Accept: workflow JSON (from file path or inline) or workflow ID

## Validation Steps

### 1. Structural Validation
```
mcp__n8n-mcp__validate_workflow({workflow: {...}})
```
Check: nodes, connections, settings structure

### 2. Node Configuration Validation
For each node in the workflow:
```
mcp__n8n-mcp__validate_node_operation({
  nodeType: "{node.type}",
  config: {node.parameters}
})
```

### 3. Connection Validation
```
mcp__n8n-mcp__validate_workflow_connections({workflow: {...}})
```
Check: No orphan nodes, valid connection paths, proper trigger placement

### 4. Expression Validation
```
mcp__n8n-mcp__validate_workflow_expressions({workflow: {...}})
```
Check: All {{ }} expressions are syntactically valid

### 5. Security Check
Manual review:
- [ ] No hardcoded API keys in parameters
- [ ] Credentials use n8n credential store references
- [ ] Webhook paths don't expose sensitive info
- [ ] No PII in node names or notes

### 6. Best Practices Check
- [ ] Error handling node present
- [ ] Descriptive node names (not "HTTP Request 1")
- [ ] Notes on complex logic nodes
- [ ] Appropriate retry settings on external API calls

## Output Format

```markdown
## Validation Report: {workflow.name}

### Overall Status: ✅ PASS / ❌ FAIL / ⚠️ WARNINGS

### Structural Validation
Status: ✅/❌
Issues: [list any]

### Node Validation
| Node | Status | Issues |
|------|--------|--------|
| ... | ... | ... |

### Connection Validation  
Status: ✅/❌
Issues: [list any]

### Expression Validation
Status: ✅/❌
Invalid expressions: [list any]

### Security Check
Status: ✅/⚠️/❌
Concerns: [list any]

### Best Practices
Score: X/6
Missing: [list any]

### Recommendation
[Deploy ready / Needs fixes / Block deployment]
```
