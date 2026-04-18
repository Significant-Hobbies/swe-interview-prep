import { getDb } from './client.mjs';

export async function initDatabase() {
  const db = getDb();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      google_id TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      picture TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS user_chats (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      problem_id TEXT NOT NULL,
      messages TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, problem_id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS user_notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      problem_id TEXT NOT NULL,
      notes TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, problem_id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS user_imported_problems (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      problem_id TEXT NOT NULL,
      problem_data TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, problem_id)
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS user_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      problem_id TEXT NOT NULL,
      status TEXT DEFAULT 'unseen',
      code TEXT,
      language TEXT DEFAULT 'typescript',
      bookmarked INTEGER DEFAULT 0,
      last_attempted TEXT,
      ease REAL DEFAULT 2.5,
      interval INTEGER DEFAULT 0,
      repetitions INTEGER DEFAULT 0,
      next_review TEXT,
      last_review TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, problem_id)
    )
  `);

  // Per-session events. Source of truth for personalization.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      problem_id TEXT,
      concept_ids TEXT,
      duration_ms INTEGER DEFAULT 0,
      payload TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_activity_user_time ON activity_log(user_id, created_at DESC)`);

  // Per-user per-concept FSRS state.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS concept_mastery (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      concept_id TEXT NOT NULL,
      stability REAL DEFAULT 0,
      difficulty REAL DEFAULT 5,
      elapsed_days INTEGER DEFAULT 0,
      scheduled_days INTEGER DEFAULT 0,
      reps INTEGER DEFAULT 0,
      lapses INTEGER DEFAULT 0,
      state INTEGER DEFAULT 0,
      last_review TEXT,
      due TEXT,
      confidence REAL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, concept_id)
    )
  `);
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_mastery_user_due ON concept_mastery(user_id, due)`);

  // Cached daily recommendation.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS daily_plan (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      plan_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, date)
    )
  `);

  // Weekly AI report.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS weekly_review (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      week_start TEXT NOT NULL,
      report_md TEXT NOT NULL,
      stats_json TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, week_start)
    )
  `);

  // Feynman explain-back submissions.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS feynman_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      problem_id TEXT,
      concept_ids TEXT,
      explanation TEXT NOT NULL,
      grade INTEGER,
      gaps_json TEXT,
      feedback TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('Database schema initialized');
}
