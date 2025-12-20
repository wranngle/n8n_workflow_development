---
name: n8n-workflow-dev
description: Master orchestrator for n8n workflow development. Contains the complete 21-step protocol from intent to production. Invokes specialized skills at each phase. Use when creating automation workflows, configuring nodes, validating JSON, or deploying to n8n instances.
---

# n8n Workflow Development Protocol v2.0

## PREAMBLE: Single Source of Truth

This skill is the **MASTER ORCHESTRATOR** for ALL n8n workflow development.
It contains the complete protocol organized in 7 phases (0-6).
You were directed here by the `detect-workflow-intent` hook.
Detected integrations are available at: `.claude/logs/detected-integrations.json`

**MANDATORY**: Execute this protocol in order. Do NOT skip steps.

---

## PROTOCOL OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 0: INTAKE (Steps I1-I5)                                           │
│ Detect integrations, retrieve docs, scaffold, generate curl tests       │
├─────────────────────────────────────────────────────────────────────────┤
│ PHASE 1: CALIBRATE (Steps 0-7)                                          │
│ Search all knowledge bases, estimate complexity, identify gaps          │
├─────────────────────────────────────────────────────────────────────────┤
│ PHASE 2: DESIGN (Steps 8-10)                                            │
│ Select patterns, analyze templates, create implementation plan          │
├─────────────────────────────────────────────────────────────────────────┤
│ PHASE 3: BUILD (Steps 11-14)                                            │
│ Configure nodes, write expressions/code, assemble JSON                  │
├─────────────────────────────────────────────────────────────────────────┤
│ PHASE 4: VALIDATE (Steps 15-16)                                         │
│ Iterative validation loop, security checklist                           │
├─────────────────────────────────────────────────────────────────────────┤
│ PHASE 5: TEST (Steps 17-18)                                             │
│ Save to dev, deploy to test instance, execute                           │
├─────────────────────────────────────────────────────────────────────────┤
│ PHASE 6: DEPLOY (Steps 19-21)                                           │
│ Stage for review, production deploy, git archive, update registry       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## PHASE 0: INTAKE (Steps I1-I4)

**Goal**: Comprehensive detection and context gathering BEFORE research.

### Step I1: DETECT INTEGRATIONS

Parse the request to extract ALL integrations across 4 categories:

| Category | What to Detect | Confidence |
|----------|----------------|------------|
| **Definitive** | Explicitly named apps/services | HIGH |
| **Possible** | Inferred from business context | MEDIUM |
| **Comparative** | Alternative SaaS that could work | LOW |
| **Repos** | GitHub repos, npm packages, SDKs | HIGH |

**Detection Method**:
```javascript
// 1. Search n8n nodes for each mentioned app
mcp__n8n-mcp__search_nodes({ query: "{detected_word}" })

// 2. Infer from business context
// "sync customer data" → CRM (hubspot, salesforce, pipedrive)
// "send notifications" → Communication (slack, email, sms)
// "store files" → Storage (s3, drive, dropbox)

// 3. Check for GitHub patterns
// /github.com\/[\w-]+\/[\w-]+/ or npm:{package}
```

**Output Format**:
```markdown
## Detected Integrations

### Definitive (explicitly named)
| Integration | Confidence | n8n Node Exists |
|-------------|------------|-----------------|
| {app} | HIGH | Yes/No |

### Possible (inferred)
| Integration | Inferred From | Category |
|-------------|---------------|----------|
| {app} | "{context clue}" | {category} |

### Comparative (alternatives)
| Primary | Alternatives |
|---------|--------------|
| {app} | {alt1}, {alt2}, {alt3} |

### Repositories
| Repo/Package | Purpose |
|--------------|---------|
| {repo} | {why needed} |
```

### Step I2: CHECK REGISTRY

Read `workflows/registry.yaml` to find:
1. Existing workflows that could be reused
2. Business processes this request maps to
3. Shared utilities that might apply

```javascript
// Read registry
Read("workflows/registry.yaml")

// Check for reuse opportunities:
// - Same integrations already used?
// - Similar workflow types exist?
// - Shared error handlers available?
```

**Output Format**:
```markdown
## Registry Analysis

### Reuse Candidates
| Existing Workflow | Relevance | Could Reuse |
|-------------------|-----------|-------------|
| {workflow} | {why relevant} | {component} |

### Business Process Mapping
- Maps to: {existing_process OR "NEW: {suggested_name}"}
- Related processes: {list}

### Available Shared Resources
- Error handlers: {list or "none"}
- Notification dispatchers: {list or "none"}
```

### Step I3: RETRIEVE DOCUMENTATION

For EACH detected integration, run the `/lookup-api` waterfall and CACHE results:

```javascript
// Invoke lookup-api for each integration
Skill("lookup-api", { service: "{integration_name}" })

// Cache location:
// workflows/{business_process}/{workflow_name}/docs/{integration}/
```

**Track documentation status**:
```markdown
## Documentation Status

| Integration | Retrieved | Source | Cached To |
|-------------|-----------|--------|-----------|
| {app} | Yes/Partial/No | {source} | {path} |
```

### Step I4: SCAFFOLD STRUCTURE

Create folder structure for this workflow:

```bash
workflows/
├── {business_process}/           # Create if new
│   ├── manifest.yaml             # Create/update
│   └── {workflow_name}/          # Create
│       ├── docs/                 # Documentation cache
│       │   └── {integration}/
│       ├── env/                  # Credential placeholders
│       │   └── .env.{integration}
│       ├── tests/                # Curl tests (created later)
│       └── README.md             # Workflow docs
```

**Env file template** (create for each integration needing credentials):
```bash
# .env.{integration}
# Auto-generated by n8n-workflow-dev
# Documentation: {docs_url}

# Required credentials - FILL BEFORE TESTING
API_KEY=
API_SECRET=
BASE_URL={detected_base_url}

# Optional
WEBHOOK_SECRET=
```

### Step I5: GENERATE CURL TESTS

For EACH integration with API endpoints, generate isolated curl tests.
These tests MUST pass before assembling the workflow.

**Test Structure**:
```bash
workflows/{business_process}/{workflow_name}/tests/
├── run-all-tests.sh          # Execute all tests in sequence
├── {integration}/
│   ├── 01-auth-test.sh       # Verify credentials work
│   ├── 02-{endpoint}.sh      # Test each required endpoint
│   └── response-schemas/     # Expected response shapes
│       └── {endpoint}.json
```

**Auth Test Template** (`01-auth-test.sh`):
```bash
#!/bin/bash
# Auth Test: {integration}
# Generated: {timestamp}
# Docs: {docs_path}

set -e

# Load credentials
source ../../env/.env.{integration}

echo "Testing authentication for {integration}..."

# OAuth2 Token Exchange
if [ -n "$OAUTH_CLIENT_ID" ]; then
  RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "client_id=$OAUTH_CLIENT_ID" \
    -d "client_secret=$OAUTH_CLIENT_SECRET" \
    -d "grant_type=client_credentials" \
    "$BASE_URL/oauth/token")

  ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.access_token')
  if [ "$ACCESS_TOKEN" == "null" ]; then
    echo "❌ FAIL: OAuth token exchange failed"
    echo "$RESPONSE"
    exit 1
  fi
  echo "✅ PASS: OAuth token obtained"
  exit 0
fi

# API Key Authentication
if [ -n "$API_KEY" ]; then
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $API_KEY" \
    "$BASE_URL/me" 2>/dev/null || echo "000")

  if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 401 ]; then
    # 401 means auth endpoint exists but key may be invalid
    echo "✅ PASS: API endpoint reachable (HTTP $HTTP_CODE)"
    if [ "$HTTP_CODE" -eq 401 ]; then
      echo "⚠️ WARNING: API key may be invalid or expired"
    fi
    exit 0
  else
    echo "❌ FAIL: Unexpected response (HTTP $HTTP_CODE)"
    exit 1
  fi
fi

echo "❌ FAIL: No credentials configured"
exit 1
```

**Endpoint Test Template** (`02-{endpoint}.sh`):
```bash
#!/bin/bash
# Test: {integration} - {endpoint_name}
# Method: {METHOD}
# Docs: {docs_path}

set -e

source ../../env/.env.{integration}

echo "Testing {endpoint_name}..."

# Make request
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X {METHOD} \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  {DATA_FLAG} \
  "$BASE_URL{endpoint}")

# Split response and status
HTTP_BODY=$(echo "$RESPONSE" | sed '$d')
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)

# Validate status code
if [ "$HTTP_CODE" -ne {expected_code} ]; then
  echo "❌ FAIL: Expected {expected_code}, got $HTTP_CODE"
  echo "$HTTP_BODY" | jq '.' 2>/dev/null || echo "$HTTP_BODY"
  exit 1
fi

# Validate response schema (if defined)
SCHEMA_FILE="response-schemas/{endpoint}.json"
if [ -f "$SCHEMA_FILE" ]; then
  # Check required fields exist
  REQUIRED_FIELDS=$(cat "$SCHEMA_FILE" | jq -r '.required[]?' 2>/dev/null)
  for field in $REQUIRED_FIELDS; do
    if ! echo "$HTTP_BODY" | jq -e ".$field" > /dev/null 2>&1; then
      echo "❌ FAIL: Missing required field: $field"
      exit 1
    fi
  done
fi

echo "✅ PASS: {endpoint_name}"
echo "$HTTP_BODY" | jq '.' 2>/dev/null | head -10
```

**Run All Tests Template** (`run-all-tests.sh`):
```bash
#!/bin/bash
# Run all tests for: {workflow_name}
# Generated: {timestamp}

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo " Running Integration Tests"
echo " Workflow: {workflow_name}"
echo "=========================================="
echo ""

PASS_COUNT=0
FAIL_COUNT=0

# Find all test scripts
for integration_dir in */; do
  if [ -d "$integration_dir" ]; then
    echo "--- Testing: ${integration_dir%/} ---"

    for test_script in "$integration_dir"*.sh; do
      if [ -f "$test_script" ]; then
        echo "Running: $test_script"
        if bash "$test_script"; then
          ((PASS_COUNT++))
        else
          ((FAIL_COUNT++))
        fi
        echo ""
      fi
    done
  fi
done

echo "=========================================="
echo " Results: $PASS_COUNT passed, $FAIL_COUNT failed"
echo "=========================================="

if [ $FAIL_COUNT -gt 0 ]; then
  echo "❌ Some tests failed. Fix issues before building workflow."
  exit 1
else
  echo "✅ All tests passed. Ready for workflow assembly."
  exit 0
fi
```

**Response Schema Template** (`response-schemas/{endpoint}.json`):
```json
{
  "description": "{endpoint_name} expected response",
  "required": ["{field1}", "{field2}"],
  "properties": {
    "{field1}": { "type": "string" },
    "{field2}": { "type": "object" }
  },
  "example": {
    // Paste actual response here after first successful test
  }
}
```

**Execute Tests Before Building**:
```bash
# Run all tests
cd workflows/{business_process}/{workflow_name}/tests
./run-all-tests.sh

# Expected output:
# ==========================================
#  Running Integration Tests
#  Workflow: {workflow_name}
# ==========================================
#
# --- Testing: hubspot ---
# Running: hubspot/01-auth-test.sh
# ✅ PASS: OAuth token obtained
#
# Running: hubspot/02-get-contacts.sh
# ✅ PASS: get-contacts
#
# ==========================================
#  Results: 2 passed, 0 failed
# ==========================================
# ✅ All tests passed. Ready for workflow assembly.
```

**Output after Phase 0**:
```markdown
## Intake Complete

- Integrations detected: {count}
- Documentation cached: {count}/{total}
- Business process: {name}
- Folder scaffolded: {path}
- Curl tests generated: {count}
- Registry updated: Yes/No

**Pre-Build Test Status**:
| Integration | Auth Test | Endpoint Tests | Status |
|-------------|-----------|----------------|--------|
| {app} | ✅ Pass | 2/2 Pass | Ready |
| {app} | ⚠️ Check credentials | Blocked | Manual action needed |

Proceeding to Phase 1: CALIBRATE...
```

---

## PHASE 1: CALIBRATE (Steps 0-7)

**Goal**: Research thoroughly BEFORE building anything.

### Step 0: PARSE INPUT → Search Vector

Extract from user request:
```yaml
primary_app:     # Main service (e.g., "Slack", "Gmail", "Webhook")
target_app:      # Destination (e.g., "Google Sheets", "Notion")
action_type:     # What to do (e.g., "sync", "notify", "transform")
trigger_type:    # How it starts (webhook | schedule | manual | event)
complexity_hint: # simple | moderate | complex | ai-agent
```

**Output Format**:
```markdown
## Search Vector
- Primary: {primary_app}
- Target: {target_app}
- Action: {action_type}
- Trigger: {trigger_type}
- Estimated Complexity: {complexity_hint}
```

### Step 0.5: VERIFY NODES → MIF Detection

Check if native n8n nodes exist for all required integrations:

```javascript
// For EACH app/service in the workflow:
mcp__n8n-mcp__search_nodes({ query: "{app_name}" })
```

**If node NOT found** (Missing Integration Flag = true):
1. Document the gap
2. Plan HTTP Request node with custom auth
3. Search for API documentation using this **FALLBACK CHAIN** (continue if each fails):

```javascript
// Step 1: Try Context7 (may have network issues - continue if fails)
mcp__context7__resolve-library-id({ libraryName: "{service} api" })
// If succeeds: mcp__context7__get-library-docs({ ... })

// Step 2: Try Ref tools (may return empty - continue if fails)
mcp__ref-tools__ref_search_documentation({ query: "{service} API documentation" })

// Step 3: Try Exa web search (usually succeeds)
mcp__exa__web_search_exa({ query: "{service} API integration documentation", numResults: 3 })

// Step 4: Last resort - WebSearch
WebSearch({ query: "{service} API docs REST endpoints" })
```

**NOTE**: External APIs may fail. The chain is designed to degrade gracefully.

**Output Format**:
```markdown
## Node Verification
| Service | Node Found? | Type | MIF |
|---------|-------------|------|-----|
| {app1} | ✅ Yes | nodes-base.{type} | - |
| {app2} | ❌ No | HTTP Request | ⚠️ API docs needed |
```

### Step 1: SEARCH OWN INSTANCE

```javascript
mcp__n8n-mcp__n8n_health_check()  // Verify connectivity first
mcp__n8n-mcp__n8n_list_workflows({ tags: ["{primary_app}"] })
```

**If instance offline**: Skip to Step 2, note "Instance Offline" in report.

### Step 2: SEARCH YOUTUBE KNOWLEDGE BASE

**Location**: `context/youtube-knowledge/video-index.json` (10,279 indexed videos)

Search by tags:
- Available tags: beginner, ai-agents, webhook, course, langchain, slack, telegram, whatsapp, chatbot, rag, memory, voice, multi-agent, error-handling, gmail, templates, business, no-code, self-host, workflow-builder

```javascript
// Read video index and search tagIndex for matching videos
// For promising matches, fetch transcripts:
mcp__youtube__transcripts_getTranscript({ videoId: "{VIDEO_ID}" })
```

**Top Videos by Topic Reference**:
| Topic | Video ID | Title |
|-------|----------|-------|
| Beginner | GIZzRGYpCbM | freeCodeCamp 6-hour course |
| AI Agents | ZHH3sr234zY | Nate Herk masterclass |
| Webhooks | lK3veuZAg0c | Nick Saraev beginner to pro |
| LangChain | 4o0AJYBEiBo | LangChain Code Node |
| Error Handling | Zy4cVtHJNvc | 5 production techniques |

### Step 3: SEARCH DISCORD KNOWLEDGE BASE

**Location**: `context/discord-knowledge/discord-questions.json` (2,930 Q&A)

Search the local keyword index first (instant, offline):
```javascript
// keyword-index.json maps keywords to question indexes
// Top topics: workflows (1,263), error-handling (560), ai-agents (509),
// http-requests (509), conditional (444), scheduling (333)
```

**Fallback for real-time** (if needed):
```javascript
// mcp__discord tools (requires DISCORD_TOKEN)
// Target: n8n Discord (discord.gg/n8n)
// Channels: #support, #general, #showcase, #integrations
```

### Step 4: SEARCH REDDIT KNOWLEDGE BASE

```javascript
mcp__reddit__fetch_reddit_hot_threads({ subreddit: "n8n", limit: 10 })
// Related: selfhosted, homeautomation, nocode
```

Search for: deployment experiences, self-hosting configs, community workarounds.

### Step 5: SEARCH COMMUNITY LIBRARY

**Primary** (GitHub API - always works):
```javascript
WebFetch({
  url: "https://api.github.com/repos/Zie619/n8n-workflows/contents/workflows/{Category}",
  prompt: "Find workflows matching: {search_vector}"
})

// Categories: Slack, Airtable, Googlesheets, Hubspot, Openai, Discord, Notion, etc.
```

**Get Full Workflow**:
```javascript
WebFetch({
  url: "https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/{Category}/{file}.json",
  prompt: "Analyze workflow structure, extract reusable patterns"
})
```

### Step 6: SEARCH MCP TEMPLATES

```javascript
mcp__n8n-mcp__search_templates({ query: "{search_vector.action_type}", limit: 10 })
mcp__n8n-mcp__list_node_templates({
  nodeTypes: ["n8n-nodes-base.{primary_app}", "n8n-nodes-base.{target_app}"]
})
```

### Step 7: CALCULATE METRICS & DECISION

**Compute**:
- **TAS** (Template Alignment Score): 0-10, how well templates match requirements
- **RNC** (Required Node Count): Number of nodes needed
- **MIF** (Missing Integration Flag): true/false, any apps without native nodes
- **Risk**: LOW | MEDIUM | HIGH | CRITICAL

**Decision Matrix**:
```markdown
## Calibration Report

### Metrics
| Metric | Value | Interpretation |
|--------|-------|----------------|
| TAS | {0-10} | {description} |
| RNC | {count} | {simple/moderate/complex} |
| MIF | {true/false} | {if true, list gaps} |
| Risk | {level} | {reason} |

### Search Results Summary
- Instance: {count} similar workflows found
- YouTube: {count} relevant tutorials
- Discord: {count} matching Q&A
- Community: {count} reusable workflows
- Templates: {count} matching templates

### Recommendation
○ **ADAPT**: Use {workflow/template} as base - {X}% structure reusable
○ **COMBINE**: Merge {source A} trigger + {source B} processing
○ **BUILD NEW**: No suitable base found (explain why)

### Best Match for Adaptation
{workflow name} from {source}
- Match Score: {X}/10
- Reusable Nodes: {list}
- Required Modifications: {list}
```

---

## PHASE 2: DESIGN (Steps 8-10)

**Goal**: Architecture before code.

### Step 8: SELECT PATTERN

**Invoke**: `Skill("n8n-workflow-patterns")`

This skill provides 5 proven workflow patterns:
1. **Webhook Processing** - Real-time event handling
2. **Scheduled Sync** - Periodic data synchronization
3. **API Integration** - Service-to-service communication
4. **AI Agent Workflow** - LangChain/LLM orchestration
5. **Data Pipeline** - ETL and transformation

**Output**: Selected pattern with rationale.

### Step 9: RETRIEVE & ANALYZE TEMPLATE

If Step 7 identified a good template match:
```javascript
mcp__n8n-mcp__get_template({ templateId: {id} })
```

**Deep Analysis Required**:
```markdown
## Template Analysis: {template_name}

### Node Inventory
| Node | Type | Reusable? | Modification Needed |
|------|------|-----------|---------------------|
| {name} | {type} | Yes/No | {description} |

### Connection Flow
{Trigger} → {Node A} → {Node B} → ... → {Output}

### Reusable Code Snippets
```json
{extracted configurations to copy}
```

### Adaptation Plan
1. Keep: {nodes to keep as-is}
2. Modify: {nodes needing changes}
3. Add: {new nodes required}
4. Remove: {unnecessary nodes}
```

### Step 10: CREATE IMPLEMENTATION PLAN

**Output Format**:
```markdown
## Implementation Plan: {workflow_name}

### Architecture
```
[Trigger] → [Process A] → [Condition] → [Branch A]
                                      → [Branch B]
                             ↓ (error)
                      [Error Handler] → [Alert]
```

### Node List
| # | Name | Type | Purpose |
|---|------|------|---------|
| 1 | {name} | {type} | {purpose} |
| 2 | ... | ... | ... |

### Credentials Required
| Service | Auth Type | Status |
|---------|-----------|--------|
| {service} | {OAuth/API Key} | Exists/Needed |

### Data Flow
- Input Shape: {schema}
- Transformations: {list}
- Output Shape: {schema}

### Error Handling Strategy
- Node-level: {approach}
- Workflow-level: {approach}
- Notifications: {channel}
```

---

## PHASE 3: BUILD (Steps 11-14)

**Goal**: Construct valid workflow JSON.

### Step 11: CONFIGURE NODES

**Invoke**: `Skill("n8n-node-configuration")`
**Also Use**: `Skill("n8n-mcp-tools-expert")` for tool selection

For EACH node in the implementation plan:

```javascript
// STEP 1: Check task templates FIRST (pre-configured, battle-tested)
mcp__n8n-mcp__list_tasks()
mcp__n8n-mcp__get_node_for_task({ task: "{matching_task}" })

// STEP 2: VALIDATE IMMEDIATELY (task templates may be outdated)
mcp__n8n-mcp__validate_node_operation({
  nodeType: "nodes-base.{type}",
  config: taskTemplateConfig,
  profile: "runtime"
})
// If validation fails → USE THE VALIDATOR'S "examples" field as source of truth!

// STEP 3: Only if no task template exists:
mcp__n8n-mcp__get_node_essentials({ nodeType: "nodes-base.{type}" })

// STEP 4: Only if essentials insufficient:
mcp__n8n-mcp__get_node_info({ nodeType: "nodes-base.{type}" })
```

**CRITICAL**: Task templates may lag behind node version updates. The **validator's examples** are always current. If a task template fails validation, copy the config from the validator's `examples` array instead.

**Task Template Categories** (29 available):
- HTTP/API, Webhooks, Database, AI/LangChain, Data Processing, Communication, Error Handling

**Node Structure Template**:
```json
{
  "id": "unique-id",
  "name": "Descriptive Name",
  "type": "n8n-nodes-base.{type}",
  "typeVersion": {latest},
  "position": [x, y],
  "parameters": { },
  "credentials": {
    "{credType}": { "id": "{id}", "name": "{name}" }
  },
  "onError": "continueErrorOutput",
  "retryOnFail": true,
  "maxTries": 3,
  "waitBetweenTries": 1000
}
```

### Step 12: WRITE EXPRESSIONS

**Invoke**: `Skill("n8n-expression-syntax")`

**Key Syntax**:
```javascript
// Current item data
{{ $json.fieldName }}

// Access by node name
{{ $('Node Name').item.json.field }}

// Webhook data (IMPORTANT: body is nested!)
{{ $json.body.fieldName }}  // NOT $json.fieldName

// Date/time
{{ $now.toISO() }}
{{ DateTime.now().minus({ days: 7 }).toISO() }}

// Conditional
{{ $json.status === 'active' ? 'Yes' : 'No' }}
```

### Step 13: WRITE CODE NODES (If Needed)

**Invoke**: `Skill("n8n-code-javascript")` (preferred)
**Or**: `Skill("n8n-code-python")` (only when explicitly required)

**JavaScript Code Node Pattern**:
```javascript
// Mode: "Run Once for All Items" (default)
// Access input data
const items = $input.all();

// Process
const results = items.map(item => ({
  json: {
    // transformed data
  }
}));

// MUST return array of objects with json property
return results;
```

**Available in Code Nodes**:
- `$input`, `$json`, `$node`, `$workflow`, `$env`
- `DateTime` (Luxon), `$jmespath`, `crypto`
- HTTP requests via `$http.get()`, `$http.post()`

### Step 14: ASSEMBLE WORKFLOW JSON

**Complete Workflow Structure**:
```json
{
  "name": "Descriptive Workflow Name",
  "nodes": [
    // All configured nodes from Steps 11-13
  ],
  "connections": {
    "Node A": {
      "main": [[{ "node": "Node B", "type": "main", "index": 0 }]]
    }
  },
  "settings": {
    "executionOrder": "v1",
    "saveManualExecutions": true,
    "saveDataErrorExecution": "all"
  }
}
```

**AI Workflow Connections** (CRITICAL - Reverse Pattern):
```javascript
// AI tools connect TO the agent, not FROM it!
{
  "HTTP Request Tool": {
    "ai_tool": [[{ "node": "AI Agent", "type": "ai_tool", "index": 0 }]]
  },
  "OpenAI Chat Model": {
    "ai_languageModel": [[{ "node": "AI Agent", "type": "ai_languageModel", "index": 0 }]]
  }
}
```

**8 AI Connection Types**: `ai_tool`, `ai_memory`, `ai_chain`, `ai_document`, `ai_embedding`, `ai_languageModel`, `ai_outputParser`, `ai_retriever`

---

## PHASE 4: VALIDATE (Steps 15-16)

**Goal**: Zero errors before deployment.

### Step 15: ITERATIVE VALIDATION LOOP

**Invoke**: `Skill("n8n-validation-expert")`

**Validation Sequence**:
```javascript
// 1. Validate each node individually
for (const node of workflow.nodes) {
  mcp__n8n-mcp__validate_node_operation({
    nodeType: node.type,
    config: node.parameters,
    profile: "ai-friendly"
  })
}

// 2. Validate full workflow
mcp__n8n-mcp__validate_workflow({ workflow: {...} })

// 3. Validate connections
mcp__n8n-mcp__validate_workflow_connections({ workflow: {...} })

// 4. Validate expressions
mcp__n8n-mcp__validate_workflow_expressions({ workflow: {...} })
```

**Validation Profiles**:
- `minimal` - Only required fields
- `runtime` - Critical errors only (default for deployment)
- `ai-friendly` - Balanced (recommended)
- `strict` - All checks including best practices

**Loop Until Pass**:
```
┌──────────────────┐
│ Run Validation   │
└────────┬─────────┘
         │
    ┌────▼────┐
    │ Errors? │──Yes──→ Fix Errors → Loop Back
    └────┬────┘
         │ No
         ▼
   ┌──────────────┐
   │ PASS - Step 16│
   └──────────────┘
```

### Step 16: SECURITY CHECKLIST

**MANDATORY before any deployment**:

- [ ] **No hardcoded API keys** in workflow JSON
- [ ] **Credentials use n8n store** references (`{ "id": "...", "name": "..." }`)
- [ ] **No PII in node names** or notes
- [ ] **Webhook paths are not guessable** (use UUIDs if possible)
- [ ] **Sensitive data not logged** in expressions
- [ ] **Input validation** on webhook triggers
- [ ] **Rate limiting** considered for public webhooks

**Output Format**:
```markdown
## Validation Report

### Node Validation
| Node | Status | Issues |
|------|--------|--------|
| {name} | ✅ Pass | - |
| {name} | ⚠️ Warning | {issue} |

### Workflow Validation
| Check | Status |
|-------|--------|
| Structure | ✅/❌ |
| Connections | ✅/❌ |
| Expressions | ✅/❌ |

### Security Checklist
| Check | Status |
|-------|--------|
| No hardcoded keys | ✅/❌ |
| Credentials stored | ✅/❌ |
| No PII exposure | ✅/❌ |

**Result**: READY FOR DEPLOYMENT / BLOCKED (list issues)
```

---

## PHASE 5: TEST (Steps 17-18)

**Goal**: Verify workflow works correctly.

### Step 17: SAVE TO DEV

```bash
# Save workflow JSON to dev environment
workflows/dev/{workflow-name}.json
```

**File Naming Convention**: `{action}-{source}-to-{target}.json`
Examples: `sync-slack-to-sheets.json`, `notify-webhook-to-email.json`

### Step 18: DEPLOY TO TEST INSTANCE

```javascript
// Deploy to n8n (creates inactive workflow)
mcp__n8n-mcp__n8n_create_workflow({
  name: "{workflow_name}",
  nodes: [...],
  connections: {...},
  settings: {...}
})
```

**Test Execution**:
1. **Manual trigger test** - Activate and trigger manually
2. **Sample data test** - Send test payload
3. **Error path test** - Send malformed data to verify error handling
4. **Edge case test** - Empty arrays, null values, large payloads

**For Webhook Workflows**:
```javascript
mcp__n8n-mcp__n8n_trigger_webhook_workflow({
  webhookUrl: "{full_webhook_url}",
  httpMethod: "POST",
  data: { /* test payload */ },
  waitForResponse: true
})
```

---

## PHASE 6: DEPLOY (Steps 19-21)

**Goal**: Production deployment with safety.

### Step 19: STAGE FOR REVIEW

```bash
# Move to staging
cp workflows/dev/{name}.json workflows/staging/

# Git commit
git add workflows/staging/{name}.json
git commit -m "[n8n] stage: {name} - Ready for review"
```

**Review Checklist**:
- [ ] All tests pass
- [ ] Documentation complete
- [ ] Stakeholder approved (if required)
- [ ] Rollback plan ready

### Step 20: PRODUCTION DEPLOY

**Pre-Deploy Hook Triggered**: `pre-deploy-check.js` validates before deployment.

**Backup Existing** (if updating):
```bash
cp workflows/production/{name}.json workflows/production/{name}.backup.json
```

**Deploy**:
```javascript
// New workflow
mcp__n8n-mcp__n8n_create_workflow({...})

// OR Update existing (prefer partial updates - 80-90% token savings)
mcp__n8n-mcp__n8n_update_partial_workflow({
  id: "{workflow_id}",
  operations: [
    { type: "updateNode", nodeId: "...", updates: {...} },
    { type: "addConnection", source: "A", target: "B" }
  ]
})
```

**⚠️ ACTIVATION requires explicit user confirmation**

### Step 21: ARCHIVE & DOCUMENT

```bash
# Archive to production
cp workflows/staging/{name}.json workflows/production/

# Git commit with tag
git add workflows/production/{name}.json
git commit -m "[n8n] deploy: {name} - Production release"
git tag -a "workflow-{name}-$(date +%Y%m%d)" -m "Production deployment"
```

**Post-Deploy Hook Triggered**: `post-deploy-log.js` records deployment.

**Final Deliverable**:
```markdown
## Workflow Deployed: {name}

### Summary
{One-paragraph description of what this workflow does}

### Location
- Instance: {instance_url}/workflow/{id}
- File: workflows/production/{name}.json
- Git Tag: workflow-{name}-{date}

### Trigger
{How to trigger: webhook URL, schedule, manual}

### Credentials Required
| Service | Credential Name |
|---------|-----------------|
| {service} | {cred_name} |

### Monitoring
- Error notifications: {channel}
- Execution logs: {location}

### Rollback Instructions
If issues occur:
1. Deactivate workflow in n8n
2. Restore: `git checkout workflow-{name}-{previous_tag} -- workflows/production/{name}.json`
3. Redeploy previous version
```

---

## SKILL INVOCATION MAP

Reference for which skills to invoke at each step:

| Step | Condition | Invoke |
|------|-----------|--------|
| 8 | Always | `Skill("n8n-workflow-patterns")` |
| 11 | Always | `Skill("n8n-node-configuration")` |
| 11 | Using MCP tools | `Skill("n8n-mcp-tools-expert")` |
| 12 | Has expressions | `Skill("n8n-expression-syntax")` |
| 13 | Has Code nodes (JS) | `Skill("n8n-code-javascript")` |
| 13 | Has Code nodes (Python) | `Skill("n8n-code-python")` |
| 15 | Always | `Skill("n8n-validation-expert")` |

---

## KNOWLEDGE BASE REFERENCES

| Source | Location | Contents |
|--------|----------|----------|
| YouTube | `context/youtube-knowledge/video-index.json` | 10,279 indexed tutorials |
| Discord | `context/discord-knowledge/discord-questions.json` | 2,930 Q&A from community |
| Reddit | `mcp__reddit` tools | r/n8n, r/selfhosted |
| Community | GitHub Zie619/n8n-workflows | 4,343 community workflows |
| Templates | `mcp__n8n-mcp__search_templates` | 2,709 official templates |
| Patterns | `context/workflow-patterns/` | Reusable analysis files |
| API Docs | `context/api-docs/` | Cached documentation |

---

## QUICK REFERENCE

### Node Type Format
- For MCP tools: `nodes-base.{name}` (e.g., `nodes-base.httpRequest`)
- For workflow JSON: `n8n-nodes-base.{name}` (e.g., `n8n-nodes-base.httpRequest`)
- AI nodes: `@n8n/n8n-nodes-langchain.{name}`

### Git Commit Format
`[n8n] {action}: {workflow-name} - {description}`

Actions: `create`, `update`, `fix`, `deploy`, `stage`, `archive`

### File Locations
- Development: `workflows/dev/`
- Staging: `workflows/staging/`
- Production: `workflows/production/`

---

*Protocol Version: 2.0*
*Last Updated: 2025-12-17*
