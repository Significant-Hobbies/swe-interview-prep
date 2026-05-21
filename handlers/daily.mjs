import { getDb } from '../shared/db/client.mjs';
import { initDatabase } from '../shared/db/schema.mjs';
import { requireAuth } from '../api/auth/verify.mjs';
import { decayConfidence } from '../shared/lib/fsrs.mjs';
import { generate, parseJSON } from '../shared/lib/ai.mjs';
import { pickDailyConcept } from '../shared/lib/heuristics.mjs';
import { enrichPlanWithRoadmap, getRoadmapContext } from '../shared/lib/roadmap-context.mjs';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
let CONCEPTS = null;
function loadConcepts() {
  if (!CONCEPTS) {
    const p = join(__dirname, '..', 'src', 'data', 'concepts.json');
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

Pick from weak/due concepts but respect prereqs. Prefer concepts with rotting confidence over untouched ones. Vary task_type day-to-day to avoid burnout.

The task_prompt must include the roadmap proof contract for the selected concept: track, milestone, exit criteria, and required artifacts.`;

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function dateNDaysAhead(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const TOPUP_MIN_AHEAD = 7;     // Trigger topup if fewer future plans than this
const TOPUP_TARGET_AHEAD = 30; // Generate up to this many days ahead

/**
 * Auto-extend daily_plan: if fewer than TOPUP_MIN_AHEAD plans exist for
 * future dates, generate plans up to TOPUP_TARGET_AHEAD days ahead.
 * Uses heuristic only (no AI). Simulates progressive completion to
 * vary picks day-to-day.
 */
async function ensureUpcomingPlans(db, userId) {
  const today = todayDate();
  const r = await db.execute({
    sql: `SELECT date FROM daily_plan WHERE user_id = ? AND date >= ? ORDER BY date`,
    args: [userId, today],
  });
  const existingDates = new Set(r.rows.map(row => row.date));
  const futureCount = [...existingDates].filter(d => d > today).length;
  if (futureCount >= TOPUP_MIN_AHEAD) return 0;

  // Load real mastery state
  const masteryRes = await db.execute({
    sql: 'SELECT concept_id, stability, difficulty, reps, lapses, last_review, due, state FROM concept_mastery WHERE user_id = ?',
    args: [userId],
  });
  const masteryRows = masteryRes.rows.map(r => ({ ...r }));
  const concepts = loadConcepts();

  let inserted = 0;
  for (let i = 0; i < TOPUP_TARGET_AHEAD; i++) {
    const date = dateNDaysAhead(i);
    if (existingDates.has(date)) continue;
    const simulatedDate = new Date(Date.now() + i * 86400000);
    const plan = pickDailyConcept(concepts, masteryRows, simulatedDate);
    if (!plan) continue;

    const id = randomBytes(16).toString('hex');
    await db.execute({
      sql: `INSERT INTO daily_plan (id, user_id, date, plan_json) VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id, date) DO UPDATE SET plan_json = excluded.plan_json`,
      args: [id, userId, date, JSON.stringify(plan)],
    });
    inserted++;

    // Simulate completion to vary tomorrow's pick
    const existing = masteryRows.find(m => m.concept_id === plan.concept_id);
    const reviewedAt = simulatedDate.toISOString();
    if (existing) {
      existing.stability = (existing.stability || 1) * 1.5;
      existing.reps = (existing.reps || 0) + 1;
      existing.last_review = reviewedAt;
      existing.due = new Date(simulatedDate.getTime() + Math.ceil(existing.stability) * 86400000).toISOString();
    } else {
      masteryRows.push({
        concept_id: plan.concept_id,
        stability: 1, difficulty: 5, reps: 1, lapses: 0, state: 1,
        last_review: reviewedAt,
        due: new Date(simulatedDate.getTime() + 86400000).toISOString(),
      });
    }
  }
  return inserted;
}

export default async function handler(req, res) {
  await ensureInit();
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = getDb();
  const today = todayDate();

  // GET: return today's cached plan + upcoming preview. Auto-extends if needed.
  if (req.method === 'GET') {
    // Background top-up. Don't block the response on it for too long.
    let toppedUp = 0;
    try { toppedUp = await ensureUpcomingPlans(db, user.id); } catch (e) {
      console.error('Topup failed:', e.message);
    }

    const r = await db.execute({
      sql: 'SELECT date, plan_json FROM daily_plan WHERE user_id = ? AND date >= ? ORDER BY date LIMIT 14',
      args: [user.id, today],
    });

    const todayRow = r.rows.find(row => row.date === today);
    const upcoming = r.rows
      .filter(row => row.date > today)
      .map(row => ({ date: row.date, ...JSON.parse(row.plan_json) }));

    return res.status(200).json({
      plan: todayRow ? JSON.parse(todayRow.plan_json) : null,
      cached: !!todayRow,
      upcoming,
      toppedUp,
    });
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
    const conceptById = Object.fromEntries(concepts.map(c => [c.id, c]));
    const summary = concepts.map(c => {
      const mst = masteryMap[c.id];
      const roadmap = getRoadmapContext(c);
      const status = mst
        ? `conf=${mst.confidence.toFixed(2)} reps=${mst.reps} lapses=${mst.lapses} due=${mst.due?.slice(0,10)}`
        : 'untouched';
      return `${c.id} (${c.category}, roadmap:${roadmap?.track || 'n/a'} > ${roadmap?.milestone || 'n/a'}, prereqs:[${(c.prereqs || []).join(',')}]): ${status}`;
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
    const useAI = aiConfig && aiConfig.endpointUrl && aiConfig.apiKey && aiConfig.model;
    if (useAI) {
      try {
        const text = await generate({ ...aiConfig, system: SYSTEM, prompt, maxTokens: 800 });
        plan = parseJSON(text);
      } catch (e) {
        // AI failed — fall back to heuristic instead of 500
        plan = pickDailyConcept(concepts, masteryRows.rows);
        if (plan) plan.rationale = `[AI failed: ${e.message.slice(0,120)}] ${plan.rationale}`;
      }
    } else {
      plan = pickDailyConcept(concepts, masteryRows.rows);
    }
    if (!plan) {
      return res.status(500).json({ error: 'No suitable concept found' });
    }
    plan = enrichPlanWithRoadmap(plan, conceptById[plan.concept_id]);

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
