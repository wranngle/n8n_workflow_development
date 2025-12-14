# /workflow - Complete Intent-to-Production Pipeline

The master command that orchestrates the full workflow development lifecycle from user request to production deployment.

---

## STAGE 1: INTAKE
**Trigger**: User describes what they want automated

### Parse Intent
Extract from user request:
```yaml
trigger_type:     # webhook | schedule | manual | event
data_sources:     # APIs, databases, files, services
transformations:  # filtering, mapping, enrichment
outputs:          # notifications, database writes, API calls
error_handling:   # retry, alert, fallback
```

### Confirm Understanding
Before proceeding, summarize back:
> "You want a workflow that [trigger] → [process] → [output]. On errors, it should [error behavior]. Is this correct?"

---

## STAGE 2: DISCOVERY (Mandatory - Never Skip)
**Goal**: Find existing solutions before building

### 2.1 Search Own Instance
```
mcp__n8n-mcp__n8n_list_workflows
```
*Skip if instance not deployed*

### 2.2 Search Community Library (GitHub - Always Works)
```javascript
// Step A: List relevant category
WebFetch({
  url: "https://api.github.com/repos/Zie619/n8n-workflows/contents/workflows/{Category}",
  prompt: "Find workflow files matching: {keywords}"
})

// Step B: Get backup categories if needed
// Categories: Slack, Airtable, Googlesheets, Hubspot, Openai, Discord, Notion, etc.
```

### 2.3 Search MCP Templates
```
mcp__n8n-mcp__search_templates({query: "{keywords}", limit: 10})
```

### 2.4 Search by Node Types
```
mcp__n8n-mcp__list_node_templates({
  nodeTypes: ["n8n-nodes-base.{service1}", "n8n-nodes-base.{service2}"]
})
```

### 2.5 ⚠️ DEEP CONTENT ANALYSIS (REQUIRED)

**DO NOT SKIP THIS STEP** - Filename matching is not enough!

For the top 3-5 promising workflows from steps 2.2-2.4:
```javascript
// Fetch ACTUAL workflow JSON and analyze structure
WebFetch({
  url: "https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/{Category}/{filename}.json",
  prompt: "Analyze this workflow and extract:
    1. ALL node types used (n8n-nodes-base.* types)
    2. Trigger type and its configuration
    3. Data transformation logic (Code nodes, expressions)
    4. Error handling approach (onError, errorTrigger)
    5. Connection flow (node A → node B → ...)
    6. Credential types required
    7. REUSABLE patterns or code snippets we can copy
    8. Match score (1-10) for our use case: {describe use case}"
})
```

### Content Analysis Report
For EACH analyzed workflow:
```markdown
### Workflow: {name}
**Source**: {github URL}
**Match Score**: {1-10}/10

**Node Inventory**:
| Node | Type | Reusable? |
|------|------|-----------|
| {name} | {type} | Yes/No |

**Reusable Code**:
```json
{extracted node configs we can reuse}
```

**Adaptation Required**:
- {what needs to change}
```

### Discovery Decision Matrix
| Workflow | Match | Nodes Match | Patterns Match | Effort to Adapt |
|----------|-------|-------------|----------------|-----------------|
| {name1} | 8/10 | 5/6 | 3/3 | Low |
| {name2} | 6/10 | 4/6 | 2/3 | Medium |

### Final Recommendation
Based on CONTENT ANALYSIS:
○ **ADAPT**: Use {workflow} - {X}% of nodes reusable
○ **COMBINE**: Merge {workflow A} trigger + {workflow B} processing
○ **BUILD NEW**: No workflow has matching structure (explain why)

---

## STAGE 3: DESIGN
**Goal**: Architecture before code

### 3.1 Identify Required Nodes
For each capability needed:
```
mcp__n8n-mcp__search_nodes({query: "{capability}"})
```

### 3.2 Get Node Configurations
```
mcp__n8n-mcp__get_node_essentials({nodeType: "nodes-base.{node}"})
```
⚠️ ALWAYS use get_node_essentials first (5KB vs 100KB)

### 3.3 Check for New Integrations
If service has no native node:
```
/lookup-api {service-name}
```
This triggers the documentation waterfall:
Context7 → Ref → Exa → WebSearch

### 3.4 Design Document
```markdown
## Workflow Design: {name}

### Flow
[Trigger] → [Node A] → [Node B] → [Output]
                ↓ (error)
           [Error Handler]

### Nodes Required
| Node | Type | Purpose |
|------|------|---------|
| ... | ... | ... |

### Credentials Required
| Service | Auth Type | Status |
|---------|-----------|--------|
| ... | ... | Exists / Needed |

### Data Schema
Input: {shape}
Output: {shape}
```

---

## STAGE 4: BUILD
**Goal**: Construct valid workflow JSON

### 4.1 Start with Trigger
```json
{
  "id": "trigger-1",
  "name": "Descriptive Name",
  "type": "n8n-nodes-base.{triggerType}",
  "typeVersion": {latest},
  "position": [250, 300],
  "parameters": { }
}
```

### 4.2 Add Processing Nodes
Each node MUST include error handling:
```json
{
  "onError": "continueErrorOutput",
  "retryOnFail": true,
  "maxTries": 3,
  "waitBetweenTries": 1000
}
```

### 4.3 Build Connections
```json
"connections": {
  "Node A": {
    "main": [[{"node": "Node B", "type": "main", "index": 0}]]
  }
}
```

### 4.4 Add Error Handler
REQUIRED for production:
```json
{
  "type": "n8n-nodes-base.errorTrigger",
  "name": "Error Handler"
}
```

### 4.5 Set Workflow Settings
```json
"settings": {
  "executionOrder": "v1",
  "saveManualExecutions": true,
  "saveDataErrorExecution": "all"
}
```

---

## STAGE 5: VALIDATE (Required - Never Skip)
**Goal**: Zero errors before deployment

### 5.1 Validate Each Node
```
mcp__n8n-mcp__validate_node_operation({
  nodeType: "{type}",
  config: {parameters}
})
```

### 5.2 Validate Full Workflow
```
mcp__n8n-mcp__validate_workflow({workflow: {...}})
```

### 5.3 Validate Connections
```
mcp__n8n-mcp__validate_workflow_connections({workflow: {...}})
```

### 5.4 Validate Expressions
```
mcp__n8n-mcp__validate_workflow_expressions({workflow: {...}})
```

### 5.5 Security Checklist
- [ ] No hardcoded API keys
- [ ] Credentials use n8n store references
- [ ] No PII in node names/notes
- [ ] Webhook paths are not guessable
- [ ] Sensitive data not logged

### Validation Report
```markdown
## Validation: {workflow name}

| Check | Status | Issues |
|-------|--------|--------|
| Nodes | ✅/❌ | |
| Workflow | ✅/❌ | |
| Connections | ✅/❌ | |
| Expressions | ✅/❌ | |
| Security | ✅/❌ | |

**Result**: READY / BLOCKED
```

---

## STAGE 6: SAVE TO DEV
**Goal**: Persist workflow for testing

### 6.1 Save Workflow JSON
```
Write to: workflows/dev/{workflow-name}.json
```

### 6.2 Git Commit
```bash
git add workflows/dev/{workflow-name}.json
git commit -m "[n8n] create: {workflow-name} - {description}"
```

### Deliverable
```markdown
## Development Artifact

**File**: workflows/dev/{name}.json
**Status**: Ready for testing
**Credentials needed**: {list}

### Test Instructions
1. Import to n8n instance
2. Configure credentials: {list}
3. Test with sample data: {example}
4. Verify output: {expected}
```

---

## STAGE 7: TEST
**Goal**: Verify workflow functions correctly

### 7.1 Deploy to Test Instance
```
mcp__n8n-mcp__n8n_create_workflow({...})
```
*When instance is available*

### 7.2 Execute Tests
- [ ] Manual trigger test
- [ ] Sample data test
- [ ] Edge case test
- [ ] Error path test

### 7.3 Verify Results
- [ ] Correct output produced
- [ ] Error handling works
- [ ] Notifications fire
- [ ] No data loss

---

## STAGE 8: STAGE FOR REVIEW
**Goal**: Pre-production checkpoint

### 8.1 Move to Staging
```bash
cp workflows/dev/{name}.json workflows/staging/
git add workflows/staging/{name}.json
git commit -m "[n8n] stage: {name} - Ready for review"
```

### 8.2 Review Checklist
- [ ] All tests pass
- [ ] Documentation complete
- [ ] Stakeholder approved (if required)
- [ ] Rollback plan ready

---

## STAGE 9: PRODUCTION DEPLOY
**Goal**: Live deployment with safety

### 9.1 Pre-Deploy Backup
If updating existing workflow:
```bash
cp workflows/production/{name}.json workflows/production/{name}.backup.json
```

### 9.2 Deploy
```
mcp__n8n-mcp__n8n_create_workflow({
  name: "...",
  nodes: [...],
  connections: {...}
})
```

### 9.3 Activate
⚠️ REQUIRE explicit user confirmation for activation

### 9.4 Archive
```bash
cp workflows/staging/{name}.json workflows/production/
git add workflows/production/{name}.json
git commit -m "[n8n] deploy: {name} - Production release"
git tag -a "workflow-{name}-v1.0" -m "Production deployment"
```

### 9.5 Post-Deploy Verification
- [ ] Workflow appears in instance
- [ ] Workflow is active
- [ ] First execution successful
- [ ] Monitoring in place

---

## STAGE 10: HANDOFF
**Goal**: Complete documentation for user

### Final Deliverable
```markdown
## Workflow Deployed: {name}

### Summary
{one-paragraph description}

### Location
- Instance: https://your-n8n-instance.com/workflow/{id}
- File: workflows/production/{name}.json
- Git tag: workflow-{name}-v1.0

### Trigger
{how to trigger the workflow}

### Credentials Used
| Service | Credential Name |
|---------|-----------------|
| ... | ... |

### Monitoring
- Error notifications go to: {channel}
- Execution logs: {location}

### Maintenance Notes
{any special considerations}

### Rollback Instructions
If issues occur:
1. Deactivate workflow in n8n
2. Restore: `git checkout workflow-{name}-v1.0~1 -- workflows/production/{name}.json`
3. Redeploy previous version
```

---

## Pipeline Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                     USER INTENT                               │
│              "I want to automate..."                          │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ STAGE 1: INTAKE                                               │
│ Parse requirements, confirm understanding                     │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ STAGE 2: DISCOVERY ⚠️ MANDATORY                               │
│ Search: Instance → Community (4,343) → Templates (2,709)     │
└──────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
┌─────────────────────┐     ┌─────────────────────────────────┐
│ FOUND: Adapt/Combine│     │ NOT FOUND: Build New            │
└─────────────────────┘     └─────────────────────────────────┘
              │                           │
              └─────────────┬─────────────┘
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ STAGE 3: DESIGN                                               │
│ Identify nodes, get configs, map flow                        │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ STAGE 4: BUILD                                                │
│ Construct JSON with error handling                           │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ STAGE 5: VALIDATE ⚠️ REQUIRED                                 │
│ Node → Workflow → Connections → Expressions → Security       │
└──────────────────────────────────────────────────────────────┘
                            │
                   ┌────────┴────────┐
                   ▼                 ▼
             ┌──────────┐      ┌──────────┐
             │ ✅ PASS  │      │ ❌ FAIL  │──→ Fix & Retry
             └──────────┘      └──────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│ STAGE 6: SAVE TO DEV                                          │
│ workflows/dev/{name}.json + git commit                       │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ STAGE 7: TEST                                                 │
│ Deploy to test instance, execute, verify                     │
└──────────────────────────────────────────────────────────────┘
                            │
                   ┌────────┴────────┐
                   ▼                 ▼
             ┌──────────┐      ┌──────────┐
             │ ✅ PASS  │      │ ❌ FAIL  │──→ Debug & Retry
             └──────────┘      └──────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────────┐
│ STAGE 8: STAGE FOR REVIEW                                     │
│ workflows/staging/ + stakeholder approval                    │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ STAGE 9: PRODUCTION DEPLOY                                    │
│ Backup → Deploy → Activate → Tag                             │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ STAGE 10: HANDOFF                                             │
│ Documentation, monitoring, rollback instructions             │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                  ✅ WORKFLOW LIVE                             │
│              Production automation running                    │
└──────────────────────────────────────────────────────────────┘
```

---

*This command orchestrates the complete pipeline. Individual stages can be run separately with their respective commands.*
