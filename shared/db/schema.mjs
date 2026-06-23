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
  await db.execute(
    `CREATE INDEX IF NOT EXISTS idx_activity_user_time ON activity_log(user_id, created_at DESC)`
  );

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
  await db.execute(
    `CREATE INDEX IF NOT EXISTS idx_mastery_user_due ON concept_mastery(user_id, due)`
  );

  // Legacy — superseded by client-side planner (src/lib/planner.ts). Kept for existing DBs.
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

  // Learning OS: artifact build status per user.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS user_artifacts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      artifact_id TEXT NOT NULL,
      status TEXT DEFAULT 'todo',
      url TEXT,
      path TEXT,
      notes TEXT,
      criteria_json TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, artifact_id)
    )
  `);

  // Learning OS: drill attempt state per user. Detailed attempts go to activity_log.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS user_drills (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      drill_id TEXT NOT NULL,
      status TEXT DEFAULT 'unsolved',
      attempts INTEGER DEFAULT 0,
      last_code TEXT,
      last_attempt TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, drill_id)
    )
  `);

  // Learning OS: project state per user.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS user_projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      status TEXT DEFAULT 'planned',
      next_action TEXT,
      milestones_json TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, project_id)
    )
  `);

  // Learning OS: free-form notes scoped to a concept, roadmap, project, or nothing.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS user_learning_notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      scope TEXT NOT NULL,
      ref_id TEXT,
      title TEXT,
      body TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  await db.execute(
    `CREATE INDEX IF NOT EXISTS idx_lnotes_user_scope ON user_learning_notes(user_id, scope, ref_id)`
  );

  // Learner profile — time budget, roadmap blend, modality mix, skips.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS user_profile (
      user_id TEXT PRIMARY KEY,
      profile_json TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Per-review-question FSRS (finer than concept-level scheduling).
  await db.execute(`
    CREATE TABLE IF NOT EXISTS review_question_mastery (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      stability REAL DEFAULT 0,
      difficulty REAL DEFAULT 5,
      elapsed_days INTEGER DEFAULT 0,
      scheduled_days INTEGER DEFAULT 0,
      reps INTEGER DEFAULT 0,
      lapses INTEGER DEFAULT 0,
      state INTEGER DEFAULT 0,
      last_review TEXT,
      due TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, question_id)
    )
  `);
  await db.execute(
    `CREATE INDEX IF NOT EXISTS idx_rqm_user_due ON review_question_mastery(user_id, due)`
  );

  // Per-roadmap ELO — synced from client for cross-device calibration.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS user_elo_state (
      user_id TEXT PRIMARY KEY,
      state_json TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Per-user Anki / external deck cards.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS user_imported_reviews (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      external_id TEXT NOT NULL,
      deck_name TEXT,
      concept_id TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      tags TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, external_id)
    )
  `);
  await db.execute(
    `CREATE INDEX IF NOT EXISTS idx_imported_reviews_user ON user_imported_reviews(user_id)`
  );

  // Web Push subscriptions for digest reminders.
  await db.execute(`
    CREATE TABLE IF NOT EXISTS user_push_subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, endpoint)
    )
  `);

  console.log('Database schema initialized');
}
