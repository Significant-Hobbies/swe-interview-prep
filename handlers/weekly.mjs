import { getDb } from '../shared/db/client.mjs';
import { initDatabase } from '../shared/db/schema.mjs';
import { requireAuth } from '../api/auth/verify.mjs';
import { decayConfidence } from '../shared/lib/fsrs.mjs';
import { generate } from '../shared/lib/ai.mjs';
import { buildWeeklyReport } from '../shared/lib/heuristics.mjs';
import { randomBytes } from 'crypto';

import conceptsData from '../src/data/concepts.json' with { type: 'json' };

const CONCEPTS = conceptsData.concepts ?? [];
function loadConcepts() {
  return CONCEPTS;
}

let initialized = false;
async function ensureInit() {
  if (!initialized) { await initDatabase(); initialized = true; }
}

const SYSTEM = `You are a brutal engineering coach. Write a weekly review for the engineer using the data below.

Format as markdown. Sections (use these exact headers):
## Reality Check
## What's Rotting
## What You Avoided
## Wins
## Next Week's Bet

Be specific, blunt, no fluff. Cite concept ids and counts. No congratulations unless earned. Max 350 words.`;

function weekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff)).toISOString().slice(0, 10);
}

export default async function handler(req, res) {
  await ensureInit();
  const user = await requireAuth(req, res);
  if (!user) return;
  const db = getDb();
  const ws = weekStart();

  if (req.method === 'GET') {
    const r = await db.execute({
      sql: 'SELECT report_md, stats_json, created_at FROM weekly_review WHERE user_id = ? ORDER BY week_start DESC LIMIT 1',
      args: [user.id],
    });
    if (r.rows.length === 0) return res.status(200).json({ review: null });
    return res.status(200).json({ review: {
      reportMd: r.rows[0].report_md,
      stats: r.rows[0].stats_json ? JSON.parse(r.rows[0].stats_json) : null,
      createdAt: r.rows[0].created_at,
    }});
  }

  if (req.method === 'POST') {
    const { aiConfig } = req.body || {};

    const activity = await db.execute({
      sql: `SELECT kind, concept_ids, duration_ms, payload, created_at FROM activity_log
            WHERE user_id = ? AND created_at >= datetime('now','-7 days') ORDER BY created_at DESC LIMIT 200`,
      args: [user.id],
    });

    const mastery = await db.execute({
      sql: 'SELECT concept_id, stability, reps, lapses, last_review, due FROM concept_mastery WHERE user_id = ?',
      args: [user.id],
    });

    const feynman = await db.execute({
      sql: `SELECT grade, gaps_json, created_at FROM feynman_logs
            WHERE user_id = ? AND created_at >= datetime('now','-7 days')`,
      args: [user.id],
    });

    const now = new Date();
    const conceptStats = mastery.rows.map(m => {
      const conf = decayConfidence(m, now);
      return `${m.concept_id}: conf=${conf.toFixed(2)} reps=${m.reps} lapses=${m.lapses} last=${m.last_review?.slice(0,10) || 'never'}`;
    }).join('\n');

    const activityCount = activity.rows.length;
    const totalMinutes = Math.round(activity.rows.reduce((s, r) => s + (r.duration_ms || 0), 0) / 60000);
    const mockStarted = activity.rows.filter(r => r.kind === 'mock_start').length;
    const mockCompleted = activity.rows.filter(r => r.kind === 'mock_complete').length;
    const grades = feynman.rows.map(f => f.grade).filter(g => g != null);
    const avgGrade = grades.length ? Math.round(grades.reduce((a,b)=>a+b,0)/grades.length) : null;

    const stats = {
      activityCount,
      totalMinutes,
      avgGrade,
      feynmanCount: feynman.rows.length,
      mockStarted,
      mockCompleted,
    };

    const prompt = `Engineer's last 7 days:

Stats:
- ${activityCount} activity events
- ${totalMinutes} active minutes
- ${feynman.rows.length} Feynman explain-backs (avg grade: ${avgGrade ?? 'n/a'})
- ${mockCompleted} mock interviews completed (${mockStarted} started)

Concept mastery:
${conceptStats || '(none yet)'}

Recent activity sample:
${activity.rows.slice(0, 30).map(r => `${r.created_at}: ${r.kind} concepts=${r.concept_ids || '[]'}`).join('\n') || '(empty)'}

Write the review now.`;

    let report;
    let finalStats = stats;
    const useAI = aiConfig && aiConfig.endpointUrl && aiConfig.apiKey && aiConfig.model;
    if (useAI) {
      try {
        report = await generate({ ...aiConfig, system: SYSTEM, prompt, maxTokens: 1500 });
      } catch {
        // Fall through to heuristic
      }
    }
    if (!report) {
      const activityForHeur = activity.rows.map(r => ({
        ...r,
        concept_ids: r.concept_ids ? JSON.parse(r.concept_ids) : [],
        payload: r.payload ? JSON.parse(r.payload) : null,
      }));
      const built = buildWeeklyReport({
        activity: activityForHeur,
        mastery: mastery.rows,
        feynman: feynman.rows,
        concepts: loadConcepts(),
      });
      report = built.reportMd;
      finalStats = built.stats;
    }

    const id = randomBytes(16).toString('hex');
    await db.execute({
      sql: `INSERT INTO weekly_review (id, user_id, week_start, report_md, stats_json) VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(user_id, week_start) DO UPDATE SET
              report_md = excluded.report_md,
              stats_json = excluded.stats_json,
              created_at = datetime('now')`,
      args: [id, user.id, ws, report, JSON.stringify(finalStats)],
    });

    return res.status(200).json({ review: { reportMd: report, stats: finalStats, createdAt: new Date().toISOString() } });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
