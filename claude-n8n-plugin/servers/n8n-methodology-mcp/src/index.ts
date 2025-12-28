#!/usr/bin/env node
/**
 * n8n Methodology MCP Server v1.1.0
 *
 * Exposes the n8n workflow development methodology as MCP tools:
 * - Pattern search and retrieval
 * - Knowledge base search (YouTube, Discord)
 * - Skill prompts for Claude auto-invocation
 * - Methodology documentation
 *
 * Production-ready with actual knowledge base integration.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as z from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import Fuse from 'fuse.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

// Determine base path - look for project root markers
function findProjectRoot(): string {
  const markers = ['CLAUDE.md', '.claude', 'workflows'];
  let current = process.cwd();

  for (let i = 0; i < 5; i++) {
    const hasMarker = markers.some(m => fs.existsSync(path.join(current, m)));
    if (hasMarker) return current;
    current = path.dirname(current);
  }

  // Fallback to environment variable or cwd
  return process.env.N8N_METHODOLOGY_ROOT || process.cwd();
}

const PROJECT_ROOT = findProjectRoot();

// Knowledge base file mappings (actual files, not generic index.json)
interface KnowledgeSourceConfig {
  file: string;
  dataKey: string;
  fields: string[];
}

const KNOWLEDGE_SOURCES: Record<'youtube' | 'discord', KnowledgeSourceConfig> = {
  youtube: {
    file: 'context/youtube-knowledge/video-index.json',
    dataKey: 'videos',
    fields: ['title', 'channel', 'tags']
  },
  discord: {
    file: 'context/discord-knowledge/discord-questions.json',
    dataKey: 'questions',
    fields: ['question', 'topics']
  }
};

// Type definitions for knowledge base items
interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
  tags?: string[];
}

interface DiscordQuestion {
  date: string;
  username: string;
  question: string;
  link?: string;
  topics?: string[];
}

interface SearchResult {
  source: string;
  title: string;
  content: string;
  url?: string;
  score: number;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// INITIALIZE MCP SERVER
// ============================================================================

const server = new McpServer({
  name: 'n8n-methodology',
  version: '1.1.0'
});

// ============================================================================
// TOOL: get_methodology
// Returns the full CLAUDE.md documentation
// ============================================================================
server.registerTool(
  'get_methodology',
  {
    title: 'Get n8n Methodology',
    description: 'Returns the complete n8n workflow development methodology (CLAUDE.md). Use section param to get specific sections like "CRITICAL KNOWLEDGE" or "TOOL REGISTRY".',
    inputSchema: {
      section: z.string().optional().describe('Optional section to extract (e.g., "CRITICAL KNOWLEDGE", "TOOL REGISTRY", "SKILL SYSTEM")')
    },
    outputSchema: {
      content: z.string(),
      sections: z.array(z.string()).optional()
    }
  },
  async ({ section }) => {
    const claudeMdPath = path.join(PROJECT_ROOT, 'CLAUDE.md');

    if (!fs.existsSync(claudeMdPath)) {
      const errorMsg = `CLAUDE.md not found at ${PROJECT_ROOT}. Ensure N8N_METHODOLOGY_ROOT is set correctly.`;
      return {
        content: [{ type: 'text', text: errorMsg }],
        structuredContent: { content: errorMsg, sections: [] }
      };
    }

    const fullContent = fs.readFileSync(claudeMdPath, 'utf-8');

    // Extract sections from markdown
    const sectionRegex = /^## (.+)$/gm;
    const sections: string[] = [];
    let match;
    while ((match = sectionRegex.exec(fullContent)) !== null) {
      sections.push(match[1]);
    }

    let output: string;
    if (section) {
      // Extract specific section (case-insensitive)
      const sectionLower = section.toLowerCase();
      const sectionMatch = sections.find(s => s.toLowerCase().includes(sectionLower));

      if (!sectionMatch) {
        output = `Section "${section}" not found.\n\nAvailable sections:\n${sections.map(s => `- ${s}`).join('\n')}`;
      } else {
        const sectionStart = fullContent.indexOf(`## ${sectionMatch}`);
        const nextSection = fullContent.indexOf('\n## ', sectionStart + 1);
        output = nextSection === -1
          ? fullContent.slice(sectionStart)
          : fullContent.slice(sectionStart, nextSection);
      }
    } else {
      output = fullContent;
    }

    return {
      content: [{ type: 'text', text: output }],
      structuredContent: { content: output, sections }
    };
  }
);

// ============================================================================
// TOOL: get_skill
// Returns a skill's SKILL.md content for Claude to use
// ============================================================================
server.registerTool(
  'get_skill',
  {
    title: 'Get Skill Prompt',
    description: 'Returns the full skill prompt for a specific n8n skill. Use list_skills to see available skills.',
    inputSchema: {
      skillName: z.string().describe('Skill name: n8n-workflow-dev, n8n-workflow-patterns, n8n-validation-expert, n8n-mcp-tools-expert, n8n-expression-syntax, n8n-node-configuration, n8n-code-javascript, n8n-code-python, n8n-pipeline-middleware')
    },
    outputSchema: {
      skillName: z.string(),
      content: z.string(),
      found: z.boolean()
    }
  },
  async ({ skillName }) => {
    const skillPath = path.join(PROJECT_ROOT, '.claude', 'skills', skillName, 'SKILL.md');

    if (!fs.existsSync(skillPath)) {
      // Try alternate naming patterns
      const altPaths = [
        path.join(PROJECT_ROOT, '.claude', 'skills', skillName + '.md'),
        path.join(PROJECT_ROOT, '.claude', 'skills', skillName.replace(/-/g, '_'), 'SKILL.md')
      ];

      for (const altPath of altPaths) {
        if (fs.existsSync(altPath)) {
          const content = fs.readFileSync(altPath, 'utf-8');
          return {
            content: [{ type: 'text', text: content }],
            structuredContent: { skillName, content, found: true }
          };
        }
      }

      // List available skills for helpful error
      const skillsDir = path.join(PROJECT_ROOT, '.claude', 'skills');
      let availableSkills: string[] = [];
      if (fs.existsSync(skillsDir)) {
        availableSkills = fs.readdirSync(skillsDir, { withFileTypes: true })
          .filter(e => e.isDirectory())
          .map(e => e.name);
      }

      const errorMsg = `Skill "${skillName}" not found.\n\nAvailable skills:\n${availableSkills.map(s => `- ${s}`).join('\n')}`;
      return {
        content: [{ type: 'text', text: errorMsg }],
        structuredContent: { skillName, content: errorMsg, found: false }
      };
    }

    const content = fs.readFileSync(skillPath, 'utf-8');
    return {
      content: [{ type: 'text', text: content }],
      structuredContent: { skillName, content, found: true }
    };
  }
);

// ============================================================================
// TOOL: list_skills
// Lists all available skills with descriptions
// ============================================================================
server.registerTool(
  'list_skills',
  {
    title: 'List Available Skills',
    description: 'Lists all n8n methodology skills available for invocation with descriptions',
    inputSchema: {},
    outputSchema: {
      skills: z.array(z.object({
        name: z.string(),
        description: z.string()
      }))
    }
  },
  async () => {
    const skillsDir = path.join(PROJECT_ROOT, '.claude', 'skills');
    const skills: { name: string; description: string }[] = [];

    if (!fs.existsSync(skillsDir)) {
      return {
        content: [{ type: 'text', text: 'Skills directory not found' }],
        structuredContent: { skills: [] }
      };
    }

    const entries = fs.readdirSync(skillsDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillMd = path.join(skillsDir, entry.name, 'SKILL.md');
        let description = 'No description available';

        if (fs.existsSync(skillMd)) {
          const content = fs.readFileSync(skillMd, 'utf-8');
          // Extract first meaningful paragraph as description
          const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
          if (lines.length > 0) {
            description = lines[0].trim().slice(0, 200);
            if (description.length === 200) description += '...';
          }
        }

        skills.push({ name: entry.name, description });
      }
    }

    // Sort alphabetically
    skills.sort((a, b) => a.name.localeCompare(b.name));

    const formatted = skills.map(s => `**${s.name}**: ${s.description}`).join('\n\n');
    return {
      content: [{ type: 'text', text: formatted }],
      structuredContent: { skills }
    };
  }
);

// ============================================================================
// TOOL: search_knowledge
// Searches across all knowledge bases with actual file formats
// ============================================================================
server.registerTool(
  'search_knowledge',
  {
    title: 'Search Knowledge Bases',
    description: 'Search across YouTube tutorials (10,279 videos) and Discord Q&A (2,930 questions). Returns relevant results with URLs.',
    inputSchema: {
      query: z.string().describe('Search query - e.g., "webhook authentication", "AI agent memory"'),
      sources: z.array(z.enum(['youtube', 'discord', 'all']))
        .optional()
        .describe('Which sources to search (default: all)'),
      limit: z.number().optional().describe('Max results per source (default: 10)')
    },
    outputSchema: {
      results: z.array(z.object({
        source: z.string(),
        title: z.string(),
        content: z.string(),
        url: z.string().optional(),
        score: z.number()
      })),
      totalResults: z.number(),
      sourcesSearched: z.array(z.string())
    }
  },
  async ({ query, sources = ['all'], limit = 10 }) => {
    const results: SearchResult[] = [];
    const sourcesSearched: string[] = [];
    const errors: string[] = [];

    const searchSources = sources.includes('all')
      ? ['youtube', 'discord'] as const
      : sources.filter((s): s is 'youtube' | 'discord' => s !== 'all');

    // Search each source with appropriate file and format
    for (const source of searchSources) {
      const config = KNOWLEDGE_SOURCES[source];
      const indexPath = path.join(PROJECT_ROOT, config.file);

      if (!fs.existsSync(indexPath)) {
        errors.push(`${source}: Index file not found at ${config.file}`);
        continue;
      }

      try {
        const rawData = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
        const items = rawData[config.dataKey] || [];

        if (!Array.isArray(items) || items.length === 0) {
          errors.push(`${source}: No items found in ${config.dataKey}`);
          continue;
        }

        sourcesSearched.push(`${source} (${items.length} items)`);

        // Configure Fuse.js with appropriate fields
        const fuse = new Fuse(items, {
          keys: config.fields,
          threshold: 0.4,
          includeScore: true,
          ignoreLocation: true
        });

        const searchResults = fuse.search(query, { limit });

        for (const result of searchResults) {
          const item = result.item;
          let title: string;
          let content: string;
          let url: string | undefined;

          if (source === 'youtube') {
            const video = item as YouTubeVideo;
            title = video.title;
            content = `Channel: ${video.channel}${video.tags ? ` | Tags: ${video.tags.join(', ')}` : ''}`;
            url = `https://youtube.com/watch?v=${video.id}`;
          } else {
            const question = item as DiscordQuestion;
            title = question.question.slice(0, 100) + (question.question.length > 100 ? '...' : '');
            content = `By: ${question.username} | Topics: ${(question.topics || []).join(', ')} | Date: ${question.date}`;
            url = question.link || undefined;
          }

          results.push({
            source,
            title,
            content,
            url,
            score: Math.round((1 - (result.score || 0)) * 100) / 100
          });
        }
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e);
        errors.push(`${source}: ${errMsg}`);
      }
    }

    // Sort by score (highest first)
    results.sort((a, b) => b.score - a.score);

    // Format output
    let output = `## Search Results for "${query}"\n\n`;
    output += `Searched: ${sourcesSearched.join(', ')}\n\n`;

    if (results.length === 0) {
      output += 'No results found.\n';
      if (errors.length > 0) {
        output += `\nErrors:\n${errors.map(e => `- ${e}`).join('\n')}`;
      }
    } else {
      output += `Found ${results.length} results:\n\n`;
      for (const r of results.slice(0, limit * 2)) {
        output += `### [${r.source.toUpperCase()}] ${r.title}\n`;
        output += `${r.content}\n`;
        if (r.url) output += `URL: ${r.url}\n`;
        output += `Score: ${r.score}\n\n`;
      }
    }

    return {
      content: [{ type: 'text', text: output }],
      structuredContent: {
        results: results.slice(0, limit * 2),
        totalResults: results.length,
        sourcesSearched
      }
    };
  }
);

// ============================================================================
// TOOL: get_workflow_pattern
// Returns workflow pattern documentation
// ============================================================================
server.registerTool(
  'get_workflow_pattern',
  {
    title: 'Get Workflow Pattern',
    description: 'Get a specific n8n workflow pattern with nodes and examples. Use list_patterns to see available patterns.',
    inputSchema: {
      pattern: z.enum([
        'webhook-processing',
        'http-api-integration',
        'database-operations',
        'ai-agent-workflow',
        'scheduled-tasks'
      ]).describe('Pattern name')
    },
    outputSchema: {
      pattern: z.string(),
      description: z.string(),
      nodes: z.array(z.string()),
      example: z.string().optional(),
      bestPractices: z.array(z.string()).optional()
    }
  },
  async ({ pattern }) => {
    // Production-ready pattern definitions with best practices
    const patterns: Record<string, {
      description: string;
      nodes: string[];
      example: string;
      bestPractices: string[];
    }> = {
      'webhook-processing': {
        description: 'Receive external webhooks, validate payloads, transform data, and route to appropriate handlers',
        nodes: ['Webhook', 'IF', 'Set', 'HTTP Request', 'Respond to Webhook'],
        example: `
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Webhook   │────▶│  IF (valid)  │────▶│    Set      │
│  (receive)  │     │              │     │ (transform) │
└─────────────┘     └──────────────┘     └─────────────┘
                           │                    │
                           ▼                    ▼
                    ┌──────────────┐     ┌─────────────┐
                    │Error Handler │     │HTTP Request │
                    │  (notify)    │     │  (forward)  │
                    └──────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  Respond    │
                                        │ to Webhook  │
                                        └─────────────┘`,
        bestPractices: [
          'Always validate incoming payloads before processing',
          'Use Respond to Webhook for synchronous responses',
          'Implement idempotency keys for retry safety',
          'Log webhook receipts for debugging'
        ]
      },
      'http-api-integration': {
        description: 'Call external APIs with authentication, handle pagination, retries, and error responses',
        nodes: ['HTTP Request', 'Set', 'Code', 'Merge', 'IF', 'Loop Over Items'],
        example: `
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Trigger    │────▶│ HTTP Request │────▶│ Loop Over   │
│             │     │   (auth)     │     │   Items     │
└─────────────┘     └──────────────┘     └─────────────┘
                                               │
                    ┌──────────────────────────┴─────┐
                    ▼                                ▼
             ┌─────────────┐                  ┌─────────────┐
             │   Process   │                  │  Aggregate  │
             │    Item     │                  │   Results   │
             └─────────────┘                  └─────────────┘`,
        bestPractices: [
          'Use credentials node for API keys, never hardcode',
          'Implement exponential backoff for retries',
          'Handle rate limits with appropriate delays',
          'Always check response status codes'
        ]
      },
      'database-operations': {
        description: 'CRUD operations with connection pooling, transactions, and batch processing',
        nodes: ['Postgres', 'MySQL', 'MongoDB', 'Set', 'Split In Batches'],
        example: `
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Trigger    │────▶│   Read DB    │────▶│  Transform  │
│             │     │   (source)   │     │    (Set)    │
└─────────────┘     └──────────────┘     └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │  Write DB   │
                                        │   (dest)    │
                                        └─────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │   Notify    │
                                        └─────────────┘`,
        bestPractices: [
          'Use Split In Batches for large datasets',
          'Implement transactions for multi-step operations',
          'Add verification queries after writes',
          'Use parameterized queries to prevent SQL injection'
        ]
      },
      'ai-agent-workflow': {
        description: 'AI agent with tools, memory, structured output parsing, and conversation management',
        nodes: ['AI Agent', 'OpenAI Chat Model', 'Tool nodes', 'Window Buffer Memory', 'Structured Output Parser'],
        example: `
┌─────────────┐     ┌──────────────────────────────────┐
│  Trigger    │────▶│            AI Agent              │
│             │     │    ┌────────┬────────┬────────┐  │
└─────────────┘     │    │ Tool 1 │ Tool 2 │ Tool 3 │  │
                    │    └────────┴────────┴────────┘  │
                    └──────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
             ┌─────────────┐                 ┌─────────────┐
             │   Memory    │                 │  Structured │
             │   Store     │                 │   Output    │
             └─────────────┘                 └─────────────┘

⚠️ AI TOOL CONNECTION: Tools connect TO the agent (reverse flow)`,
        bestPractices: [
          'Connect tools to AI Agent input, not output (reverse connection)',
          'Use Window Buffer Memory for conversation context',
          'Implement Structured Output Parser for predictable outputs',
          'Set appropriate temperature for your use case'
        ]
      },
      'scheduled-tasks': {
        description: 'Cron-based automation with retries, notifications, and error handling',
        nodes: ['Schedule Trigger', 'HTTP Request', 'IF', 'Slack', 'Email Send'],
        example: `
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Schedule   │────▶│  Fetch Data  │────▶│ IF (check)  │
│ (daily 9am) │     │              │     │             │
└─────────────┘     └──────────────┘     └─────────────┘
                                               │
                    ┌──────────────────────────┴─────┐
                    ▼                                ▼
             ┌─────────────┐                  ┌─────────────┐
             │  Alert Team │                  │  All Good   │
             │   (Slack)   │                  │  (no-op)    │
             └─────────────┘                  └─────────────┘`,
        bestPractices: [
          'Use cron expressions for precise scheduling',
          'Implement dead-letter queues for failed executions',
          'Add heartbeat monitoring for critical jobs',
          'Log execution start/end for audit trails'
        ]
      }
    };

    const p = patterns[pattern];
    if (!p) {
      return {
        content: [{ type: 'text', text: `Pattern "${pattern}" not found` }],
        structuredContent: { pattern, description: 'Not found', nodes: [] }
      };
    }

    const output = `## ${pattern}\n\n${p.description}\n\n**Nodes:** ${p.nodes.join(', ')}\n\n**Example:**\n\`\`\`\n${p.example}\n\`\`\`\n\n**Best Practices:**\n${p.bestPractices.map(bp => `- ${bp}`).join('\n')}`;

    return {
      content: [{ type: 'text', text: output }],
      structuredContent: { pattern, ...p }
    };
  }
);

// ============================================================================
// TOOL: list_patterns
// Lists all available workflow patterns
// ============================================================================
server.registerTool(
  'list_patterns',
  {
    title: 'List Workflow Patterns',
    description: 'Lists all available n8n workflow patterns with descriptions',
    inputSchema: {},
    outputSchema: {
      patterns: z.array(z.object({
        name: z.string(),
        description: z.string()
      }))
    }
  },
  async () => {
    const patterns = [
      { name: 'webhook-processing', description: 'Receive and process external webhooks' },
      { name: 'http-api-integration', description: 'Call external APIs with auth and pagination' },
      { name: 'database-operations', description: 'CRUD with transactions and batching' },
      { name: 'ai-agent-workflow', description: 'AI agents with tools and memory' },
      { name: 'scheduled-tasks', description: 'Cron-based automation' }
    ];

    const output = `## Available Workflow Patterns\n\n${patterns.map(p => `- **${p.name}**: ${p.description}`).join('\n')}`;

    return {
      content: [{ type: 'text', text: output }],
      structuredContent: { patterns }
    };
  }
);

// ============================================================================
// TOOL: get_quick_reference
// Returns quick reference for common operations
// ============================================================================
server.registerTool(
  'get_quick_reference',
  {
    title: 'Get Quick Reference',
    description: 'Quick reference for common n8n operations, expressions, and gotchas',
    inputSchema: {
      topic: z.enum([
        'node-types',
        'expressions',
        'webhook-data',
        'ai-connections',
        'partial-updates',
        'validation-profiles',
        'research-quota'
      ]).optional().describe('Specific topic (omit for all)')
    },
    outputSchema: {
      topic: z.string(),
      content: z.string()
    }
  },
  async ({ topic }) => {
    const references: Record<string, string> = {
      'node-types': `## Node Type Formats

| Context | Format | Example |
|---------|--------|---------|
| Search/Validation | \`nodes-base.{name}\` | \`nodes-base.slack\` |
| Workflow JSON | \`n8n-nodes-base.{name}\` | \`n8n-nodes-base.slack\` |
| AI nodes | \`@n8n/n8n-nodes-langchain.{name}\` | \`@n8n/n8n-nodes-langchain.agent\` |`,

      'expressions': `## Expression Syntax

| Expression | Purpose |
|------------|---------|
| \`{{ $json.field }}\` | Access current item field |
| \`{{ $node["Name"].json.field }}\` | Access specific node output |
| \`{{ $input.all() }}\` | Get all input items |
| \`{{ $now.toISO() }}\` | Current timestamp |
| \`{{ $if(condition, true, false) }}\` | Conditional value |`,

      'webhook-data': `## Webhook Data Access

\`\`\`javascript
// WRONG - will be undefined
$json.name

// CORRECT - webhook data is nested in body
$json.body.name
$json.headers.authorization
$json.query.param
\`\`\``,

      'ai-connections': `## AI Connection Pattern

\`\`\`
Standard nodes:  Source → Target  (data flows right)
AI tool nodes:   AI Agent ← Tool  (tool connects TO agent)
\`\`\`

Tools connect to AI Agent's "tools" input, NOT from agent's output.`,

      'partial-updates': `## Partial Updates (80-90% Token Savings)

Always prefer \`n8n_update_partial_workflow\` over full updates:

\`\`\`javascript
n8n_update_partial_workflow({
  id: "workflow-id",
  operations: [
    { type: "addNode", node: {...} },
    { type: "addConnection", source: "A", target: "B" },
    { type: "updateNode", nodeId: "X", changes: { parameters: {...} } },
    { type: "removeNode", nodeId: "Y" }
  ]
})
\`\`\``,

      'validation-profiles': `## Validation Profiles

| Profile | Use Case |
|---------|----------|
| \`minimal\` | Required fields only |
| \`runtime\` | Critical errors (default for workflow validation) |
| \`ai-friendly\` | Balanced (default for node validation) |
| \`strict\` | All checks including best practices |`,

      'research-quota': `## Mandatory Research Quota: 25 Sources

**For any above-trivial workflow design, API question, or diagnostic query:**

| Complexity | Minimum Sources | Diversity |
|------------|-----------------|-----------|
| Trivial | 5 | ≥2 types |
| Moderate+ | **25** | ≥4 types |

### Source Types (each unique = 1):
- n8n node documentation
- n8n templates (2,709 available)
- YouTube tutorials (10,279 indexed)
- Discord Q&A (2,930 indexed)
- Community workflows (4,343 available)
- API docs (Context7, Ref-tools, Exa)
- Reddit threads
- WebSearch results

### Tracking Format:
\`\`\`markdown
## Research Sources ({N}/25 minimum)
| # | Type | Source | Relevance |
|---|------|--------|-----------|
| 1 | YouTube | "Tutorial" | Pattern |
| 2 | Template | #1234 | Structure |
\`\`\``
    };

    if (topic) {
      const content = references[topic] || 'Topic not found';
      return {
        content: [{ type: 'text', text: content }],
        structuredContent: { topic, content }
      };
    }

    // Return all topics
    const allContent = Object.entries(references).map(([t, c]) => c).join('\n\n---\n\n');
    return {
      content: [{ type: 'text', text: allContent }],
      structuredContent: { topic: 'all', content: allContent }
    };
  }
);

// ============================================================================
// Start the server
// ============================================================================
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`n8n-methodology-mcp v1.1.0 started (root: ${PROJECT_ROOT})`);
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
