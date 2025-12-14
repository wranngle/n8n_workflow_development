#!/usr/bin/env node

/**
 * Discord #general Channel Processor
 *
 * Processes Discord #general channel CSV export and generates:
 * - General discussions index
 * - Announcement tracking
 * - Workflow showcase index
 * - Community trends analysis
 *
 * Input: n8n Discord general.csv
 * Output: context/discord-knowledge/general-*.json files
 */

const fs = require('fs');
const path = require('path');

// File paths
const CSV_FILE = path.join(__dirname, '..', 'n8n Discord general.csv');
const OUTPUT_DIR = path.join(__dirname, '..', 'context', 'discord-knowledge');

// Content type patterns
const CONTENT_TYPES = {
  'announcement': /announce|release|update|version|new feature|breaking change/i,
  'showcase': /showcase|built|created|made|workflow|automation|share|check out/i,
  'question': /\?|how to|can i|is it possible|does anyone|help|issue|problem/i,
  'integration': /integrate|api|connect|webhook|oauth|credential/i,
  'workflow-share': /workflow|json|template|export|import/i,
  'community': /thanks|thank you|great|awesome|nice|cool/i,
  'error-report': /error|fail|bug|crash|not working|broken/i,
  'feature-request': /feature|request|would be nice|suggestion|could we/i
};

// Topic patterns (reuse from qa-processor)
const TOPIC_PATTERNS = {
  'ai-agents': /ai agent|langchain|llm|chat|memory|rag|embedding|vector/i,
  'mcp-integration': /mcp|model context protocol|execute tool/i,
  'http-requests': /http|api|request|webhook|rest|endpoint/i,
  'database': /postgres|mysql|database|sql|query/i,
  'error-handling': /error|fail|problem|issue|troubleshoot|debug/i,
  'authentication': /auth|oauth|credential|token|api key/i,
  'workflows': /workflow|node|trigger|execution|activate/i,
  'data-transformation': /transform|map|filter|split|merge|json/i,
  'scheduling': /schedule|cron|interval|time|trigger/i,
  'integration': /slack|discord|notion|google|pipedrive|11labs|zapier/i,
  'pagination': /pagination|loop|batch|iterate/i,
  'expressions': /expression|{{\s*\$|variable|\$json|\$node/i,
  'deployment': /self-host|docker|install|version|upgrade/i,
  'code-node': /code node|javascript|python|function/i,
  'conditional': /if|switch|condition|route|branch/i,
  'announcement': /announce|release|update|version/i,
  'showcase': /showcase|built|created|share/i
};

/**
 * Parse CSV line handling quotes and commas
 */
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && nextChar === '"') {
      current += '"';
      i++; // Skip next quote
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  fields.push(current.trim());
  return fields;
}

/**
 * Classify content type
 */
function classifyContentType(content) {
  const types = [];

  for (const [type, pattern] of Object.entries(CONTENT_TYPES)) {
    if (pattern.test(content)) {
      types.push(type);
    }
  }

  return types.length > 0 ? types : ['general'];
}

/**
 * Extract topics from content
 */
function extractTopics(content) {
  const topics = [];

  for (const [topic, pattern] of Object.entries(TOPIC_PATTERNS)) {
    if (pattern.test(content)) {
      topics.push(topic);
    }
  }

  return topics.length > 0 ? topics : ['general'];
}

/**
 * Extract keywords (filter stop words)
 */
function extractKeywords(text) {
  const stopWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for',
    'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his',
    'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my',
    'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if',
    'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like',
    'just', 'him', 'know', 'take', 'into', 'your', 'some', 'could', 'them',
    'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over',
    'think', 'also', 'back', 'after', 'use', 'how', 'our', 'work', 'first',
    'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give',
    'most', 'us', 'is', 'am', 'are', 'was', 'were', 'been', 'being', 'has',
    'had', 'having', 'does', 'did', 'done', 'doing'
  ]);

  const words = text.toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  return [...new Set(words)];
}

/**
 * Main processing function
 */
function processGeneralChannel() {
  console.log('Reading CSV file...');
  const csvContent = fs.readFileSync(CSV_FILE, 'utf8');
  const lines = csvContent.split('\n');

  console.log(`Total lines: ${lines.length}`);

  const messages = [];
  const contentTypeIndex = {};
  const topicIndex = {};
  const keywordIndex = {};
  const userStats = {};
  const dailyStats = {};

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('﻿')) continue;

    try {
      const fields = parseCSVLine(line);

      if (fields.length < 4) continue;

      const date = fields[0].replace(/^"|"$/g, '');
      const username = fields[1].replace(/^"|"$/g, '');
      const userTag = fields[2].replace(/^"|"$/g, '');
      const content = fields[3].replace(/^"|"$/g, '');
      const mentions = fields[4] ? fields[4].replace(/^"|"$/g, '') : '';
      const link = fields[5] ? fields[5].replace(/^"|"$/g, '') : '';

      // Skip empty or very short messages
      if (!content || content.length < 10) continue;

      // Skip bot messages
      if (username.toLowerCase().includes('bot') || content.startsWith('!')) continue;

      // Classify and extract
      const contentTypes = classifyContentType(content);
      const topics = extractTopics(content);
      const keywords = extractKeywords(content);

      const message = {
        index: messages.length,
        date,
        username,
        userTag,
        content: content.substring(0, 500), // Limit length
        contentTypes,
        topics,
        mentions: mentions ? mentions.split(',').map(m => m.trim()) : [],
        link: link || null
      };

      messages.push(message);

      // Build indexes
      contentTypes.forEach(type => {
        if (!contentTypeIndex[type]) contentTypeIndex[type] = [];
        contentTypeIndex[type].push(message.index);
      });

      topics.forEach(topic => {
        if (!topicIndex[topic]) topicIndex[topic] = [];
        topicIndex[topic].push(message.index);
      });

      keywords.forEach(keyword => {
        if (!keywordIndex[keyword]) keywordIndex[keyword] = [];
        keywordIndex[keyword].push(message.index);
      });

      // User stats
      if (!userStats[username]) {
        userStats[username] = { messages: 0, types: {} };
      }
      userStats[username].messages++;
      contentTypes.forEach(type => {
        userStats[username].types[type] = (userStats[username].types[type] || 0) + 1;
      });

      // Daily stats
      const day = date.split(',')[0];
      if (!dailyStats[day]) {
        dailyStats[day] = { total: 0, types: {} };
      }
      dailyStats[day].total++;
      contentTypes.forEach(type => {
        dailyStats[day].types[type] = (dailyStats[day].types[type] || 0) + 1;
      });

    } catch (error) {
      console.warn(`Error parsing line ${i}: ${error.message}`);
    }
  }

  console.log(`\nProcessed ${messages.length} messages`);

  // Generate statistics
  const stats = {
    totalMessages: messages.length,
    dateRange: {
      start: messages[0]?.date || 'N/A',
      end: messages[messages.length - 1]?.date || 'N/A'
    },
    contentTypes: Object.entries(contentTypeIndex)
      .map(([type, indexes]) => ({ type, count: indexes.length }))
      .sort((a, b) => b.count - a.count),
    topTopics: Object.entries(topicIndex)
      .map(([topic, indexes]) => ({ topic, count: indexes.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
    topKeywords: Object.entries(keywordIndex)
      .map(([keyword, indexes]) => ({ keyword, count: indexes.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50),
    topContributors: Object.entries(userStats)
      .map(([username, data]) => ({ username, messages: data.messages }))
      .sort((a, b) => b.messages - a.messages)
      .slice(0, 20),
    dailyActivity: Object.entries(dailyStats)
      .map(([day, data]) => ({ day, total: data.total, types: data.types }))
      .sort((a, b) => a.day.localeCompare(b.day))
  };

  // Save output files
  console.log('\nSaving output files...');

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'general-messages.json'),
    JSON.stringify({ messages, generatedAt: new Date().toISOString() }, null, 2)
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'general-contenttype-index.json'),
    JSON.stringify({ contentTypes: contentTypeIndex }, null, 2)
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'general-topic-index.json'),
    JSON.stringify({ topics: topicIndex }, null, 2)
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'general-keyword-index.json'),
    JSON.stringify(keywordIndex, null, 2)
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'general-statistics.json'),
    JSON.stringify(stats, null, 2)
  );

  // Generate README
  const readme = generateReadme(stats);
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'GENERAL-README.md'),
    readme
  );

  console.log('\n✅ Processing complete!');
  console.log(`\nFiles created in ${OUTPUT_DIR}:`);
  console.log('- general-messages.json');
  console.log('- general-contenttype-index.json');
  console.log('- general-topic-index.json');
  console.log('- general-keyword-index.json');
  console.log('- general-statistics.json');
  console.log('- GENERAL-README.md');

  return stats;
}

/**
 * Generate README content
 */
function generateReadme(stats) {
  return `# n8n Discord #general Channel Knowledge Base

> Processed from ${stats.totalMessages} community messages

## 📊 Statistics

- **Total Messages**: ${stats.totalMessages.toLocaleString()}
- **Date Range**: ${stats.dateRange.start} to ${stats.dateRange.end}
- **Content Types**: ${stats.contentTypes.length}
- **Unique Keywords**: ${Object.keys(stats.topKeywords).length}+

## 📝 Content Types

${stats.contentTypes.slice(0, 10).map((ct, i) =>
  `${i + 1}. **${ct.type}**: ${ct.count.toLocaleString()} messages`
).join('\n')}

## 🏷️ Top Topics

${stats.topTopics.slice(0, 15).map((t, i) =>
  `${i + 1}. **${t.topic}**: ${t.count.toLocaleString()} messages`
).join('\n')}

## 🔍 Most Common Keywords

${stats.topKeywords.slice(0, 20).map((kw, i) =>
  `${i + 1}. ${kw.keyword} (${kw.count})`
).join('\n')}

## 👥 Top Contributors

${stats.topContributors.slice(0, 10).map((c, i) =>
  `${i + 1}. **${c.username}**: ${c.messages} messages`
).join('\n')}

## 📅 Daily Activity

${stats.dailyActivity.map(d =>
  `- **${d.day}**: ${d.total} messages`
).join('\n')}

## 📁 Files

- \`general-messages.json\` - Full message database with metadata
- \`general-contenttype-index.json\` - Messages indexed by content type
- \`general-topic-index.json\` - Messages indexed by topic
- \`general-keyword-index.json\` - Messages indexed by keyword
- \`general-statistics.json\` - Detailed statistics

## 🔍 How to Search

### By Content Type
\`\`\`javascript
const contentTypeIndex = require('./general-contenttype-index.json');
const messages = require('./general-messages.json');

// Get all announcements
const announcementIndexes = contentTypeIndex.contentTypes['announcement'];
const announcements = announcementIndexes.map(i => messages.messages[i]);
\`\`\`

### By Topic
\`\`\`javascript
const topicIndex = require('./general-topic-index.json');
const messages = require('./general-messages.json');

// Get all AI agent discussions
const aiIndexes = topicIndex.topics['ai-agents'];
const aiMessages = aiIndexes.map(i => messages.messages[i]);
\`\`\`

### By Keyword
\`\`\`javascript
const keywordIndex = require('./general-keyword-index.json');
const messages = require('./general-messages.json');

// Search for "workflow" messages
const workflowIndexes = keywordIndex['workflow'] || [];
const workflowMessages = workflowIndexes.map(i => messages.messages[i]);
\`\`\`

## 🤖 Integration with Claude Code

This knowledge base complements the Q&A database (discord-questions.json) with:
- Community discussions and trends
- Announcements and updates
- Workflow showcases
- General community sentiment

---

*Generated by discord-general-processor.js on ${new Date().toISOString()}*
`;
}

// Run processor
if (require.main === module) {
  try {
    const stats = processGeneralChannel();

    console.log('\n📊 Summary:');
    console.log(`- Messages processed: ${stats.totalMessages}`);
    console.log(`- Content types identified: ${stats.contentTypes.length}`);
    console.log(`- Topics covered: ${stats.topTopics.length}`);
    console.log(`- Top content type: ${stats.contentTypes[0]?.type} (${stats.contentTypes[0]?.count})`);
    console.log(`- Top topic: ${stats.topTopics[0]?.topic} (${stats.topTopics[0]?.count})`);

  } catch (error) {
    console.error('❌ Error processing general channel:', error);
    process.exit(1);
  }
}

module.exports = { processGeneralChannel };
