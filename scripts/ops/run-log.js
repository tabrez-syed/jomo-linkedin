/**
 * Ops Run Log — shared utility for all ops processes
 *
 * Writes to ops/run-log.jsonl (append-only, one JSON object per line).
 * Each entry records: process name, timestamp, outcome, and details.
 *
 * Usage from shell scripts:
 *   node scripts/ops/run-log.js log <process> <outcome> [reason]
 *   node scripts/ops/run-log.js check <process> <days>
 *
 * Examples:
 *   node scripts/ops/run-log.js log data-collection-weekly-review completed "Minutes written"
 *   node scripts/ops/run-log.js log data-collection-weekly-review skipped "Already ran this week"
 *   node scripts/ops/run-log.js log data-collection-weekly-review prerequisite-failure "No fresh reports"
 *   node scripts/ops/run-log.js check data-collection-weekly-review 6
 *     → exits 0 if a "completed" entry exists within last 6 days (already ran)
 *     → exits 1 if no recent completed entry (should run)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const LOG_PATH = path.join(ROOT, 'ops/run-log.jsonl');

function appendEntry(entry) {
  const line = JSON.stringify(entry) + '\n';
  fs.appendFileSync(LOG_PATH, line);
}

function readEntries() {
  if (!fs.existsSync(LOG_PATH)) return [];
  return fs.readFileSync(LOG_PATH, 'utf-8')
    .split('\n')
    .filter(line => line.trim())
    .map(line => JSON.parse(line));
}

function logEntry(procName, outcome, reason) {
  const entry = {
    process: procName,
    timestamp: new Date().toISOString(),
    outcome,
    reason: reason || null,
  };
  appendEntry(entry);
  console.log(JSON.stringify(entry, null, 2));
}

function checkRecent(procName, days) {
  const entries = readEntries();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const recent = entries.find(
    e => e.process === procName
      && e.outcome === 'completed'
      && new Date(e.timestamp).getTime() > cutoff
  );
  if (recent) {
    console.log(`Last completed run: ${recent.timestamp}`);
    console.log(recent.reason || '');
    globalThis.process.exit(0); // Already ran — skip
  } else {
    globalThis.process.exit(1); // No recent run — should proceed
  }
}

// CLI
const [,, command, ...args] = globalThis.process.argv;

if (command === 'log') {
  const [proc, outcome, ...reasonParts] = args;
  if (!proc || !outcome) {
    console.error('Usage: run-log.js log <process> <outcome> [reason]');
    globalThis.process.exit(1);
  }
  logEntry(proc, outcome, reasonParts.join(' ') || null);
} else if (command === 'check') {
  const [proc, days] = args;
  if (!proc || !days) {
    console.error('Usage: run-log.js check <process> <days>');
    globalThis.process.exit(1);
  }
  checkRecent(proc, parseInt(days, 10));
} else {
  console.error('Usage: run-log.js <log|check> ...');
  globalThis.process.exit(1);
}
