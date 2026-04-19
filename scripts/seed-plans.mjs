#!/usr/bin/env node
/**
 * Seed N days of daily plans for a user, simulating progressive mastery
 * so picks vary day-to-day. Idempotent per (user_id, date).
 *
 * Usage:
 *   node scripts/seed-plans.mjs [days] [user_id_or_email]
 * Defaults: 30 days, single-user-or-error
 *
 * Env: TURSO_DATABASE_URL, TURSO_AUTH_TOKEN (loaded from .env.local)
 */
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';
import { createClient } from '@libsql/client';
import { pickDailyConcept } from '../shared/lib/heuristics.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Load .env.local manually (no dotenv dep)
const envPath = join(ROOT, '.env.local');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] ||= m[2].replace(/^["']|["']$/g, '');
  }
}

const days = parseInt(process.argv[2] || '30', 10);
const userArg = process.argv[3];

const concepts = JSON.parse(readFileSync(join(ROOT, 'src/data/concepts.json'), 'utf8')).concepts;

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function resolveUserId() {
  if (userArg && userArg.length === 32) return userArg; // looks like a hex id
  if (userArg && userArg.includes('@')) {
    const r = await db.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [userArg] });
    if (r.rows[0]) return r.rows[0].id;
    throw new Error(`No user with email ${userArg}`);
  }
  const r = await db.execute('SELECT id, email FROM users');
  if (r.rows.length === 0) throw new Error('No users in DB');
  if (r.rows.length > 1) {
    throw new Error(`Multiple users (${r.rows.map(x=>x.email).join(', ')}). Pass email or id as 2nd arg.`);
  }
  console.log(`Using user: ${r.rows[0].email} (${r.rows[0].id})`);
  return r.rows[0].id;
}

async function loadMastery(userId) {
  const r = await db.execute({
    sql: 'SELECT * FROM concept_mastery WHERE user_id = ?',
    args: [userId],
  });
  return r.rows.map(row => ({ ...row }));
}

function bumpMasteryAfterPick(masteryRows, conceptId, dayOffset) {
  // Simulate: user did the task, confidence rises modestly.
  // After picking conceptId, fake a fresh review so next day's pick varies.
  const reviewedAt = new Date(Date.now() + dayOffset * 86400000).toISOString();
  const existing = masteryRows.find(m => m.concept_id === conceptId);
  if (existing) {
    existing.stability = (existing.stability || 1) * 1.5;
    existing.reps = (existing.reps || 0) + 1;
    existing.last_review = reviewedAt;
    existing.due = new Date(Date.now() + (dayOffset + Math.ceil(existing.stability)) * 86400000).toISOString();
  } else {
    masteryRows.push({
      concept_id: conceptId,
      stability: 1,
      difficulty: 5,
      reps: 1,
      lapses: 0,
      state: 1,
      last_review: reviewedAt,
      due: new Date(Date.now() + (dayOffset + 1) * 86400000).toISOString(),
    });
  }
}

function dateNDaysAhead(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const userId = await resolveUserId();
  console.log(`Seeding ${days} days for user ${userId}…`);

  const masteryRows = await loadMastery(userId);
  console.log(`Loaded ${masteryRows.length} existing mastery rows`);

  let inserted = 0;
  let skipped = 0;
  for (let i = 0; i < days; i++) {
    const date = dateNDaysAhead(i);

    // Skip if already exists
    const existing = await db.execute({
      sql: 'SELECT 1 FROM daily_plan WHERE user_id = ? AND date = ?',
      args: [userId, date],
    });
    if (existing.rows.length > 0) {
      skipped++;
      continue;
    }

    // Use simulated dayOfYear so task_type cycles
    const simulatedDate = new Date(Date.now() + i * 86400000);
    const plan = pickDailyConcept(concepts, masteryRows, simulatedDate);
    if (!plan) {
      console.warn(`No plan for day ${i} (${date})`);
      continue;
    }

    const id = randomBytes(16).toString('hex');
    await db.execute({
      sql: `INSERT INTO daily_plan (id, user_id, date, plan_json) VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id, date) DO UPDATE SET plan_json = excluded.plan_json`,
      args: [id, userId, date, JSON.stringify(plan)],
    });
    inserted++;

    // Simulate completion to vary tomorrow's pick
    bumpMasteryAfterPick(masteryRows, plan.concept_id, i);

    console.log(`${date} → ${plan.concept_id} (${plan.task_type}, ${plan.minutes}min)`);
  }

  console.log(`\nDone. Inserted ${inserted}, skipped ${skipped} existing.`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
