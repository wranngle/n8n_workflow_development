# n8n Workflow Development Toolkit

> 🤖 AI-powered n8n workflow development with comprehensive knowledge bases and MCP integration

A complete toolkit for building n8n workflows with Claude Code, featuring 10,279+ indexed YouTube tutorials, Discord/Reddit community integration, and direct n8n instance management via MCP servers.

## 🌟 Features

### 📚 Massive Knowledge Bases
- **10,279+ YouTube videos** indexed from 20 top n8n channels
- **29 searchable tags** (beginner, ai-agents, webhook, langchain, rag, memory, etc.)
- On-demand transcript fetching for implementation details
- Discord community integration (n8n Discord server)
- Reddit community insights (r/n8n, r/selfhosted, r/homeautomation)

### 🔧 n8n-MCP Integration
- **528 nodes** indexed with 89% documentation coverage
- **2,709 official templates** searchable
- Direct n8n instance management (create, update, validate, deploy workflows)
- Node configuration validation with 4 profiles (minimal, runtime, ai-friendly, strict)
- 29 pre-configured task templates
- Full AI agent workflow support

### 🎯 Workflow Development
- Pre-flight checklist for every workflow request
- Search existing instance → YouTube → Discord → Reddit → Community library → Templates
- Systematic workflow patterns (webhook, API, database, AI, scheduled)
- Production-ready error handling
- Security-first approach (no hardcoded credentials)

## 📁 Project Structure

```
n8n/
├── .claude/
│   ├── commands/          # Slash commands (/new-workflow, /validate, etc.)
│   └── skills/            # 8 n8n expert skills
├── context/
│   ├── youtube-knowledge/ # 10,279 videos + transcripts cache
│   ├── discord-knowledge/ # Discord MCP integration protocol
│   ├── reddit-knowledge/  # Reddit MCP integration protocol
│   ├── api-docs/          # Cached API documentation
│   └── workflow-patterns/ # Reusable patterns
├── scripts/
│   └── youtube-indexer.js # Systematic video indexing script
├── workflows/
│   ├── dev/               # Development/testing
│   ├── staging/           # Pre-production validation
│   └── production/        # Production-ready exports
├── config/                # MCP server configuration
├── tools/                 # Utility scripts
├── CLAUDE.md              # Master playbook (read this!)
├── RUNBOOK.md             # Operational procedures
└── package.json           # Node.js dependencies
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- Claude Code CLI
- n8n instance (cloud or self-hosted)
- YouTube Data API v3 key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/n8n-workflow-toolkit.git
   cd n8n-workflow-toolkit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

4. **Configure MCP servers**

   Update your Claude Desktop config (`~/.config/Claude/claude_desktop_config.json`):
   ```json
   {
     "mcpServers": {
       "n8n-mcp": {
         "command": "npx",
         "args": ["-y", "n8n-mcp"],
         "env": {
           "N8N_API_URL": "https://your-n8n-instance.com",
           "N8N_API_KEY": "your_api_key"
         }
       }
     }
   }
   ```

5. **Index YouTube knowledge base** (optional - already indexed)
   ```bash
   npm run index:youtube
   ```

## 📖 Usage

### Workflow Development Process

Read **CLAUDE.md** for the complete playbook. The TL;DR:

1. **Pre-Flight Checklist** (mandatory for every request):
   - Search existing n8n instance
   - Search YouTube tutorials (10,279 videos)
   - Search Discord community
   - Search Reddit community
   - Search Zie619 library (4,343 workflows)
   - Search n8n-MCP templates (2,709 templates)

2. **Design Phase**:
   - Map workflow flow (trigger → process → output)
   - Identify nodes needed
   - Check credential requirements

3. **Build Phase**:
   - Start with trigger node
   - Add processing nodes one-by-one
   - Validate each node
   - Add error handling

4. **Deploy Phase**:
   - Test in dev environment
   - Stage for review
   - Deploy via n8n-MCP
   - Archive to production

### Example: Search YouTube Knowledge Base

```javascript
// Read the video index
const index = require('./context/youtube-knowledge/video-index.json');

// Search by tag
const webhookVideos = index.tagIndex['webhook'].map(i => index.videos[i]);
console.log(`Found ${webhookVideos.length} webhook tutorials`);

// Get specific video
const video = index.videos.find(v => v.id === 'lK3veuZAg0c');
console.log(video.title); // "Step-by-Step: N8N Webhooks (From Beginner to Pro)"

// Fetch transcript via MCP
// mcp__youtube__transcripts_getTranscript({videoId: "lK3veuZAg0c"})
```

### Example: Validate Workflow

```javascript
// Use n8n-MCP validation
mcp__n8n-mcp__validate_workflow({
  workflow: yourWorkflowJSON,
  options: {
    profile: "ai-friendly",  // minimal | runtime | ai-friendly | strict
    validateNodes: true,
    validateConnections: true,
    validateExpressions: true
  }
})
```

## 🎓 Knowledge Base Statistics

### YouTube (10,279 videos)
- **Top channels**: freeCodeCamp (2,030), Charlie Chang (1,271), Kevin Stratvert (1,140)
- **Most common tags**: advanced (6,187), free (4,338), beginner (3,826), course (2,930)
- **Specialized content**: ai-agents (692), rag (827), voice (1,254), multi-agent
- **Last indexed**: 2025-12-14

### n8n-MCP (528 nodes)
- **Documentation coverage**: 89%
- **AI-capable nodes**: 264
- **Trigger nodes**: 108
- **Official templates**: 2,709
- **Task templates**: 29

### Community Library (4,343 workflows)
- Source: [Zie619/n8n-workflows](https://github.com/Zie619/n8n-workflows)
- Searchable via GitHub API (always available)
- Render API (may sleep on free tier)

## 🔧 MCP Servers

### Required
- **n8n-mcp**: Node operations, validation, workflow management
- **youtube**: Video search, transcript fetching

### Optional
- **discord**: Community discussions (requires bot token)
- **reddit**: Community insights (works without credentials at ~10 req/min)
- **context7**: Real-time library documentation
- **exa**: Deep research capabilities

See `config/mcp-servers.json` for full registry.

## 📜 Scripts

| Script | Command | Description |
|--------|---------|-------------|
| YouTube Indexer | `npm run index:youtube` | Fetch all videos from 20 top channels |

## 🛠️ Claude Code Skills

8 expert skills auto-activate for n8n development:

1. **n8n-workflow-dev** - Master skill with task templates, code guide, validation
2. **n8n-expression-syntax** - Fix `{{}}` syntax, $json/$node access
3. **n8n-mcp-tools-expert** - Tool selection, nodeType formatting
4. **n8n-workflow-patterns** - 5 proven patterns
5. **n8n-validation-expert** - Error interpretation, false positives
6. **n8n-node-configuration** - Operation-aware config
7. **n8n-code-javascript** - Code node best practices
8. **n8n-code-python** - Python Code node guide

## 🔐 Security

- ✅ No hardcoded credentials in codebase
- ✅ Environment variables via .env
- ✅ Comprehensive .gitignore
- ✅ Credentials use n8n credential store
- ✅ Input validation on webhook triggers
- ✅ Rate limiting considered

**Before deploying ANY workflow**:
- [ ] No hardcoded API keys
- [ ] Credentials use n8n store
- [ ] Webhook URLs not exposed in logs
- [ ] Input validation on triggers

## 📚 Documentation

- **CLAUDE.md** - Complete development playbook (START HERE)
- **RUNBOOK.md** - Operational procedures
- **INVENTORY.md** - Asset inventory
- **context/youtube-knowledge/PROTOCOL.md** - YouTube search guide
- **context/discord-knowledge/PROTOCOL.md** - Discord integration
- **context/reddit-knowledge/PROTOCOL.md** - Reddit integration

## 🤝 Contributing

This is a personal workflow development toolkit. If you find it useful:

1. Fork the repository
2. Customize for your n8n instance
3. Update the knowledge bases with your channels/communities
4. Share improvements via pull requests

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- n8n community for 4,343 community workflows
- 20 YouTube channels for 10,279 tutorials
- n8n-mcp developers for MCP integration
- Claude Code team for agent SDK
- Zie619 for maintaining the community workflow library

## 📞 Support

- n8n Discord: https://discord.gg/n8n
- n8n Forum: https://community.n8n.io
- r/n8n: https://reddit.com/r/n8n

---

Built with ❤️ using Claude Code and n8n
