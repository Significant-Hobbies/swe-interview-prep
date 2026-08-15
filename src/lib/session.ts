// Session completion + streak from local activity (works for guests and signed-in).
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
