# Discord Knowledge Protocol

This document defines the protocol for searching and fetching n8n community knowledge from Discord to assist with workflow development.

## Overview

The Discord knowledge system provides real-time access to the n8n Discord community discussions:
1. **Channel Discovery** - Automatic discovery of all accessible channels
2. **Message Retrieval** - On-demand fetch of recent messages from any channel
3. **Caching Strategy** - Short-term session cache + long-term summaries

## MCP Server

**Server**: `v-3/discordmcp` (160 stars)
**Repository**: https://github.com/v-3/discordmcp
**Target Server**: n8n Discord (https://discord.gg/n8n)

## Quick Reference

```javascript
// List available channels (if tool available)
// Note: discordmcp auto-discovers channels

// Read recent messages from a channel
Tool: read-messages
Arguments: { "channel": "general", "limit": 50 }

// Send a message (requires explicit approval)
Tool: send-message
Arguments: { "channel": "general", "message": "Hello from Claude!" }
```

## Available Tools

### read-messages
Reads recent messages from a specified Discord channel.

**Parameters:**
- `server` (optional): Server name or ID (required if bot is in multiple servers)
- `channel`: Channel name (e.g., "general") or channel ID
- `limit` (optional): Number of messages to fetch (default: 50, max: 100)

**Example:**
```json
{
  "channel": "support",
  "limit": 30
}
```

**Returns:**
```json
[
  {
    "id": "11111",
    "author": "Alice",
    "timestamp": "2025-12-13T10:15:00Z",
    "content": "Hello, does anyone know how to do X?",
    "mentions": []
  },
  ...
]
```

### send-message
Sends a message to a specified Discord channel.

**Parameters:**
- `server` (optional): Server name or ID
- `channel`: Channel name or ID
- `message`: Message content to send

**Note**: All send operations require explicit user approval.

## n8n Discord Channels

Key channels to monitor for workflow development insights:

| Channel | Purpose | Priority |
|---------|---------|----------|
| `#support` | Community help, troubleshooting | HIGH |
| `#general` | General discussion, announcements | MEDIUM |
| `#showcase` | Workflow demos, success stories | HIGH |
| `#feature-requests` | Community-requested features | MEDIUM |
| `#integrations` | Third-party integration help | HIGH |

## Search Protocol

### Step 1: Identify Query Context
From the user's workflow request, determine if Discord knowledge would help:
- Error messages or debugging issues
- Integration-specific questions
- Best practices and patterns
- Community workarounds

### Step 2: Select Relevant Channels
Map query type to channels:
- Errors/Bugs → `#support`
- How-to questions → `#support`, `#general`
- Integration help → `#integrations`
- Workflow inspiration → `#showcase`

### Step 3: Fetch Messages
```javascript
// Example: Get recent support discussions
read-messages({ channel: "support", limit: 50 })
```

### Step 4: Filter and Extract
Claude filters retrieved messages for relevance:
- Keyword matching (error codes, node names)
- Author filtering (core team vs community)
- Timestamp filtering (recent = more relevant)

## Intelligent Retrieval Strategies

### When to Fetch Discord Data

**DO fetch when:**
- User reports a specific error not found in docs
- Asking about community workarounds
- Looking for real-world usage patterns
- Debugging integration issues

**DON'T fetch when:**
- Official documentation exists
- Query is about n8n fundamentals
- YouTube tutorials cover the topic
- No specific error/integration mentioned

### Caching Strategy

**Short-term (session)**:
- Store fetched messages in session memory
- Reuse for follow-up questions
- Track last message ID for incremental updates

**Long-term (knowledge base)**:
- Store valuable solutions in `context/discord-knowledge/solutions/`
- Index by error codes, node types, keywords
- Update periodically with new insights

### Rate Limiting

Discord API has rate limits. Best practices:
- Fetch 30-50 messages at a time, not 100
- Wait between channel switches
- Cache aggressively to avoid repeat fetches
- Summarize instead of re-fetching

## Data Structuring for RAG

When storing Discord messages for retrieval:

```json
{
  "source": "discord",
  "channel": "support",
  "timestamp": "2025-12-13T10:15:00Z",
  "author": "experienced_user",
  "content": "For HTTP Request node timeout issues, increase the timeout in node settings...",
  "keywords": ["http request", "timeout", "node settings"],
  "solution_type": "workaround"
}
```

## Example Workflow Integration

**Scenario**: User asks "HTTP Request node keeps timing out"

1. **Check YouTube knowledge first** (video-index.json)
2. **No relevant tutorial found** → Search Discord
3. **Fetch from #support**:
   ```javascript
   read-messages({ channel: "support", limit: 50 })
   ```
4. **Filter messages** containing "timeout" or "HTTP Request"
5. **Extract solutions** from community responses
6. **Present findings** with attribution:
   > "From the n8n Discord #support channel, users recommend:
   > - Increase timeout in node settings (default is 300000ms)
   > - Check if the endpoint has rate limiting
   > - Consider using batch processing for large requests"

## Bot Setup Requirements

Before using discordmcp, the bot needs:

1. **Privileged Intents** (in Discord Developer Portal):
   - Presence Intent
   - Server Members Intent
   - Message Content Intent (REQUIRED to read messages)

2. **Bot Permissions**:
   - Read Messages/View Channels
   - Read Message History
   - Send Messages (if posting)

3. **Environment Variable**:
   ```
   DISCORD_TOKEN=your_discord_bot_token_here
   ```

## Integration with CLAUDE.md

In the pre-flight checklist, Discord search comes AFTER YouTube:

```
Priority Order:
1. n8n instance existing workflows
2. YouTube tutorials (video-index.json)
3. Discord community discussions  ← HERE
4. Reddit r/n8n community
5. Zie619 workflow library
6. MCP templates
```

---

*Last Updated: 2025-12-14*
