#!/usr/bin/env node

/**
 * YouTube Video Indexer for n8n Knowledge Base
 *
 * Systematically fetches ALL videos from configured channels and updates video-index.json
 * Uses YouTube Data API v3 directly to avoid context bloat
 *
 * Features:
 * - Incremental saving (no context overflow)
 * - Progress tracking
 * - Tag inference from video titles/descriptions
 * - Duplicate detection
 * - Handles pagination (50 videos per request)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Configuration
const API_KEY = process.env.YOUTUBE_API_KEY;
if (!API_KEY) {
  console.error('❌ Error: YOUTUBE_API_KEY not found in environment variables');
  console.error('   Please create a .env file in the project root with:');
  console.error('   YOUTUBE_API_KEY=your_api_key_here');
  process.exit(1);
}

const INDEX_FILE = path.join(__dirname, '../context/youtube-knowledge/video-index.json');
const MAX_RESULTS_PER_PAGE = 50;

// Tag inference mapping
const TAG_PATTERNS = {
  'beginner': /beginner|tutorial|getting started|introduction|quick start|zero to hero/i,
  'ai-agents': /ai agent|agentic|autonomous agent/i,
  'webhook': /webhook/i,
  'course': /course|full course|masterclass|complete guide/i,
  'langchain': /langchain/i,
  'slack': /slack/i,
  'telegram': /telegram/i,
  'whatsapp': /whatsapp/i,
  'chatbot': /chatbot|chat bot/i,
  'rag': /rag|retrieval augmented|knowledge base/i,
  'memory': /memory|remember|persistent/i,
  'voice': /voice|speech|audio|elevenlabs/i,
  'multi-agent': /multi[- ]agent|agent swarm|team of agents/i,
  'error-handling': /error handling|error management|debugging/i,
  'gmail': /gmail|email automation/i,
  'templates': /template/i,
  'business': /sell|business|monetize|make money/i,
  'no-code': /no code|no-code/i,
  'self-host': /self[- ]host|local|private/i,
  'workflow-builder': /workflow builder|ai builder/i,
  'api': /api|http request/i,
  'database': /database|postgres|mysql|supabase/i,
  'scheduling': /schedule|cron|timer/i,
  'advanced': /advanced|expert|pro/i,
  'quickstart': /quick|minutes|fast/i,
  'free': /free/i,
  '2025': /2025/i,
  '2026': /2026/i
};

// YouTube API helper
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

// Infer tags from title and description
function inferTags(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const tags = [];

  for (const [tag, pattern] of Object.entries(TAG_PATTERNS)) {
    if (pattern.test(text)) {
      tags.push(tag);
    }
  }

  return tags.length > 0 ? tags : ['general'];
}

// Fetch all videos from a channel
async function fetchChannelVideos(channelId, channelName) {
  console.log(`\n📺 Fetching videos from: ${channelName}`);

  // First, get the uploads playlist ID
  const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${API_KEY}`;
  const channelData = await makeRequest(channelUrl);

  if (!channelData.items || channelData.items.length === 0) {
    console.log(`   ⚠️  Channel not found: ${channelId}`);
    return [];
  }

  const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

  // Fetch all videos from uploads playlist (with pagination)
  let videos = [];
  let nextPageToken = null;
  let pageCount = 0;

  do {
    pageCount++;
    let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${MAX_RESULTS_PER_PAGE}&key=${API_KEY}`;
    if (nextPageToken) url += `&pageToken=${nextPageToken}`;

    const response = await makeRequest(url);

    if (response.items) {
      const pageVideos = response.items
        .filter(item => item.snippet.title !== 'Private video' && item.snippet.title !== 'Deleted video')
        .map(item => ({
          id: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          channel: channelName,
          tags: inferTags(item.snippet.title, item.snippet.description || ''),
          publishedAt: item.snippet.publishedAt
        }));

      videos.push(...pageVideos);
      console.log(`   Page ${pageCount}: +${pageVideos.length} videos (total: ${videos.length})`);
    }

    nextPageToken = response.nextPageToken;

    // Rate limiting: 50ms delay between requests
    if (nextPageToken) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  } while (nextPageToken);

  console.log(`   ✅ Total fetched: ${videos.length} videos`);
  return videos;
}

// Main indexing function
async function indexAllChannels() {
  console.log('🚀 YouTube Knowledge Base Indexer');
  console.log('==================================\n');

  // Read current index
  const indexData = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
  const channels = indexData.channels;

  console.log(`📋 Channels to process: ${Object.keys(channels).length}`);

  let allVideos = [];
  let totalVideos = 0;
  const startTime = Date.now();

  // Process each channel
  for (const [channelId, channelName] of Object.entries(channels)) {
    try {
      const videos = await fetchChannelVideos(channelId, channelName);
      allVideos.push(...videos);
      totalVideos += videos.length;

      // Rate limiting between channels: 100ms
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`   ❌ Error fetching ${channelName}: ${error.message}`);
    }
  }

  // Remove duplicates (by video ID)
  const uniqueVideos = Array.from(
    new Map(allVideos.map(v => [v.id, v])).values()
  );

  // Sort by published date (newest first)
  uniqueVideos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  // Remove publishedAt field (not needed in final index)
  uniqueVideos.forEach(v => delete v.publishedAt);

  // Update index
  indexData.videos = uniqueVideos;
  indexData.meta.totalVideos = uniqueVideos.length;
  indexData.meta.lastUpdated = new Date().toISOString().split('T')[0];
  indexData.meta.lastIndexedBy = 'youtube-indexer.js';

  // Build tag index for fast searching
  const tagIndex = {};
  uniqueVideos.forEach((video, idx) => {
    video.tags.forEach(tag => {
      if (!tagIndex[tag]) tagIndex[tag] = [];
      tagIndex[tag].push(idx);
    });
  });
  indexData.tagIndex = tagIndex;

  // Save updated index
  fs.writeFileSync(INDEX_FILE, JSON.stringify(indexData, null, 2));

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n✨ Indexing Complete!');
  console.log('====================');
  console.log(`Total videos indexed: ${uniqueVideos.length}`);
  console.log(`Total tags: ${Object.keys(tagIndex).length}`);
  console.log(`Duration: ${duration}s`);
  console.log(`Duplicates removed: ${totalVideos - uniqueVideos.length}`);
  console.log(`\n📁 Saved to: ${INDEX_FILE}`);

  // Show tag distribution
  console.log('\n📊 Tag Distribution:');
  const tagStats = Object.entries(tagIndex)
    .map(([tag, videos]) => ({ tag, count: videos.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  tagStats.forEach(({ tag, count }) => {
    console.log(`   ${tag.padEnd(20)} ${count} videos`);
  });
}

// Run the indexer
indexAllChannels().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
