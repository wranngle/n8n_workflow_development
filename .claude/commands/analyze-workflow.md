---
description: Analyze n8n workflow JSON structure to find reusable patterns
---

# /analyze-workflow - Deep Workflow Content Analysis

Analyze actual workflow JSON structure to find reusable patterns, not just filename matching.

## Purpose
Search by examining the CONTENT of workflows:
- What nodes are used
- How data flows between nodes
- What patterns are implemented
- What credentials/services are required

## Execution

### Step 1: Identify Target Workflows

**For a specific integration (e.g., "Slack + HubSpot"):**
```javascript
// List the category
WebFetch({
  url: "https://api.github.com/repos/Zie619/n8n-workflows/contents/workflows/Slack",
  prompt: "Find files with 'HubSpot' in the filename"
})
```

### Step 2: Fetch and Analyze Workflow Content

For EACH promising workflow, fetch the actual JSON:
```javascript
WebFetch({
  url: "https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/{Category}/{filename}.json",
  prompt: "Analyze this workflow and extract:
    1. All node types used (list each n8n-nodes-base.* type)
    2. The trigger type and configuration
    3. Data transformation patterns (Code nodes, Set nodes)
    4. Error handling approach
    5. Connection flow (which node connects to which)
    6. Credential types required
    7. Any reusable patterns or code snippets"
})
```

### Step 3: Structure Analysis Report

```markdown
## Workflow Analysis: {filename}

### Overview
- **Name**: {workflow name}
- **Trigger**: {trigger type and config}
- **Complexity**: {node count} nodes
- **Services**: {list of integrations}

### Node Inventory
| Node Name | Type | Purpose |
|-----------|------|---------|
| {name} | {type} | {what it does} |

### Data Flow
```mermaid
{flow diagram}
```

### Reusable Patterns Found
1. **{Pattern Name}**: {description}
   ```json
   {relevant node config}
   ```

### Error Handling
- {how errors are handled}

### Credentials Required
| Service | Credential Type |
|---------|-----------------|
| {service} | {type} |

### Adaptation Notes
- {what would need to change for our use case}
```

## Deep Pattern Search

When searching for a specific capability, analyze multiple workflows:

### Example: "Find workflows that transform webhook data and send to Slack"

```javascript
// 1. Find candidates
WebFetch({
  url: "https://api.github.com/repos/Zie619/n8n-workflows/contents/workflows/Slack",
  prompt: "List files with 'Webhook' in name"
})

// 2. Analyze top 3 candidates
// For each:
WebFetch({
  url: "https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/Slack/{file}.json",
  prompt: "Does this workflow:
    1. Have a webhook trigger?
    2. Transform/process data before Slack?
    3. What transformation is done?
    Return: YES/NO for each, plus transformation details"
})

// 3. Deep dive on best match
WebFetch({
  url: "https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/Slack/{best-match}.json",
  prompt: "Extract the complete node configurations for:
    - The webhook trigger setup
    - Any Code/Set nodes doing transformation
    - The Slack node configuration
    Format as ready-to-use JSON snippets"
})
```

## Pattern Library Extraction

When you find a good pattern, save it:

```javascript
// Extract pattern to local library
const pattern = {
  name: "Webhook → Transform → Slack",
  source: "{github-url}",
  nodes: [/* extracted node configs */],
  connections: {/* extracted connections */},
  description: "...",
  useCase: "..."
};

// Save to context/workflow-patterns/
Write to: context/workflow-patterns/{pattern-name}.json
```

## Semantic Search Protocol

For complex searches, use this multi-step analysis:

### 1. Keyword Expansion
User query: "send alert when customer signs up"
Expand to: webhook, trigger, customer, signup, registration, alert, notification, slack, email

### 2. Category Identification
Likely categories: Slack, Email, Discord, Webhook

### 3. Multi-Category Scan
```javascript
// Scan each relevant category
for category in [Slack, Email, Discord]:
  WebFetch({
    url: `https://api.github.com/repos/Zie619/n8n-workflows/contents/workflows/${category}`,
    prompt: "Find workflows related to: signup, registration, customer, alert"
  })
```

### 4. Content Analysis (Top 5 Results)
Fetch each JSON and analyze for:
- Does it handle customer/user events?
- Does it send notifications?
- What's the data transformation?

### 5. Best Match Report
```markdown
## Best Matches for: "{user query}"

### Match 1: {name} (95% relevant)
- **Why**: {explanation}
- **Adaptations needed**: {list}
- **Reusable code**: {snippets}

### Match 2: ...
```

## Integration with /workflow Command

This analysis is MANDATORY in Stage 2 (Discovery):

1. Don't just list filenames
2. Fetch top 3-5 promising workflows
3. Analyze their actual JSON content
4. Extract reusable patterns
5. Document findings before building

## Output Artifacts

After analysis, create:
1. Analysis report (shown to user)
2. Extracted patterns saved to `context/workflow-patterns/`
3. Relevant node configs cached for reuse
