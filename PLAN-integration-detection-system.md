# Integration Detection & Cohesive Workflow System

## Problem Statement

Current n8n development system builds workflows in isolation without:
- Comprehensive integration detection
- Documentation retrieval and caching
- Business process hierarchy
- Relationship tracking between workflows
- Isolated API testing before assembly
- YouTube knowledge utilization

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          WORKFLOW REQUEST INTAKE                             │
│                                                                              │
│  User Request                                                                │
│       │                                                                      │
│       ▼                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ PHASE 0: INTEGRATION DETECTION                                       │    │
│  │ Parse request → Extract all integrations across 4 categories:        │    │
│  │ • Definitive Apps (explicitly named)                                 │    │
│  │ • Possible Apps (inferred from context)                              │    │
│  │ • Comparative SaaS (alternatives)                                    │    │
│  │ • GitHub Repos (SDKs, community integrations)                        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│       │                                                                      │
│       ▼                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ PHASE 1: DOCUMENTATION RETRIEVAL                                     │    │
│  │ For each integration:                                                │    │
│  │ • API docs (endpoints, auth, rate limits)                            │    │
│  │ • UI docs (user-facing features)                                     │    │
│  │ • SDK references                                                     │    │
│  │ • YouTube tutorials (channel knowledge)                              │    │
│  │ Cache to: workflows/{business_process}/{workflow}/docs/              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│       │                                                                      │
│       ▼                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ PHASE 2: BUSINESS PROCESS MAPPING                                    │    │
│  │ • Check registry.yaml for existing processes                         │    │
│  │ • Identify reuse opportunities                                       │    │
│  │ • Map many-to-many relationships                                     │    │
│  │ • Create folder structure                                            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│       │                                                                      │
│       ▼                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ PHASE 3: ISOLATED TESTING                                            │    │
│  │ For each endpoint:                                                   │    │
│  │ • Generate curl test script                                          │    │
│  │ • Create .env file with placeholders                                 │    │
│  │ • Execute with real credentials                                      │    │
│  │ • Validate response schemas                                          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│       │                                                                      │
│       ▼                                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ PHASE 4: WORKFLOW ASSEMBLY                                           │    │
│  │ • Invoke existing n8n-workflow-dev skill                             │    │
│  │ • Reference retrieved docs                                           │    │
│  │ • Build with tested endpoints only                                   │    │
│  │ • Update registry.yaml                                               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component 1: Integration Detection System

### New Skill: `n8n-integration-detector`

**Location**: `.claude/skills/n8n-integration-detector/SKILL.md`

**Detection Categories**:

| Category | Detection Method | Confidence |
|----------|------------------|------------|
| Definitive Apps | Exact match against known app list + n8n node search | HIGH |
| Possible Apps | NLP inference from business context | MEDIUM |
| Comparative SaaS | Category matching (e.g., "CRM" → Salesforce, HubSpot, Pipedrive) | MEDIUM |
| GitHub Repos | Pattern match `/github.com/`, SDK references, library names | HIGH |

**Known Apps Database**:
```yaml
# Source: n8n-mcp nodes + common SaaS
apps:
  crm: [salesforce, hubspot, pipedrive, zoho, monday]
  communication: [slack, discord, telegram, twilio, sendgrid]
  storage: [google-drive, dropbox, s3, azure-blob]
  database: [postgres, mysql, mongodb, supabase, airtable]
  automation: [zapier, make, n8n, power-automate]
  ai: [openai, anthropic, gemini, huggingface, replicate]
  # ... 500+ integrations from n8n node database
```

**Detection Algorithm**:
```javascript
function detectIntegrations(request) {
  const detected = {
    definitive: [],   // Explicitly named
    possible: [],     // Inferred
    comparative: [],  // Alternatives
    repos: []         // GitHub/npm packages
  };

  // Step 1: Exact match against n8n nodes
  for (const word of tokenize(request)) {
    const nodeMatch = await mcp__n8n-mcp__search_nodes({ query: word });
    if (nodeMatch.results.some(r => r.relevance === 'high')) {
      detected.definitive.push({
        name: word,
        confidence: 'high',
        source: 'n8n-node-match'
      });
    }
  }

  // Step 2: NLP inference for business context
  // "sync customer data" → CRM system
  // "send notifications" → Communication platform
  // "store files" → Storage service

  // Step 3: GitHub pattern matching
  const repoPattern = /github\.com\/[\w-]+\/[\w-]+|npm:[\w-]+/g;
  const repos = request.match(repoPattern);

  // Step 4: Comparative lookup
  for (const app of detected.definitive) {
    const category = getCategory(app.name);
    detected.comparative.push(...getAlternatives(category));
  }

  return detected;
}
```

---

## Component 2: Documentation Retrieval System

### Enhanced `/lookup-api` Command

**Current State**: Single service lookup, no caching
**Enhanced State**: Batch lookup, structured caching, YouTube integration

**Retrieval Waterfall** (per integration):
```
1. n8n Node Documentation (if exists)
   └── mcp__n8n-mcp__get_node_documentation

2. Context7 SDK/Library
   └── mcp__context7__resolve-library-id → get-library-docs

3. Ref Tools Search
   └── mcp__ref-tools__ref_search_documentation

4. YouTube Channel Knowledge
   └── Search indexed channels: Sean Kochel, n8n official, Nate Herk
   └── Fetch transcripts for relevant tutorials

5. Exa Deep Research
   └── mcp__exa__deep_researcher_start (if all else fails)

6. GitHub README/Wiki
   └── WebFetch on repo documentation
```

**Caching Structure**:
```
workflows/{business_process}/{workflow}/docs/
├── {integration}/
│   ├── api-reference.md        # Endpoints, methods, auth
│   ├── ui-features.md          # User-facing docs
│   ├── sdk-reference.md        # Language-specific
│   ├── tutorials.md            # YouTube summaries
│   └── curl-examples/
│       ├── auth-test.sh
│       ├── get-resource.sh
│       └── post-resource.sh
└── retrieval-log.json          # What was found where
```

---

## Component 3: Folder Structure & Registry

### New Folder Hierarchy

**Current**:
```
workflows/
├── dev/
│   └── *.json (flat)
├── staging/
└── production/
```

**Enhanced**:
```
workflows/
├── registry.yaml                    # Global relationship map
├── {business_process}/
│   ├── manifest.yaml                # Process metadata
│   ├── {workflow_name}/
│   │   ├── docs/                    # Cached documentation
│   │   ├── env/
│   │   │   └── .env.{integration}   # Credential placeholders
│   │   ├── tests/
│   │   │   └── curl_*.sh            # Isolated API tests
│   │   ├── workflow.json            # n8n export
│   │   └── README.md                # Workflow documentation
│   └── shared/                      # Reusable subworkflows
│       ├── error-handler.json
│       └── notification-dispatch.json
└── _templates/                      # Starter templates
    ├── webhook-listener/
    ├── item-processor/
    └── scheduled-sync/
```

### Registry Schema

**`workflows/registry.yaml`**:
```yaml
version: "1.0"
last_updated: "2025-12-20T00:00:00Z"

business_processes:
  customer_onboarding:
    description: "New customer setup and welcome flow"
    workflows:
      - webhook_listener_crm
      - customer_welcome_email
      - provision_accounts
    integrations: [hubspot, sendgrid, stripe]

  order_fulfillment:
    description: "Order processing and shipping"
    workflows:
      - order_webhook
      - inventory_check
      - shipping_dispatch
      - customer_notification
    integrations: [shopify, shippo, sendgrid]

workflows:
  webhook_listener_crm:
    path: "customer_onboarding/webhook_listener_crm"
    serves_processes: [customer_onboarding, lead_scoring]
    depends_on: []
    enables: [customer_welcome_email, provision_accounts]
    type: "webhook_listener"

  customer_welcome_email:
    path: "customer_onboarding/customer_welcome_email"
    serves_processes: [customer_onboarding]
    depends_on: [webhook_listener_crm]
    enables: []
    type: "notification"

integrations:
  hubspot:
    used_by: [webhook_listener_crm, lead_scoring]
    docs_cached: "2025-12-20"
    credential_env: ".env.hubspot"

  sendgrid:
    used_by: [customer_welcome_email, customer_notification]
    docs_cached: "2025-12-19"
    credential_env: ".env.sendgrid"
```

### Manifest Schema

**`workflows/{process}/manifest.yaml`**:
```yaml
process: customer_onboarding
description: "New customer setup and welcome flow"
created: "2025-12-20"
owner: "automation-team"

workflows:
  - name: webhook_listener_crm
    type: webhook_listener
    trigger: hubspot.contact.created
    status: production

  - name: customer_welcome_email
    type: notification
    trigger: internal
    status: staging

integrations_required:
  - name: hubspot
    auth_type: oauth2
    env_file: env/.env.hubspot

  - name: sendgrid
    auth_type: api_key
    env_file: env/.env.sendgrid

reuse_candidates:
  - workflows/shared/error-handler.json
  - workflows/shared/notification-dispatch.json
```

---

## Component 4: Curl Test Generation

### New Skill: `n8n-api-tester`

**Purpose**: Generate and execute isolated curl tests before workflow assembly

**Test Template**:
```bash
#!/bin/bash
# Test: {integration} - {endpoint_name}
# Generated: {timestamp}
# Docs: {docs_path}

set -e

# Load credentials
source ../env/.env.{integration}

# Execute request
curl -X {METHOD} \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{request_body}' \
  "{base_url}{endpoint}" \
  -o response.json \
  -w "%{http_code}" | tee status.txt

# Validate response
HTTP_STATUS=$(cat status.txt)
if [ "$HTTP_STATUS" -ne 200 ]; then
  echo "FAIL: Expected 200, got $HTTP_STATUS"
  exit 1
fi

echo "PASS: {endpoint_name}"
```

**Env File Template**:
```bash
# .env.{integration}
# Documentation: {docs_url}
# Setup instructions: {auth_setup}

# Required credentials
API_KEY=your_api_key_here
API_SECRET=your_api_secret_here
BASE_URL=https://api.{integration}.com

# Optional
WEBHOOK_SECRET=
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
```

---

## Component 5: YouTube Knowledge Integration

### Channel Index

**Priority Channels**:
| Channel | Focus | Video Count | Index Status |
|---------|-------|-------------|--------------|
| n8n Official | Official tutorials | 200+ | context/youtube-knowledge |
| Sean Kochel | Advanced patterns | 100+ | TO INDEX |
| Nate Herk | AI agents | 50+ | context/youtube-knowledge |
| Nick Saraev | Beginner-advanced | 100+ | context/youtube-knowledge |

### Indexing Strategy

```javascript
// Fetch channel videos
async function indexChannel(channelId) {
  const videos = await fetchChannelVideos(channelId);

  for (const video of videos) {
    // Get transcript
    const transcript = await mcp__youtube__transcripts_getTranscript({
      videoId: video.id
    });

    // Extract structured knowledge
    const knowledge = {
      videoId: video.id,
      title: video.title,
      topics: extractTopics(transcript),
      integrations: detectIntegrations(transcript),
      patterns: extractPatterns(transcript),
      codeSnippets: extractCode(transcript)
    };

    // Save to index
    saveToIndex(knowledge);
  }
}
```

### Search Integration

When documentation retrieval runs, also search YouTube index:
```javascript
// In documentation waterfall
const youtubeKnowledge = searchYouTubeIndex({
  integration: integrationName,
  topics: ['authentication', 'webhooks', 'best-practices']
});

if (youtubeKnowledge.length > 0) {
  // Include tutorial summaries in docs cache
  saveToDocs(`${docsPath}/tutorials.md`, youtubeKnowledge);
}
```

---

## Component 6: Hook Enhancement

### Updated `detect-workflow-intent.js`

Add new category for development requests:

```javascript
const WORKFLOW_KEYWORDS = {
  // ... existing categories ...

  // Development request indicators - triggers full detection
  development: [
    'build workflow', 'create automation', 'integrate with',
    'connect to', 'sync data', 'automate process',
    'development request', 'new workflow for'
  ]
};

// When development keywords detected:
// 1. Run integration detection BEFORE skill invocation
// 2. Cache detected integrations to session state
// 3. Pass to skill for documentation retrieval
```

---

## Implementation Order

### Phase 1: Foundation (Priority: HIGH)
1. Create `registry.yaml` at workflow root
2. Create folder structure templates
3. Enhance `/lookup-api` with caching

### Phase 2: Detection (Priority: HIGH)
4. Create `n8n-integration-detector` skill
5. Update hook to run detection first
6. Build known apps database from n8n-mcp

### Phase 3: Testing (Priority: MEDIUM)
7. Create `n8n-api-tester` skill
8. Generate curl templates
9. Create env file templates

### Phase 4: YouTube (Priority: MEDIUM)
10. Index Sean Kochel channel
11. Enhance video index with integration tags
12. Integrate into documentation waterfall

### Phase 5: Cohesion (Priority: HIGH)
13. Build registry update automation
14. Create reuse opportunity detection
15. Implement many-to-many relationship tracking

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Integration detection accuracy | >90% of apps in request detected |
| Documentation coverage | 100% of detected integrations have cached docs |
| Test coverage | Curl test for each unique endpoint |
| Reuse identification | Existing workflows suggested when applicable |
| Orphan prevention | All workflows linked to business process |

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `.claude/skills/n8n-integration-detector/SKILL.md` | CREATE | Detection logic |
| `.claude/skills/n8n-api-tester/SKILL.md` | CREATE | Curl test generation |
| `.claude/commands/lookup-api.md` | MODIFY | Add caching, batch mode |
| `.claude/hooks/detect-workflow-intent.js` | MODIFY | Run detection first |
| `workflows/registry.yaml` | CREATE | Global relationship map |
| `workflows/_templates/` | CREATE | Starter templates |
| `context/youtube-knowledge/sean-kochel/` | CREATE | Channel index |
