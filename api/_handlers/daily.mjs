import { getDb } from '../db/client.mjs';
import { initDatabase } from '../db/schema.mjs';
import { requireAuth } from '../auth/verify.mjs';
import { decayConfidence } from '../lib/fsrs.mjs';
import { generate, parseJSON } from '../lib/ai.mjs';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
let CONCEPTS = null;
function loadConcepts() {
  if (!CONCEPTS) {
    const p = join(__dirname, '..', '..', 'src', 'data', 'concepts.json');
    CONCEPTS = JSON.parse(readFileSync(p, 'utf8')).concepts;
  }
  return CONCEPTS;
}

let initialized = false;
async function ensureInit() {
  if (!initialized) { await initDatabase(); initialized = true; }
}

const SYSTEM = `You are a brutal but kind engineering coach.

Output STRICT JSON:
{
  "headline": "one sharp sentence — what to do today and why",
  "concept_id": "...",
  "concept_name": "...",
  "task_type": "build|review|read|explain",
  "task_prompt": "specific actionable prompt for the playground",
  "minutes": 15-45,
  "rationale": "1-2 sentences why this beats other options"
}

Pick from weak/due concepts but respect prereqs. Prefer concepts with rotting confidence over untouched ones. Vary task_type day-to-day to avoid burnout.`;

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export default async function handler(req, res) {
  await ensureInit();
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = getDb();
  const today = todayDate();

  // GET: return cached plan if exists
  if (req.method === 'GET') {
    const r = await db.execute({
      sql: 'SELECT plan_json FROM daily_plan WHERE user_id = ? AND date = ?',
      args: [user.id, today],
    });
    if (r.rows.length > 0) {
      return res.status(200).json({ plan: JSON.parse(r.rows[0].plan_json), cached: true });
    }
    return res.status(200).json({ plan: null, cached: false });
  }

  // POST: regenerate
  if (req.method === 'POST') {
    const { aiConfig, force } = req.body || {};
    if (!force) {
      const existing = await db.execute({
        sql: 'SELECT plan_json FROM daily_plan WHERE user_id = ? AND date = ?',
        args: [user.id, today],
      });
      if (existing.rows.length > 0) {
        return res.status(200).json({ plan: JSON.parse(existing.rows[0].plan_json), cached: true });
      }
    }

    const masteryRows = await db.execute({
      sql: 'SELECT concept_id, stability, difficulty, reps, lapses, last_review, due FROM concept_mastery WHERE user_id = ?',
      args: [user.id],
    });
    const now = new Date();
    const masteryMap = {};
    for (const m of masteryRows.rows) {
      masteryMap[m.concept_id] = {
        confidence: decayConfidence(m, now),
        reps: m.reps,
        lapses: m.lapses,
        due: m.due,
        lastReview: m.last_review,
      };
    }

    const concepts = loadConcepts();
    const summary = concepts.map(c => {
      const mst = masteryMap[c.id];
      const status = mst
        ? `conf=${mst.confidence.toFixed(2)} reps=${mst.reps} lapses=${mst.lapses} due=${mst.due?.slice(0,10)}`
        : 'untouched';
      return `${c.id} (${c.category}, prereqs:[${(c.prereqs || []).join(',')}]): ${status}`;
    }).join('\n');

    const recent = await db.execute({
      sql: `SELECT kind, concept_ids, created_at FROM activity_log WHERE user_id = ?
            AND created_at >= datetime('now','-7 days') ORDER BY created_at DESC LIMIT 30`,
      args: [user.id],
    });
    const recentSummary = recent.rows.map(r =>
      `${r.created_at}: ${r.kind} ${r.concept_ids || ''}`
    ).join('\n') || '(no recent activity)';

    const prompt = `Concept mastery snapshot:
${summary}

Recent activity (last 7d):
${recentSummary}

Pick today's single highest-leverage activity. JSON only.`;

    let plan;
    try {
      const text = await generate({ ...(aiConfig || {}), system: SYSTEM, prompt, maxTokens: 800 });
      plan = parseJSON(text);
    } catch (e) {
      return res.status(500).json({ error: 'Daily gen failed: ' + e.message });
    }

    const id = randomBytes(16).toString('hex');
    await db.execute({
      sql: `INSERT INTO daily_plan (id, user_id, date, plan_json) VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id, date) DO UPDATE SET plan_json = excluded.plan_json`,
      args: [id, user.id, today, JSON.stringify(plan)],
    });
    return res.status(200).json({ plan, cached: false });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
