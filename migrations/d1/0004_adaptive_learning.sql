-- Adaptive learning record written by authenticated external agents (MCP).
-- Additive only: no existing table is altered. Product-owned FSRS mastery in
-- concept_mastery stays separate from agent-submitted knowledge evidence.

CREATE TABLE IF NOT EXISTS learner_profiles (
  user_id TEXT PRIMARY KEY,
  profile_json TEXT NOT NULL DEFAULT '{}',
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- One row per assessed or declared subject. subject_key is a curriculum concept
-- id, `domain:<track>` or `topic:<slug>` for subjects outside the curriculum.
-- Absence of a row means unassessed, never beginner.
CREATE TABLE IF NOT EXISTS knowledge_states (
  user_id TEXT NOT NULL,
  subject_key TEXT NOT NULL,
  subject_kind TEXT NOT NULL,
  label TEXT NOT NULL,
  self_reported_level TEXT,
  assessed_level TEXT,
  target_level TEXT,
  interest TEXT,
  confidence REAL NOT NULL DEFAULT 0,
  outcome TEXT,
  evidence_count INTEGER NOT NULL DEFAULT 0,
  exposure_count INTEGER NOT NULL DEFAULT 0,
  review_interval_days INTEGER,
  review_due_at TEXT,
  last_assessed_at TEXT,
  last_engaged_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (user_id, subject_key),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_knowledge_user_due ON knowledge_states(user_id, review_due_at);

CREATE TABLE IF NOT EXISTS learning_courses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  objective TEXT NOT NULL,
  target_level TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  is_primary INTEGER NOT NULL DEFAULT 0,
  lessons_json TEXT NOT NULL DEFAULT '[]',
  supplemental_objectives_json TEXT NOT NULL DEFAULT '[]',
  notes TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_courses_user_status ON learning_courses(user_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS learning_resources (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  canonical_url TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  kind TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'saved',
  author TEXT,
  published_at TEXT,
  summary TEXT,
  concept_ids_json TEXT NOT NULL DEFAULT '[]',
  topics_json TEXT NOT NULL DEFAULT '[]',
  notes TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (user_id, canonical_url),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_resources_user_updated ON learning_resources(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS learning_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  title TEXT NOT NULL,
  course_id TEXT,
  lesson_id TEXT,
  record_json TEXT NOT NULL DEFAULT '{}',
  summary TEXT,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  duration_minutes INTEGER,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_started ON learning_sessions(user_id, started_at DESC, id);

CREATE TABLE IF NOT EXISTS learning_assessments (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  subject_key TEXT NOT NULL,
  session_id TEXT,
  course_id TEXT,
  method TEXT NOT NULL,
  question TEXT,
  response TEXT,
  evaluation TEXT NOT NULL,
  gaps_json TEXT NOT NULL DEFAULT '[]',
  demonstrated_level TEXT NOT NULL,
  outcome TEXT NOT NULL,
  score REAL,
  provenance_json TEXT NOT NULL DEFAULT '{}',
  assessed_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_assessments_user_time ON learning_assessments(user_id, assessed_at DESC, id);
CREATE INDEX IF NOT EXISTS idx_assessments_user_subject ON learning_assessments(user_id, subject_key, assessed_at DESC);

CREATE TABLE IF NOT EXISTS curriculum_gaps (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  topic TEXT NOT NULL,
  topic_key TEXT NOT NULL,
  gap_kind TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  record_json TEXT NOT NULL DEFAULT '{}',
  pr_url TEXT,
  session_id TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_gaps_user_topic ON curriculum_gaps(user_id, topic_key);

CREATE TABLE IF NOT EXISTS learning_priority_overrides (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  day TEXT NOT NULL,
  recommended_json TEXT NOT NULL,
  chosen_json TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_overrides_user_day ON learning_priority_overrides(user_id, day, created_at DESC);

-- Retried MCP mutations, keyed by the caller's key. A key is reserved
-- ('pending') before the mutation runs and completed with its response.
CREATE TABLE IF NOT EXISTS mcp_mutation_receipts (
  user_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  tool TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'pending',
  response_json TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (user_id, idempotency_key),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
