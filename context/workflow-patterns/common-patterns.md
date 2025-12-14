# Common n8n Workflow Patterns

Reference guide for frequently used workflow patterns. Copy and adapt these patterns rather than building from scratch.

---

## Pattern 1: Webhook → Process → Notify

**Use Case**: Receive external data, process it, send notification

```json
{
  "name": "Webhook Process Notify",
  "nodes": [
    {
      "id": "webhook",
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [250, 300],
      "webhookId": "unique-webhook-id",
      "parameters": {
        "httpMethod": "POST",
        "path": "incoming-data",
        "responseMode": "onReceived",
        "responseData": "allEntries"
      }
    },
    {
      "id": "process",
      "name": "Process Data",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [450, 300],
      "parameters": {
        "jsCode": "// Transform incoming data\nreturn items.map(item => ({\n  json: {\n    processed: true,\n    data: item.json\n  }\n}));"
      }
    },
    {
      "id": "notify",
      "name": "Send Notification",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.2,
      "position": [650, 300],
      "parameters": {
        "resource": "message",
        "operation": "send",
        "channel": { "value": "#notifications" },
        "text": "New data received: {{ $json.data }}"
      },
      "credentials": {
        "slackApi": { "id": "slack-cred-id", "name": "Slack" }
      }
    }
  ],
  "connections": {
    "Webhook Trigger": { "main": [[{ "node": "Process Data", "type": "main", "index": 0 }]] },
    "Process Data": { "main": [[{ "node": "Send Notification", "type": "main", "index": 0 }]] }
  }
}
```

---

## Pattern 2: Scheduled Data Sync

**Use Case**: Periodically fetch data from API and sync to database/sheet

```json
{
  "name": "Scheduled Data Sync",
  "nodes": [
    {
      "id": "schedule",
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.2,
      "position": [250, 300],
      "parameters": {
        "rule": { "interval": [{ "field": "hours", "hoursInterval": 1 }] }
      }
    },
    {
      "id": "fetch",
      "name": "Fetch API Data",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [450, 300],
      "parameters": {
        "method": "GET",
        "url": "https://api.example.com/data",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth"
      },
      "credentials": {
        "httpHeaderAuth": { "id": "api-auth-id", "name": "API Auth" }
      }
    },
    {
      "id": "transform",
      "name": "Transform Data",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [650, 300],
      "parameters": {
        "jsCode": "return items.map(item => ({\n  json: {\n    id: item.json.id,\n    name: item.json.name,\n    syncedAt: new Date().toISOString()\n  }\n}));"
      }
    },
    {
      "id": "save",
      "name": "Save to Sheet",
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.5,
      "position": [850, 300],
      "parameters": {
        "operation": "appendOrUpdate",
        "documentId": { "value": "sheet-id" },
        "sheetName": { "value": "Data" }
      },
      "credentials": {
        "googleSheetsOAuth2Api": { "id": "google-cred-id", "name": "Google" }
      }
    }
  ],
  "connections": {
    "Schedule Trigger": { "main": [[{ "node": "Fetch API Data", "type": "main", "index": 0 }]] },
    "Fetch API Data": { "main": [[{ "node": "Transform Data", "type": "main", "index": 0 }]] },
    "Transform Data": { "main": [[{ "node": "Save to Sheet", "type": "main", "index": 0 }]] }
  }
}
```

---

## Pattern 3: Error Handler Workflow

**Use Case**: Catch errors from other workflows, log and notify

```json
{
  "name": "Global Error Handler",
  "nodes": [
    {
      "id": "error-trigger",
      "name": "Error Trigger",
      "type": "n8n-nodes-base.errorTrigger",
      "typeVersion": 1,
      "position": [250, 300],
      "parameters": {}
    },
    {
      "id": "format-error",
      "name": "Format Error",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [450, 300],
      "parameters": {
        "jsCode": "const error = items[0].json;\nreturn [{\n  json: {\n    workflow: error.workflow?.name || 'Unknown',\n    node: error.execution?.lastNodeExecuted || 'Unknown',\n    error: error.execution?.error?.message || 'Unknown error',\n    timestamp: new Date().toISOString(),\n    executionId: error.execution?.id\n  }\n}];"
      }
    },
    {
      "id": "notify-slack",
      "name": "Alert Slack",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.2,
      "position": [650, 300],
      "parameters": {
        "resource": "message",
        "operation": "send",
        "channel": { "value": "#n8n-errors" },
        "text": "🚨 *Workflow Error*\n\n*Workflow:* {{ $json.workflow }}\n*Node:* {{ $json.node }}\n*Error:* {{ $json.error }}\n*Time:* {{ $json.timestamp }}"
      },
      "credentials": {
        "slackApi": { "id": "slack-cred-id", "name": "Slack" }
      }
    }
  ],
  "connections": {
    "Error Trigger": { "main": [[{ "node": "Format Error", "type": "main", "index": 0 }]] },
    "Format Error": { "main": [[{ "node": "Alert Slack", "type": "main", "index": 0 }]] }
  }
}
```

---

## Pattern 4: Conditional Branching (IF/Switch)

**Use Case**: Route data based on conditions

```json
{
  "name": "Conditional Router",
  "nodes": [
    {
      "id": "if-node",
      "name": "Check Condition",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [450, 300],
      "parameters": {
        "conditions": {
          "options": { "caseSensitive": true },
          "conditions": [{
            "leftValue": "={{ $json.status }}",
            "rightValue": "active",
            "operator": { "type": "string", "operation": "equals" }
          }]
        }
      }
    },
    {
      "id": "true-branch",
      "name": "Handle Active",
      "type": "n8n-nodes-base.noOp",
      "typeVersion": 1,
      "position": [650, 200],
      "parameters": {}
    },
    {
      "id": "false-branch", 
      "name": "Handle Inactive",
      "type": "n8n-nodes-base.noOp",
      "typeVersion": 1,
      "position": [650, 400],
      "parameters": {}
    }
  ],
  "connections": {
    "Check Condition": {
      "main": [
        [{ "node": "Handle Active", "type": "main", "index": 0 }],
        [{ "node": "Handle Inactive", "type": "main", "index": 0 }]
      ]
    }
  }
}
```

---

## Pattern 5: Batch Processing with Rate Limiting

**Use Case**: Process large datasets without overwhelming APIs

```json
{
  "name": "Batch Processor",
  "nodes": [
    {
      "id": "split",
      "name": "Split In Batches",
      "type": "n8n-nodes-base.splitInBatches",
      "typeVersion": 3,
      "position": [450, 300],
      "parameters": {
        "batchSize": 10,
        "options": {}
      }
    },
    {
      "id": "process",
      "name": "Process Batch",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [650, 300],
      "parameters": {
        "method": "POST",
        "url": "https://api.example.com/process"
      }
    },
    {
      "id": "wait",
      "name": "Rate Limit Wait",
      "type": "n8n-nodes-base.wait",
      "typeVersion": 1.1,
      "position": [850, 300],
      "parameters": {
        "amount": 1,
        "unit": "seconds"
      }
    }
  ],
  "connections": {
    "Split In Batches": { "main": [[{ "node": "Process Batch", "type": "main", "index": 0 }]] },
    "Process Batch": { "main": [[{ "node": "Rate Limit Wait", "type": "main", "index": 0 }]] },
    "Rate Limit Wait": { "main": [[{ "node": "Split In Batches", "type": "main", "index": 0 }]] }
  }
}
```

---

## Quick Reference: Node Type Versions

Always use the latest stable versions:

| Node | Current Version |
|------|-----------------|
| webhook | 2 |
| httpRequest | 4.2 |
| code | 2 |
| slack | 2.2 |
| googleSheets | 4.5 |
| if | 2 |
| switch | 3 |
| splitInBatches | 3 |
| scheduleTrigger | 1.2 |
| errorTrigger | 1 |

Verify with: `mcp__n8n-mcp__get_node_essentials({nodeType: "nodes-base.{node}"})`
