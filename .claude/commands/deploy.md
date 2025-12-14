# /deploy - Deploy Workflow to n8n Instance

Deploy a validated workflow to the n8n instance.

## Prerequisites
- [ ] Workflow has passed /validate
- [ ] Workflow JSON exists in workflows/dev/ or workflows/staging/
- [ ] n8n API connection verified

## Parameters
- `file`: Path to workflow JSON file
- `environment`: dev | staging | production (default: staging)
- `activate`: true | false (default: false for safety)

## Execution Steps

### 1. Pre-flight Check
```
mcp__n8n-mcp__n8n_health_check
```
Verify API connectivity before proceeding.

### 2. Read Workflow File
```
Read the workflow JSON from specified path
```

### 3. Final Validation
```
mcp__n8n-mcp__validate_workflow({workflow: {...}})
```
Abort if validation fails.

### 4. Check for Existing Workflow
```
mcp__n8n-mcp__n8n_list_workflows
```
Check if workflow with same name exists:
- If exists: Confirm update vs create new
- If new: Proceed with creation

### 5. Deploy Workflow
```
mcp__n8n-mcp__n8n_create_workflow({
  name: workflow.name,
  nodes: workflow.nodes,
  connections: workflow.connections,
  settings: workflow.settings
})
```

### 6. Activation (if requested)
If activate=true and environment=production:
- REQUIRE explicit user confirmation
- Log activation with timestamp

### 7. Post-Deploy Actions
- Copy workflow to appropriate workflows/{environment}/ folder
- Git commit: `[n8n] deploy: {workflow-name} to {environment}`
- Update deployment log

## Output Format

```markdown
## Deployment Report

### Workflow: {name}
### Environment: {environment}
### Status: ✅ SUCCESS / ❌ FAILED

### Deployment Details
- Workflow ID: {id}
- Created/Updated: {timestamp}
- Active: {true/false}
- URL: https://n8n.atgfw.com/workflow/{id}

### Post-Deploy Checklist
- [ ] Workflow saved to workflows/{environment}/
- [ ] Git committed
- [ ] Stakeholder notified (if production)

### Next Steps
{recommendations based on environment}
```

## Safety Guardrails

### Production Deployments
- ALWAYS require explicit confirmation
- ALWAYS create backup of existing workflow first
- NEVER auto-activate without confirmation
- Log all production changes

### Rollback Information
If rollback needed:
1. Previous version at: workflows/production/{name}.backup.json
2. Or restore from git: `git checkout HEAD~1 -- workflows/production/{name}.json`
