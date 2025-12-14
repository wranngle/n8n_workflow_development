# YouTube Knowledge Protocol

This document defines the protocol for searching and fetching n8n tutorial content from YouTube to assist with workflow development.

## Overview

The YouTube knowledge system provides three tiers of information:
1. **Video Metadata** - Always available via `video-index.json`
2. **Transcripts** - On-demand fetch with caching (may be unavailable for some videos)
3. **Video Descriptions** - Fallback when transcripts unavailable

## Quick Reference

```
# Search for videos by tag
Search video-index.json tagIndex for: webhook, ai-agents, langchain, slack, etc.

# Fetch transcript (when available)
Tool: mcp__youtube__transcripts_getTranscript({videoId: "..."})

# Get video details (for description fallback)
Tool: mcp__youtube__videos_getVideo({videoId: "...", parts: ["snippet"]})
```

## File Structure

```
context/youtube-knowledge/
├── video-index.json              # Searchable video metadata (62+ videos)
├── transcript-search-index.json  # Full-text searchable content index
├── transcripts/                  # Cached transcripts (JSON files)
│   └── {videoId}.json            # Individual transcript cache
└── PROTOCOL.md                   # This file
```

## Search Protocol

### Step 1: Identify Keywords
From the user's workflow request, extract relevant keywords:
- Node types: webhook, slack, telegram, gmail, http
- Concepts: ai-agents, rag, memory, langchain, chatbot
- Complexity: beginner, advanced, masterclass
- Use cases: automation, multi-agent, error-handling

### Step 2: Search Tag Index
Look up keywords in `video-index.json` → `tagIndex`:

```javascript
// Available tags in video-index.json:
const tags = [
  "beginner", "ai-agents", "webhook", "course", "langchain",
  "slack", "telegram", "whatsapp", "chatbot", "rag", "memory",
  "voice", "multi-agent", "error-handling", "gmail", "templates",
  "business", "no-code", "self-host", "workflow-builder"
];
```

### Step 3: Retrieve Matching Videos
Each tag maps to an array of video IDs. Cross-reference with the `videos` array to get titles and channels.

## Content-Based Search (Full-Text)

When tag-based search doesn't find relevant videos, use full-text content search.

### Step 1: Search Content Index
Read `transcript-search-index.json` and search the `searchableContent` array:

```javascript
// Search in searchText field for keyword matches
searchableContent.filter(item =>
  item.searchText.toLowerCase().includes(query.toLowerCase())
)
```

### Step 2: Check Topic Index
For common topics, use `topicIndex` for direct lookup:

```javascript
// Available topics in topicIndex:
const topics = [
  "error-handling", "webhook-security", "authentication",
  "langchain", "advanced-agents", "production",
  "retry-logic", "jwt", "fallback-llm", "orchestration"
];
```

### Step 3: Fetch Full Transcript
Once matching video found, read the full transcript for detailed guidance:

```javascript
// Read cached transcript
Read: transcripts/{videoId}.json

// If not cached, fetch and cache:
mcp__youtube__transcripts_getTranscript({videoId: "..."})
```

### Example: Content Search Flow

**Query**: "How do I handle webhook authentication?"

1. Search `searchableContent[].searchText` for "webhook authentication"
2. Match found: `3FfCRbq3XMs` (Nate Herk webhook security)
3. Read `transcripts/3FfCRbq3XMs.json`
4. Extract: "three methods - header auth, basic auth, JWT"
5. Use this guidance in workflow implementation

## Transcript Fetch Protocol

### Primary: MCP Transcript Tool
```javascript
mcp__youtube__transcripts_getTranscript({
  videoId: "VIDEO_ID"
})
```

**Expected Response:**
```json
{
  "videoId": "...",
  "language": "en",
  "transcript": [
    {"text": "...", "offset": 1234, "duration": 5000},
    ...
  ]
}
```

### Handling Failures

| Response | Meaning | Action |
|----------|---------|--------|
| `transcript: []` | No captions available | Use video description fallback |
| `fetch failed` | Rate limit or network error | Wait 30s and retry once |
| Error thrown | Video unavailable | Skip and log |

### Fallback: Video Description
When transcripts unavailable, fetch video details:

```javascript
mcp__youtube__videos_getVideo({
  videoId: "VIDEO_ID",
  parts: ["snippet", "contentDetails"]
})
```

Extract from `snippet.description` - often contains:
- Topics covered
- Timestamps with section names
- Links to resources
- Node types used

## Transcript Caching

### Cache Location
`context/youtube-knowledge/transcripts/{videoId}.json`

### Cache Format
```json
{
  "videoId": "lK3veuZAg0c",
  "title": "Step-by-Step: N8N Webhooks (From Beginner to Pro)",
  "channel": "Nick Saraev",
  "fetchedAt": "2025-12-14T12:00:00Z",
  "status": "success|empty|failed",
  "transcript": [...],
  "fullText": "concatenated transcript text for searching"
}
```

### Cache Logic
1. Check if `transcripts/{videoId}.json` exists
2. If exists and `status: success`, use cached content
3. If not cached, fetch via MCP tool
4. Cache result regardless of status (prevents re-fetching failures)

## Integration with Workflow Development

### When to Search YouTube Knowledge

**BEFORE building any workflow**, search for existing tutorials:

1. User requests: "Build a Slack notification workflow"
2. Search tags: `slack`, `webhook`, `automation`
3. Find relevant videos: `qk5JH6ImK0I` - "How to Connect Slack to n8n"
4. Fetch transcript if available
5. Extract implementation guidance

### Priority Order
1. **Existing n8n Instance** - Check for similar workflows first
2. **YouTube Tutorials** - Search video index for guidance
3. **Community Library** - Zie619 workflow templates
4. **MCP Templates** - Official n8n templates
5. **Build from Scratch** - Only as last resort

## Top Videos by Topic

### Beginner/Overview
- `GIZzRGYpCbM` - freeCodeCamp 6-hour course
- `4cQWJViybAQ` - Official n8n Quick Start
- `AURnISajubk` - Jono Catliff 2-hour masterclass

### AI Agents
- `ZHH3sr234zY` - Nate Herk AI Agents masterclass
- `geR9PeCuHK4` - AI Foundations full course
- `lW5xEm7iSXk` - n8n multi-agent tool

### Webhooks
- `lK3veuZAg0c` - Nick Saraev beginner to pro
- `3FfCRbq3XMs` - Nate Herk security guide
- `y_cpFMF1pzk` - Official n8n API/Webhook intro

### Integrations
- `qk5JH6ImK0I` - Slack integration
- `QZ93nQGwnPg` - Telegram in 2 minutes
- `vcvRVlc_VFg` - WhatsApp AI agent
- `ZcP4BwY9rHw` - Gmail AI agent

### Advanced
- `4o0AJYBEiBo` - LangChain Code Node
- `vpyllOeLhs4` - AI Agent Swarm
- `Zy4cVtHJNvc` - Error Handling techniques

## Maintenance

### Refreshing the Index
Run YouTube searches periodically to discover new tutorials:
```javascript
mcp__youtube__videos_searchVideos({
  query: "n8n workflow tutorial 2025",
  maxResults: 50
})
```

### Index Update Protocol
1. Run searches with new query variations
2. Deduplicate against existing videos
3. Add new videos with appropriate tags
4. Update `meta.lastUpdated` timestamp

---

*Last Updated: 2025-12-14*
