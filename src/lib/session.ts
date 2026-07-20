// Session completion + streak from local activity (works for guests and signed-in).
import type { SessionBlock, SessionPlan } from './planner';
import type { ArtifactEntry, DrillEntry } from '../hooks/useUserStore';
import { loadLocal, saveLocal } from './userStore';

const SESSION_KEY = 'swe-os:daily-sessions';

interface DailySessionLog {
  date: string;
  kinds: string[];
  completed: boolean;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadSessions(): DailySessionLog[] {
  return loadLocal<DailySessionLog[]>(SESSION_KEY, []);
}

function saveSessions(logs: DailySessionLog[]): void {
  saveLocal(SESSION_KEY, logs.slice(-60));
}

export function recordSessionActivity(kind: string): void {
  const date = todayStr();
  const logs = loadSessions();
  const row = logs.find((l) => l.date === date) ?? { date, kinds: [], completed: false };
  if (!row.kinds.includes(kind)) row.kinds.push(kind);
  const next = logs.filter((l) => l.date !== date);
  next.push(row);
  saveSessions(next);
}

export function markSessionComplete(): void {
  const date = todayStr();
  const logs = loadSessions();
  const row = logs.find((l) => l.date === date) ?? { date, kinds: [], completed: false };
  row.completed = true;
  const next = logs.filter((l) => l.date !== date);
  next.push(row);
  saveSessions(next);
}

export function computeSessionStreak(): number {
  const logs = loadSessions();
  const byDate = new Map(logs.map((l) => [l.date, l]));
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 60; i++) {
    const key = d.toISOString().slice(0, 10);
    const row = byDate.get(key);
    const active = row && (row.completed || row.kinds.length >= 2);
    if (!active) break;
    streak++;
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return streak;
}

export function enrichBlocksWithProgress(
  plan: SessionPlan,
  drillState: Record<string, DrillEntry>,
  artifacts: Record<string, ArtifactEntry>,
  todayKinds: string[]
): SessionBlock[] {
  return plan.blocks.map((block) => {
    let done = false;
    if (block.kind === 'drill' && plan.drill) {
      done = drillState[plan.drill.id]?.status === 'solved';
    } else if (block.kind === 'build' && plan.artifact) {
      const st = artifacts[plan.artifact.id]?.status;
      done = st === 'shipped' || st === 'building';
    } else if (block.kind === 'review') {
      done = todayKinds.includes('review_session');
    } else if (block.kind === 'learn') {
      done = todayKinds.includes('concept_read') || todayKinds.includes('drill_solve');
    }
    return { ...block, done };
  });
}

export function sessionProgress(blocks: SessionBlock[]): {
  done: number;
  total: number;
  pct: number;
} {
  const total = blocks.length;
  const done = blocks.filter((b) => b.done).length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

export function todayActivityKinds(): string[] {
  const row = loadSessions().find((l) => l.date === todayStr());
  return row?.kinds ?? [];
}
