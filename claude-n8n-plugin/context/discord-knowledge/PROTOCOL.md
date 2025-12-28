# Discord Knowledge Base Protocol

This document describes how to use the n8n Discord community knowledge base - both the **local searchable database** (2,930 Q&A pairs) and the **live MCP server** for real-time searches.

---

## 📚 Part 1: Local Searchable Database (RECOMMENDED)

### Overview

**What**: 2,930 real community questions from n8n Discord (April-December 2025)
**Format**: Searchable JSON indexes (topic, keyword, error pattern)
**Size**: 1.5MB of processed data
**Status**: ✅ Ready to use (offline, no API required)

### Quick Stats

- **Total Questions**: 2,930
- **Date Range**: April 23 - December 13, 2025
- **Topics**: 15 categories indexed
- **Keywords**: 5,197 unique terms
- **Error Patterns**: 6 common types

### Top Topics

1. **workflows** (1,263 questions) - General workflow development
2. **error-handling** (560 questions) - Debugging and troubleshooting
3. **ai-agents** (509 questions) - AI agent configuration and memory
4. **http-requests** (509 questions) - API calls and webhooks
5. **conditional** (444 questions) - IF/Switch node logic
6. **scheduling** (333 questions) - Cron triggers and timing
7. **integration** (306 questions) - Third-party service connections
8. **data-transformation** (267 questions) - JSON, mapping, filtering
9. **deployment** (184 questions) - Self-hosting and Docker
10. **authentication** (176 questions) - OAuth, API keys, credentials

### Available Files

| File | Purpose | Size |
|------|---------|------|
| `discord-questions.json` | Full Q&A database | 1.1MB |
| `topic-index.json` | Questions by topic | 59KB |
| `keyword-index.json` | Questions by keyword | 393KB |
| `error-index.json` | Questions by error type | 1.3KB |
| `statistics.json` | Detailed statistics | 4KB |
| `README.md` | Documentation | 2.7KB |

### Search Examples

#### 1. Search by Topic

```javascript
const topicIndex = require('./context/discord-knowledge/topic-index.json');
const questions = require('./context/discord-knowledge/discord-questions.json');

// Get all AI agent questions
const aiAgentIndexes = topicIndex.topics['ai-agents'];
const aiAgentQuestions = aiAgentIndexes.map(i => questions.questions[i]);

console.log(`Found ${aiAgentQuestions.length} AI agent questions`);
```

#### 2. Search by Keyword

```javascript
const keywordIndex = require('./context/discord-knowledge/keyword-index.json');
const questions = require('./context/discord-knowledge/discord-questions.json');

// Search for "webhook" questions
const webhookIndexes = keywordIndex['webhook'] || [];
const webhookQuestions = webhookIndexes.map(i => questions.questions[i]);

console.log(`Found ${webhookQuestions.length} webhook questions`);
```

#### 3. Search by Error Pattern

```javascript
const errorIndex = require('./context/discord-knowledge/error-index.json');
const questions = require('./context/discord-knowledge/discord-questions.json');

// Get connection error questions
const connectionErrors = errorIndex.errors['connection'];
const errorQuestions = connectionErrors.map(i => questions.questions[i]);

console.log(`Found ${errorQuestions.length} connection error questions`);
```

#### 4. Multi-Keyword Search

```javascript
const keywordIndex = require('./context/discord-knowledge/keyword-index.json');
const questions = require('./context/discord-knowledge/discord-questions.json');

// Find questions about "AI agent memory"
const aiIndexes = new Set(keywordIndex['agent'] || []);
const memoryIndexes = new Set(keywordIndex['memory'] || []);

// Intersection of both
const matches = [...aiIndexes].filter(i => memoryIndexes.has(i));
const matchedQuestions = matches.map(i => questions.questions[i]);

console.log(`Found ${matchedQuestions.length} questions about AI agent memory`);
```

### When to Use Local Database

✅ **Use Local Database When**:
- Searching for common patterns (workflows, errors, integrations)
- Offline development
- Fast bulk searches across all questions
- Building FAQ or documentation
- Analyzing community trends

❌ **Don't Use When**:
- Need real-time/current discussions (use live MCP instead)
- Question is about features released after December 2025
- Looking for very specific edge cases not in database

### Updating the Database

To refresh the database with new Discord data:

```bash
# 1. Export new Discord messages to CSV
# 2. Replace "n8n Discord bot help.csv"
# 3. Run processor
npm run process:discord

# Or manually:
node scripts/discord-qa-processor.js
```

---

## 🔴 Part 2: Live Discord MCP Server (OPTIONAL)

### Overview

**MCP Server**: v-3/discordmcp (160 stars)
**Repository**: https://github.com/v-3/discordmcp
**Target Server**: n8n Discord (discord.gg/n8n)
**Status**: Pending (requires DISCORD_TOKEN setup)

### Installation

1. Install the MCP server:
   ```bash
   npm install -g discordmcp
   ```

2. Set up Discord bot token:
   - Create a Discord application at https://discord.com/developers/applications
   - Create a bot and get the token
   - Enable **Message Content Intent** (Required!)
   - Add to environment variables:
     ```bash
     export DISCORD_TOKEN=your_bot_token_here
     ```

3. Configure in Claude Desktop (`~/.config/Claude/claude_desktop_config.json`):
   ```json
   {
     "mcpServers": {
       "discord": {
         "command": "discordmcp",
         "env": {
           "DISCORD_TOKEN": "your_bot_token_here"
         }
       }
     }
   }
   ```

### Available Tools

#### read-messages
Fetch recent messages from a channel.

**Parameters**:
- `channel`: Channel name (e.g., "support", "general", "showcase", "integrations")
- `limit`: Number of messages to fetch (default: 50, max: 100)

**Example**:
```javascript
mcp__discord__read-messages({
  channel: "support",
  limit: 50
})
```

#### send-message
Post a message to a channel (requires approval).

**Parameters**:
- `channel`: Channel name
- `message`: Message content

**Example**:
```javascript
mcp__discord__send-message({
  channel: "general",
  message: "Hello from Claude Code!"
})
```

### Key Channels

#### #support
- **Purpose**: Troubleshooting and error help
- **When to search**:
  - Error messages not in docs
  - Debugging issues
  - Installation problems
  - Node-specific questions

#### #general
- **Purpose**: Announcements, general discussion
- **When to search**:
  - Version updates
  - New features
  - Community news

#### #showcase
- **Purpose**: Workflow demos and examples
- **When to search**:
  - Looking for workflow inspiration
  - Finding real-world examples
  - Seeing what's possible

#### #integrations
- **Purpose**: Third-party integration help
- **When to search**:
  - API integration questions
  - Service-specific problems
  - OAuth/authentication issues

### When to Use Live MCP

✅ **Use Live MCP When**:
- Need real-time/current discussions
- Question about very recent features (post-Dec 2025)
- Looking for active community help
- Checking announcements for breaking changes

❌ **Don't Use When**:
- Local database has the answer (faster, no API calls)
- Question is covered in official docs or YouTube
- Topic is general workflow development (use local first)

### Rate Limits

Discord API has rate limits:
- **Message reading**: ~50 requests/minute
- **Message posting**: ~5 requests/minute

Be conservative with requests to avoid hitting limits.

---

## 🎯 Recommended Search Strategy

### 1. Start with Local Database (ALWAYS FIRST)

```javascript
// Search local database first (instant, offline)
const keywordIndex = require('./context/discord-knowledge/keyword-index.json');
const questions = require('./context/discord-knowledge/discord-questions.json');

const searchTerm = 'webhook'; // or 'error', 'agent', etc.
const resultIndexes = keywordIndex[searchTerm] || [];

if (resultIndexes.length > 0) {
  console.log(`Found ${resultIndexes.length} questions in local database!`);
  const results = resultIndexes.map(i => questions.questions[i]);
  // Use local results
} else {
  console.log('Not found in local database, trying live MCP...');
  // Proceed to live search if needed
}
```

### 2. Fallback to Live MCP (if needed)

```javascript
// Only if local search fails or need recent data
mcp__discord__read-messages({
  channel: "support",
  limit: 100
});
```

### 3. Document Findings

If you find useful patterns in live MCP:
- Consider exporting and re-processing the database
- Document in `context/workflow-patterns/`
- Share with team

---

## 📊 Common Search Patterns

### Finding Error Solutions (Local)

```javascript
const errorIndex = require('./context/discord-knowledge/error-index.json');
const questions = require('./context/discord-knowledge/discord-questions.json');

// Get all connection errors
const connectionIssues = errorIndex.errors['connection'];
const solutions = connectionIssues.map(i => questions.questions[i]);

// Find most recent
solutions.sort((a, b) => b.date.localeCompare(a.date));
console.log('Most recent connection issue:', solutions[0]);
```

### Finding Integration Examples (Local)

```javascript
const keywordIndex = require('./context/discord-knowledge/keyword-index.json');
const topicIndex = require('./context/discord-knowledge/topic-index.json');
const questions = require('./context/discord-knowledge/discord-questions.json');

// Combine integration topic + service keyword
const integrationQuestions = topicIndex.topics['integration'];
const googleQuestions = keywordIndex['google'];

const googleIntegrations = integrationQuestions.filter(i =>
  googleQuestions.includes(i)
);

console.log(`Found ${googleIntegrations.length} Google integration examples`);
```

### Finding AI Agent Patterns (Local)

```javascript
const topicIndex = require('./context/discord-knowledge/topic-index.json');
const keywordIndex = require('./context/discord-knowledge/keyword-index.json');
const questions = require('./context/discord-knowledge/discord-questions.json');

// Get AI agent questions with memory mentions
const aiIndexes = new Set(topicIndex.topics['ai-agents']);
const memoryIndexes = new Set(keywordIndex['memory'] || []);

const aiMemoryQuestions = [...aiIndexes].filter(i => memoryIndexes.has(i));
const results = aiMemoryQuestions.map(i => questions.questions[i]);

console.log(`Found ${results.length} AI agent memory questions`);
```

---

## 🛠️ Troubleshooting

### Local Database

**Issue**: Can't find questions on recent topics
**Solution**: Database only contains data through Dec 2025. Use live MCP for newer questions.

**Issue**: Too many search results
**Solution**: Combine multiple keywords or topics for more specific results.

**Issue**: Results seem outdated
**Solution**: Re-process the database with newer Discord exports:
```bash
node scripts/discord-qa-processor.js
```

### Live MCP Server

**Bot not responding**
- Verify DISCORD_TOKEN is set correctly
- Check bot has appropriate permissions
- Ensure bot is in the n8n Discord server
- Verify Message Content Intent is enabled

**Can't read messages**
- Bot needs READ_MESSAGE_HISTORY permission
- Channel may be private/restricted
- Rate limit may be hit (wait and retry)

**Can't send messages**
- Bot needs SEND_MESSAGES permission
- Channel may be read-only
- User approval required for safety

---

## 🔄 Integration with Pre-Flight Checklist

In the CLAUDE.md pre-flight checklist, Discord search strategy:

```
Search Order (MANDATORY):
1. n8n instance existing workflows
2. YouTube tutorials (video-index.json)
3. Discord LOCAL database (discord-questions.json)  ← FIRST for Discord
4. Discord LIVE MCP (if local fails)                ← FALLBACK
5. Reddit r/n8n community
6. Zie619 workflow library
7. MCP templates
```

**Always search local database before using live MCP to minimize API calls and get instant results.**

---

*Last Updated: 2025-12-14*
*Version: 2.0.0* - Added local searchable database (2,930 Q&A pairs)
