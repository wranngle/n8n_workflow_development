# n8n Task Templates Reference

29 pre-configured node templates for common automation tasks.

## Access
```
mcp__n8n-mcp__list_tasks()                    # List all templates
mcp__n8n-mcp__list_tasks({category})          # Filter by category
mcp__n8n-mcp__get_node_for_task({task})       # Get full config
```

---

## HTTP/API Tasks

| Task | Description |
|------|-------------|
| `get_api_data` | Fetch data from REST API |
| `post_json_request` | POST JSON to API endpoint |
| `call_api_with_auth` | API call with authentication |
| `api_call_with_retry` | API call with retry logic |

### Example: post_json_request
```json
{
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "parameters": {
    "method": "POST",
    "url": "={{ $json.endpoint }}",
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {"name": "data", "value": "={{ $json.payload }}"}
      ]
    }
  }
}
```

---

## Webhook Tasks

| Task | Description |
|------|-------------|
| `receive_webhook` | Basic webhook receiver |
| `webhook_with_response` | Webhook with custom response |
| `webhook_with_error_handling` | Production-ready webhook |

### Example: receive_webhook
```json
{
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 2,
  "webhookId": "unique-id",
  "parameters": {
    "path": "my-webhook",
    "httpMethod": "POST",
    "responseMode": "onReceived"
  }
}
```

---

## Database Tasks

| Task | Description |
|------|-------------|
| `query_postgres` | Select from PostgreSQL |
| `insert_postgres_data` | Insert into PostgreSQL |
| `database_transaction_safety` | Safe transaction patterns |

---

## AI/LangChain Tasks

| Task | Description |
|------|-------------|
| `chat_with_ai` | Basic AI chat completion |
| `ai_agent_workflow` | Full AI agent with tools |
| `multi_tool_ai_agent` | Agent with multiple tool nodes |

### Example: ai_agent_workflow
Uses AI Agent node with connected tool nodes. Requires:
- AI Agent node as router
- Tool nodes connected to agent's tool port
- Memory node for conversation history (optional)

---

## Data Processing Tasks

| Task | Description |
|------|-------------|
| `transform_json_data` | JSON transformation patterns |
| `filter_and_sort_data` | Data filtering and sorting |
| `split_and_batch_items` | Batch processing setup |
| `merge_multiple_sources` | Merge data from sources |

---

## Communication Tasks

| Task | Description |
|------|-------------|
| `send_slack_message` | Post to Slack channel |
| `send_email_notification` | Email via SMTP |
| `send_discord_message` | Post to Discord |

### Example: send_slack_message
```json
{
  "type": "n8n-nodes-base.slack",
  "typeVersion": 2.2,
  "parameters": {
    "resource": "message",
    "operation": "post",
    "channel": "={{ $json.channel }}",
    "text": "={{ $json.message }}"
  },
  "credentials": {
    "slackApi": {"id": "cred-id", "name": "Slack"}
  }
}
```

---

## Error Handling Tasks

| Task | Description |
|------|-------------|
| `modern_error_handling_patterns` | Current best practices |
| `fault_tolerant_processing` | Resilient workflow patterns |
| `error_notification_workflow` | Alert on failures |

### Example: modern_error_handling_patterns
```json
{
  "onError": "continueErrorOutput",
  "retryOnFail": true,
  "maxTries": 3,
  "waitBetweenTries": 1000
}
```

---

## File/Document Tasks

| Task | Description |
|------|-------------|
| `read_local_file` | Read file from filesystem |
| `write_file_output` | Write data to file |
| `process_csv_data` | Parse and transform CSV |

---

## Scheduling Tasks

| Task | Description |
|------|-------------|
| `schedule_cron_job` | Cron-based scheduling |
| `interval_trigger` | Fixed interval trigger |

---

## Usage Pattern

```javascript
// 1. List available tasks for your category
const tasks = await mcp__n8n-mcp__list_tasks({category: "HTTP/API"});

// 2. Get specific task template
const template = await mcp__n8n-mcp__get_node_for_task({task: "post_json_request"});

// 3. Customize and use in workflow
// Template includes configured parameters, type versions, etc.
```

---

*Access via: `mcp__n8n-mcp__get_node_for_task({task: "task_name"})`*
