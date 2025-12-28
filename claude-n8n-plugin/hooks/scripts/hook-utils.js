/**
 * hook-utils.js
 *
 * Shared utilities for Claude Code hooks.
 * Provides logging, path resolution, and common helpers.
 */

const fs = require('fs');
const path = require('path');

// Resolve project root from hooks directory
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const LOGS_DIR = path.join(PROJECT_ROOT, '.claude', 'logs');

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

/**
 * Log hook execution for debugging
 * @param {string} hookName - Name of the hook
 * @param {string} message - Log message
 * @param {object} data - Optional data to log
 */
function logHook(hookName, message, data = null) {
  const timestamp = new Date().toISOString();
  const logFile = path.join(LOGS_DIR, 'hooks.log');

  let logEntry = `[${timestamp}] [${hookName}] ${message}`;
  if (data) {
    logEntry += `\n  Data: ${JSON.stringify(data, null, 2).replace(/\n/g, '\n  ')}`;
  }
  logEntry += '\n';

  try {
    fs.appendFileSync(logFile, logEntry);
  } catch (e) {
    // Silent fail - logging should never break hooks
  }
}

/**
 * Get project root path
 * @returns {string} Absolute path to project root
 */
function getProjectRoot() {
  return PROJECT_ROOT;
}

/**
 * Read stdin as JSON (for hook input)
 * @returns {Promise<object>} Parsed JSON input
 */
function readStdinJson() {
  return new Promise((resolve, reject) => {
    let input = '';
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', chunk => {
      input += chunk;
    });

    process.stdin.on('end', () => {
      try {
        resolve(JSON.parse(input || '{}'));
      } catch (e) {
        resolve({});
      }
    });

    process.stdin.on('error', reject);
  });
}

/**
 * Output hook result
 * @param {object} result - Hook result object
 */
function outputResult(result) {
  console.log(JSON.stringify(result));
}

module.exports = {
  logHook,
  getProjectRoot,
  readStdinJson,
  outputResult,
  PROJECT_ROOT,
  LOGS_DIR
};
