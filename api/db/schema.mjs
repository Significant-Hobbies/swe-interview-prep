import { getDb } from './client.mjs';

export async function initDatabase() {
  const db = getDb();

  // Users table
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

  // User chats table
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

  // User notes table
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

  // User imported problems table
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

  // User progress table (status, code, bookmarks, spaced repetition)
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

  console.log('Database schema initialized');
}
