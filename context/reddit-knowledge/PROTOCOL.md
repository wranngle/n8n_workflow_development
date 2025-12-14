# Reddit Knowledge Protocol

This document defines the protocol for searching and fetching n8n community knowledge from Reddit to assist with workflow development.

## Overview

The Reddit knowledge system provides access to r/n8n and related automation subreddits:
1. **Hot Threads** - Trending posts in relevant subreddits
2. **Post Content** - Full post details with comment threads
3. **Community Insights** - Real-world experiences and workarounds

## MCP Server

**Server**: `adhikasp/mcp-reddit` (~307 stars - highest for Reddit MCP)
**Repository**: https://github.com/adhikasp/mcp-reddit
**API**: Reddit official API via redditwarp Python client

## Quick Reference

```javascript
// Fetch hot threads from a subreddit
Tool: fetch_reddit_hot_threads
Arguments: { "subreddit": "n8n", "limit": 10 }

// Fetch full post content with comments
Tool: fetch_reddit_post_content
Arguments: { "post_id": "abc123", "comment_limit": 20, "comment_depth": 3 }
```

## Available Tools

### fetch_reddit_hot_threads(subreddit, limit)
Retrieves trending ("hot") posts from a given subreddit.

**Parameters:**
- `subreddit`: Subreddit name (without r/ prefix)
- `limit`: Number of posts to fetch (default: 10)

**Returns** (human-readable formatted string):
```
Title: My DIY Smart Home Hub Project
Score: 530
Comments: 87
Author: techguy42
Type: text
Content: Built my own hub using a Raspberry Pi...
Link: https://reddit.com/r/n8n/comments/abc123/...
---
Title: New n8n feature request
Score: 420
Comments: 65
...
```

### fetch_reddit_post_content(post_id, comment_limit, comment_depth)
Retrieves full post content plus a tree of comments.

**Parameters:**
- `post_id`: Reddit post ID (from URL, e.g., "abc123")
- `comment_limit`: Number of top-level comments (default: 10)
- `comment_depth`: How deep to traverse replies (default: 2)

**Returns** (structured textual report):
```
Title: My DIY Smart Home Hub Project
Score: 530
Author: techguy42
Type: text
Content: I built my own hub using a Raspberry Pi...

Comments:
* Author: smart_home_pro
  Score: 120
  This is awesome! What software are you using?
  -- * Author: techguy42
       Score: 95
       I'm using Home Assistant.
* Author: IoT_novice
  Score: 88
  Thanks for sharing!
```

## Relevant Subreddits

Key subreddits for n8n workflow development:

| Subreddit | Focus | Priority |
|-----------|-------|----------|
| `n8n` | Official n8n community | HIGH |
| `selfhosted` | Self-hosting tips, n8n deployments | MEDIUM |
| `homeautomation` | Automation use cases | MEDIUM |
| `nocode` | No-code automation patterns | LOW |
| `workflow` | General workflow automation | LOW |

## Search Protocol

### Step 1: Identify Query Context
Determine if Reddit knowledge would help:
- Real-world deployment experiences
- Community best practices
- Alternative approaches
- Self-hosting configurations

### Step 2: Select Target Subreddit
Map query type to subreddit:
- n8n-specific → `n8n`
- Self-hosting issues → `selfhosted`
- Automation patterns → `homeautomation`
- No-code approaches → `nocode`

### Step 3: Fetch Hot Threads
```javascript
// Get trending n8n discussions
fetch_reddit_hot_threads({ subreddit: "n8n", limit: 10 })
```

### Step 4: Drill Down to Relevant Post
```javascript
// Extract post_id from link and fetch full content
fetch_reddit_post_content({
  post_id: "abc123",
  comment_limit: 15,
  comment_depth: 2
})
```

### Step 5: Extract Insights
Claude summarizes findings:
- Main solutions mentioned
- Community consensus
- Alternative approaches
- Warnings/gotchas

## Intelligent Retrieval Strategies

### When to Fetch Reddit Data

**DO fetch when:**
- Looking for real-world deployment experiences
- Comparing approaches (e.g., "n8n vs Zapier")
- Self-hosting configuration questions
- Community opinions on features

**DON'T fetch when:**
- Official documentation exists
- YouTube tutorials cover the topic
- Discord has active discussion
- Query is about basic functionality

### Iterative Retrieval

Best practice for efficient API usage:

1. **Start small**: Fetch 5 posts initially
2. **Evaluate relevance**: Check if titles match query
3. **Drill down**: Only fetch full content for relevant posts
4. **Expand if needed**: Fetch more posts if insufficient

```javascript
// Start with 5 posts
fetch_reddit_hot_threads({ subreddit: "n8n", limit: 5 })

// If relevant post found, drill down
fetch_reddit_post_content({ post_id: "found_id", comment_limit: 10 })

// If no relevant posts, expand search
fetch_reddit_hot_threads({ subreddit: "n8n", limit: 15 })
```

### Rate Limiting

Reddit API limits:
- Anonymous: ~10 requests/min
- App-only OAuth: ~60 requests/min
- Full user OAuth: ~100 requests/min

Best practices:
- Fetch small batches (5-10 posts)
- Don't drill into every post
- Cache results in session
- Summarize instead of re-fetching

## Authentication Setup

For higher rate limits, configure Reddit API credentials:

1. Go to https://www.reddit.com/prefs/apps
2. Click "Create App" or "Create Another App"
3. Select "script" type
4. Note the Client ID and Client Secret
5. Configure MCP server with credentials:
   ```
   REDDIT_CLIENT_ID=your_client_id
   REDDIT_CLIENT_SECRET=your_client_secret
   ```

## Data Structuring for RAG

When storing Reddit content for retrieval:

```json
{
  "source": "reddit",
  "subreddit": "n8n",
  "post_id": "abc123",
  "title": "How I automated my business with n8n",
  "author": "automation_pro",
  "score": 530,
  "timestamp": "2025-12-10T15:30:00Z",
  "content_summary": "Uses HTTP Request + Google Sheets + Slack integration...",
  "keywords": ["automation", "business", "google sheets", "slack"],
  "top_comment_insights": [
    "Consider error handling for API failures",
    "Use webhook instead of polling for real-time"
  ]
}
```

## Example Workflow Integration

**Scenario**: User asks "How do people deploy n8n in production?"

1. **Check YouTube knowledge first** (video-index.json)
2. **Check Discord #support** for recent discussions
3. **Search Reddit** for deployment experiences:
   ```javascript
   fetch_reddit_hot_threads({ subreddit: "n8n", limit: 10 })
   // Look for posts about deployment, production, hosting
   ```
4. **Drill into relevant post**:
   ```javascript
   fetch_reddit_post_content({
     post_id: "production_post_id",
     comment_limit: 20
   })
   ```
5. **Present findings** with attribution:
   > "From r/n8n community discussions:
   > - Most users deploy with Docker on VPS (DigitalOcean, Hetzner)
   > - PostgreSQL recommended over SQLite for production
   > - Nginx reverse proxy with SSL is common setup
   > - Backup strategies: volume snapshots + database dumps"

## Alternative MCP Servers

If `adhikasp/mcp-reddit` doesn't meet needs:

| Server | Stars | Key Feature | Use Case |
|--------|-------|-------------|----------|
| karanb192/reddit-mcp-buddy | ~270 | No API key required, search tool | Quick searches |
| Arindam200/reddit-mcp | ~237 | PRAW, analytics, posting | Write-back capabilities |

## Integration with CLAUDE.md

In the pre-flight checklist, Reddit search comes AFTER Discord:

```
Priority Order:
1. n8n instance existing workflows
2. YouTube tutorials (video-index.json)
3. Discord community discussions
4. Reddit r/n8n community  ← HERE
5. Zie619 workflow library
6. MCP templates
```

## Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| "Subreddit not found" | Typo or private sub | Check spelling, try related subs |
| "Invalid post ID" | Wrong ID format | Extract ID from URL correctly |
| "Rate limit exceeded" | Too many requests | Wait 60s, reduce batch sizes |
| "An error occurred: ..." | API failure | Retry once, then skip |

---

*Last Updated: 2025-12-14*
