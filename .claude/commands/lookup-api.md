---
description: Find API documentation for a service using the documentation waterfall
---

# /lookup-api - Find API Documentation for Integration

Find comprehensive API documentation for a service/integration using the documentation waterfall.
Supports single service lookup, batch mode for multiple services, and automatic caching.

## Parameters

### Single Service Mode (default)
- `service`: Name of the service/API to look up

### Batch Mode
- `services`: Comma-separated list of services (e.g., "slack, hubspot, stripe")
- `business_process`: (optional) Business process name for folder organization
- `workflow`: (optional) Workflow name for folder organization

### Caching Options
- `cache`: Where to save docs. Options:
  - `registry` (default): Cache to `context/api-docs/{service}/` and update registry
  - `workflow`: Cache to `workflows/{business_process}/{workflow}/docs/{service}/`
  - `none`: Don't cache, just return results

## Usage Examples

```
/lookup-api hubspot
/lookup-api services=slack,hubspot,stripe
/lookup-api services=hubspot,stripe business_process=customer_onboarding workflow=welcome_flow
```

---

## Batch Mode Execution

When multiple services are provided:

```javascript
// Parse services from comma-separated list
const services = parseServices(input);

// Run waterfall for each service IN PARALLEL when possible
for (const service of services) {
  // Execute waterfall steps 1-5 (below)
  const docs = await executeWaterfall(service);

  // Cache results based on cache option
  await cacheDocumentation(docs, {
    service,
    businessProcess,
    workflow,
    cacheMode
  });

  // Update registry.yaml
  await updateRegistry(service, docs);
}
```

---

## Execution Waterfall (Per Service)

### Step 1: Check for Existing n8n Node
```
mcp__n8n-mcp__search_nodes({query: "{service}"})
```
If found: Get node documentation
```
mcp__n8n-mcp__get_node_documentation({nodeType: "nodes-base.{found-node}"})
```

### Step 2: Check Context7 for SDK/Library
```
mcp__context7__resolve-library-id({libraryName: "{service}"})
```
If found:
```
mcp__context7__get-library-docs({
  context7CompatibleLibraryID: "{resolved-id}",
  tokens: 15000
})
```

### Step 3: Search Ref for Documentation
```
mcp__ref-tools__ref_search_documentation({
  query: "{service} API documentation authentication endpoints"
})
```
If found, read the best result:
```
mcp__ref-tools__ref_read_url({url: "{best-result-url}"})
```

### Step 4: Exa Deep Research
If still not found:
```
mcp__exa__deep_researcher_start({
  instructions: "Find complete REST API documentation for {service} including: authentication methods, base URL, available endpoints, request/response formats, rate limits, and code examples",
  model: "exa-research"
})
```
Then check results:
```
mcp__exa__deep_researcher_check({taskId: "{task-id}"})
```

### Step 5: Direct Web Search
As last resort:
```
WebSearch: "{service} API documentation REST endpoints authentication"
```
Then fetch promising results:
```
WebFetch on official docs URL
```

## Output Format

```markdown
## API Documentation: {service}

### Source
Found via: [n8n Node / Context7 / Ref / Exa / Web Search]
Documentation URL: {url}

### Authentication
Method: [OAuth2 / API Key / Bearer Token / Basic Auth]
Setup:
```
{authentication setup instructions}
```

### Base URL
```
{base_url}
```

### Key Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /resource | Description |
| POST | /resource | Description |
| ... | ... | ... |

### Example Request
```javascript
{example code}
```

### Rate Limits
{rate limit info if available}

### n8n Integration Notes
- Recommended node: [HTTP Request / existing node]
- Authentication node type: [OAuth2 / Header Auth / etc]
- Special considerations: {any notes}

### Cached To
Saved documentation to: context/api-docs/{service}.md
```

---

## Caching Structure

### Registry Mode (default)
```
context/api-docs/{service}/
├── api-reference.md        # Endpoints, methods, auth
├── ui-features.md          # User-facing docs (if applicable)
├── sdk-reference.md        # Language-specific SDK (if found)
├── tutorials.md            # YouTube/tutorial summaries
└── curl-examples/
    ├── auth-test.sh
    └── example-request.sh
```

### Workflow Mode
```
workflows/{business_process}/{workflow}/docs/{service}/
├── api-reference.md
├── ui-features.md
├── sdk-reference.md
├── tutorials.md
└── curl-examples/
    ├── auth-test.sh
    └── example-request.sh
```

---

## Registry Update

After caching, update `workflows/registry.yaml`:

```yaml
# Add or update integration entry
integrations:
  {service}:
    n8n_node: "{found_node_type}"  # or null if no native node
    used_by: []  # Will be populated when workflows use this
    docs_cached: true
    docs_cached_date: "{ISO_DATE}"
    docs_path: "context/api-docs/{service}/"  # or workflow path
    auth_type: "{oauth2|api_key|bearer|basic}"
    api_base: "{base_url}"
```

---

## Post-Lookup Actions

1. **Cache Documentation**:
   - Create folder structure per caching mode
   - Save `api-reference.md` with endpoints, auth, examples
   - Save `curl-examples/auth-test.sh` for credential testing

2. **Update Registry**:
   - Add/update integration entry in `workflows/registry.yaml`
   - Set `docs_cached: true` with date
   - Record auth_type and api_base

3. **Memory Graph** (optional):
   - Add to knowledge graph if complex integration
   - Note any MCP servers that could be added

4. **Return Summary**:
   - Print brief summary of what was found
   - List any missing documentation components

---

## Retrieval Log

When caching, also create `retrieval-log.json`:

```json
{
  "service": "{service}",
  "retrieved_at": "{ISO_DATE}",
  "sources": {
    "n8n_node": {"found": true, "nodeType": "nodes-base.slack"},
    "context7": {"found": false, "error": "not_indexed"},
    "ref_tools": {"found": true, "url": "https://..."},
    "exa": {"found": false, "skipped": true},
    "web_search": {"found": false, "skipped": true}
  },
  "components_cached": ["api-reference", "curl-examples"],
  "components_missing": ["sdk-reference", "tutorials"]
}
```
