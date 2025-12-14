#!/usr/bin/env node
/**
 * cache-top-transcripts.js
 *
 * Pre-caches transcripts for the most important n8n tutorial videos.
 * Run with: node scripts/cache-top-transcripts.js
 *
 * Requires: YOUTUBE_API_KEY in .env (or environment variable)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load .env if it exists
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim();
    }
  });
}

const TRANSCRIPTS_DIR = path.join(__dirname, '..', 'context', 'youtube-knowledge', 'transcripts');

// Priority videos for pre-caching
// These are the most relevant for n8n workflow development
const PRIORITY_VIDEOS = [
  // PDF/Document Processing
  { id: 'pXDgpYyEkeM', topic: 'pdf-extraction', title: 'Extract Text From ANYTHING Using AI + n8n' },

  // Beginner Courses
  { id: 'GIZzRGYpCbM', topic: 'beginner', title: 'freeCodeCamp 6-hour n8n Course' },
  { id: 'lK3veuZAg0c', topic: 'beginner-to-pro', title: 'Nick Saraev - Beginner to Pro' },

  // AI Agents
  { id: 'ZHH3sr234zY', topic: 'ai-agents', title: 'Nate Herk AI Agent Masterclass' },
  { id: '4o0AJYBEiBo', topic: 'langchain', title: 'LangChain Code Node Tutorial' },

  // Error Handling
  { id: 'Zy4cVtHJNvc', topic: 'error-handling', title: '5 Production Error Handling Techniques' },

  // Webhooks & APIs
  { id: 'lK3veuZAg0c', topic: 'webhooks', title: 'Webhook Tutorial' },

  // Common Integrations
  { id: 'Jm7kfWYPaVw', topic: 'whatsapp', title: 'WhatsApp + Google Sheets Agent' }
];

// Ensure transcripts directory exists
if (!fs.existsSync(TRANSCRIPTS_DIR)) {
  fs.mkdirSync(TRANSCRIPTS_DIR, { recursive: true });
}

/**
 * Check if transcript is already cached
 */
function isTranscriptCached(videoId) {
  const cachePath = path.join(TRANSCRIPTS_DIR, `${videoId}.json`);
  return fs.existsSync(cachePath);
}

/**
 * Save transcript to cache
 */
function saveTranscript(videoId, data) {
  const cachePath = path.join(TRANSCRIPTS_DIR, `${videoId}.json`);
  fs.writeFileSync(cachePath, JSON.stringify(data, null, 2));
  console.log(`  Cached: ${cachePath}`);
}

/**
 * Fetch transcript using YouTube's timedtext API (no API key needed for captions)
 * This is a simplified approach - in production you'd use the YouTube MCP
 */
async function fetchTranscript(videoId) {
  return new Promise((resolve, reject) => {
    // First, get the video page to find caption tracks
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    https.get(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // Look for caption track in the page
        const captionMatch = data.match(/"captionTracks":\[.*?"baseUrl":"([^"]+)"/);
        if (!captionMatch) {
          resolve({ status: 'no_captions', videoId, message: 'No captions available' });
          return;
        }

        // Clean up the URL
        const captionUrl = captionMatch[1].replace(/\\u0026/g, '&');

        // Fetch the captions
        https.get(captionUrl, (captionRes) => {
          let captionData = '';
          captionRes.on('data', chunk => captionData += chunk);
          captionRes.on('end', () => {
            // Parse the XML captions
            const texts = [];
            const textMatches = captionData.matchAll(/<text start="([^"]+)" dur="([^"]+)"[^>]*>([^<]*)<\/text>/g);
            for (const match of textMatches) {
              texts.push({
                start: parseFloat(match[1]),
                duration: parseFloat(match[2]),
                text: match[3]
                  .replace(/&amp;/g, '&')
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/&#39;/g, "'")
                  .replace(/&quot;/g, '"')
              });
            }

            resolve({
              status: 'success',
              videoId,
              fetchedAt: new Date().toISOString(),
              segments: texts,
              fullText: texts.map(t => t.text).join(' ')
            });
          });
        }).on('error', err => {
          resolve({ status: 'error', videoId, message: err.message });
        });
      });
    }).on('error', err => {
      resolve({ status: 'error', videoId, message: err.message });
    });
  });
}

async function main() {
  console.log('Pre-caching Priority YouTube Transcripts\n');
  console.log(`Found ${PRIORITY_VIDEOS.length} priority videos`);

  let cached = 0;
  let skipped = 0;
  let failed = 0;

  for (const video of PRIORITY_VIDEOS) {
    console.log(`\n[${video.topic}] ${video.title}`);

    if (isTranscriptCached(video.id)) {
      console.log(`  Already cached, skipping`);
      skipped++;
      continue;
    }

    console.log(`  Fetching transcript for ${video.id}...`);
    try {
      const result = await fetchTranscript(video.id);

      if (result.status === 'success') {
        saveTranscript(video.id, result);
        cached++;
      } else {
        console.log(`  Failed: ${result.message || 'Unknown error'}`);
        // Save the failure status so we don't retry
        saveTranscript(video.id, result);
        failed++;
      }

      // Rate limiting - wait between requests
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.log(`  Error: ${err.message}`);
      failed++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Cached: ${cached}`);
  console.log(`Skipped (already cached): ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`\nTranscripts saved to: ${TRANSCRIPTS_DIR}`);
}

main().catch(console.error);
