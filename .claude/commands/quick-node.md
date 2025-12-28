---
description: Get n8n node configuration quickly for common use cases
---

# /quick-node - Rapid Node Configuration

Get node configuration quickly for common use cases.

## Usage
`/quick-node {node-type} {use-case}`

## Common Nodes Quick Reference

### Webhook (Receive Data)
```
mcp__n8n-mcp__get_node_essentials({nodeType: "nodes-base.webhook"})
```
Key params: httpMethod, path, responseMode

### HTTP Request (Call APIs)
```
mcp__n8n-mcp__get_node_essentials({nodeType: "nodes-base.httpRequest"})
```
Key params: method, url, authentication, headers, body

### Code (Custom Logic)
```
mcp__n8n-mcp__get_node_essentials({nodeType: "nodes-base.code"})
```
Key params: language (javaScript/python), jsCode/pythonCode

### Slack (Send Messages)
```
mcp__n8n-mcp__get_node_essentials({nodeType: "nodes-base.slack"})
```
Key params: resource, operation, channel, text

### Google Sheets (Data Storage)
```
mcp__n8n-mcp__get_node_essentials({nodeType: "nodes-base.googleSheets"})
```
Key params: operation, documentId, sheetName

### Schedule Trigger (Cron Jobs)
```
mcp__n8n-mcp__get_node_essentials({nodeType: "nodes-base.scheduleTrigger"})
```
Key params: rule.interval

### IF (Conditional)
```
mcp__n8n-mcp__get_node_essentials({nodeType: "nodes-base.if"})
```
Key params: conditions

### Switch (Multi-Branch)
```
mcp__n8n-mcp__get_node_essentials({nodeType: "nodes-base.switch"})
```
Key params: rules

### Split In Batches (Loop)
```
mcp__n8n-mcp__get_node_essentials({nodeType: "nodes-base.splitInBatches"})
```
Key params: batchSize

### Error Trigger (Catch Errors)
```
mcp__n8n-mcp__get_node_essentials({nodeType: "nodes-base.errorTrigger"})
```
No params needed

## Output
Returns minimal node configuration with examples, ready to use in workflow.
