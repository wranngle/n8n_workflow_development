# Zie619 Workflow Library - Access Methods

## Overview
The Zie619 n8n Workflow Collection contains **4,343+ professional automation workflows** organized by integration category.

- **Frontend**: https://zie619.github.io/n8n-workflows
- **GitHub**: https://github.com/Zie619/n8n-workflows
- **API (when active)**: https://n8n-workflows-1-xxgm.onrender.com

---

## ⚠️ IMPORTANT: Access Methods

The REST API runs on Render.com free tier and **often sleeps** (returns 503). Use this priority order:

| Priority | Method | Reliability | Best For |
|----------|--------|-------------|----------|
| 1 | **GitHub Raw URLs** | ✅ Always works | Fetching specific workflows |
| 2 | **GitHub API** | ✅ Always works | Listing/discovering workflows |
| 3 | **Render API** | ⚠️ Often sleeping | Search when awake |

---

## Method 1: GitHub Raw URLs (RECOMMENDED)

Direct access to workflow JSON files. Always available.

### URL Pattern
```
https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/{Category}/{filename}.json
```

### Example - Fetch a Slack workflow:
```javascript
WebFetch({
  url: "https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/Slack/1172_Slack_HubSpot_Send_Triggered.json",
  prompt: "Extract the workflow structure - nodes, connections, and settings"
})
```

### Known Categories (Partial List)
Activecampaign, Airtable, Asana, Calendly, Code, Discord, Gmail, Google Sheets, HubSpot, Notion, OpenAI, Slack, Stripe, Typeform, and 100+ more.

---

## Method 2: GitHub API (For Discovery)

Use to list available workflows and categories.

### List All Categories
```javascript
WebFetch({
  url: "https://api.github.com/repos/Zie619/n8n-workflows/contents/workflows",
  prompt: "List all category folder names"
})
```

### List Workflows in a Category
```javascript
WebFetch({
  url: "https://api.github.com/repos/Zie619/n8n-workflows/contents/workflows/Slack",
  prompt: "List all JSON workflow filenames"
})
```

### Search Entire Repo Tree
```javascript
WebFetch({
  url: "https://api.github.com/repos/Zie619/n8n-workflows/git/trees/main?recursive=1",
  prompt: "Find workflow files matching 'hubspot' in the path"
})
```

---

## Method 3: Render API (When Available)

**Base URL**: `https://n8n-workflows-1-xxgm.onrender.com`

⚠️ Returns 503 when sleeping. First request may take 30-60s to wake.

### Endpoints (When Active)

#### GET /health
```
https://n8n-workflows-1-xxgm.onrender.com/health
```
Returns: `{"status": "healthy"}`

#### GET /api/stats
```
https://n8n-workflows-1-xxgm.onrender.com/api/stats
```
Returns workflow counts, trigger breakdowns, complexity stats.

#### GET /api/workflows
Search and filter workflows.

**Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| q | string | - | Search query (name, description, nodes) |
| trigger | string | "all" | webhook, schedule, manual, all |
| complexity | string | "all" | low (≤5 nodes), medium (6-15), high (16+) |
| page | integer | 1 | Page number |
| per_page | integer | 20 | Results per page (max 100) |

**Example:**
```
GET /api/workflows?q=slack&trigger=webhook&per_page=10
```

#### GET /api/workflows/{filename}
Get workflow details with full JSON.

#### GET /api/categories
List all categories.

---

## Practical Search Strategy

### Step 1: Identify Category
```javascript
// List all categories
WebFetch({
  url: "https://api.github.com/repos/Zie619/n8n-workflows/contents/workflows",
  prompt: "List category names that might contain {service} workflows"
})
```

### Step 2: List Workflows in Category
```javascript
// Get workflows in category
WebFetch({
  url: "https://api.github.com/repos/Zie619/n8n-workflows/contents/workflows/{Category}",
  prompt: "List all workflow filenames with their descriptions from names"
})
```

### Step 3: Fetch Specific Workflow
```javascript
// Get the actual workflow
WebFetch({
  url: "https://raw.githubusercontent.com/Zie619/n8n-workflows/main/workflows/{Category}/{filename}.json",
  prompt: "Extract nodes, connections, trigger type, and any useful patterns"
})
```

---

## Example Workflow Paths (Verified)

| Integration | Example Path |
|-------------|--------------|
| Slack | `workflows/Slack/1172_Slack_HubSpot_Send_Triggered.json` |
| Slack | `workflows/Slack/0008_Slack_Stripe_Create_Triggered.json` |
| Airtable | `workflows/Airtable/0756_Airtable_Create_Triggered.json` |
| Notion | `workflows/Notion/...` |
| OpenAI | `workflows/Openai/...` |

---

## Filename Convention

```
{ID}_{PrimaryService}_{SecondaryService}_{Action}_{TriggerType}.json
```

Examples:
- `0008_Slack_Stripe_Create_Triggered.json` → Stripe event triggers Slack
- `0109_Slack_Cron_Automate_Scheduled.json` → Scheduled Slack automation
- `1172_Slack_HubSpot_Send_Triggered.json` → HubSpot event sends to Slack

Trigger types: `Triggered`, `Scheduled`, `Webhook`, `Manual`

---

## Rate Limits

| Method | Limit |
|--------|-------|
| GitHub Raw | Generous, no auth needed |
| GitHub API | 60 req/hour unauthenticated |
| Render API | Unknown, respect sleep cycle |

---

## Fallback Chain

```
1. Try GitHub Raw URL (if you know the path)
   ↓ don't know path
2. Use GitHub API to discover workflows
   ↓ need search functionality
3. Try Render API (may be sleeping)
   ↓ 503 error
4. Wait 60s and retry Render (wakes the service)
   ↓ still failing
5. Browse frontend manually: zie619.github.io/n8n-workflows
```

---

*Tested: 2025-12-14*
*GitHub access: ✅ Verified working*
*Render API: ⚠️ Sleeps on free tier*
