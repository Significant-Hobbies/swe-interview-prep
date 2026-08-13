CREATE TABLE war_content_versions (
  id TEXT PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('blitz_question', 'tradeoff_problem')),
  content_key TEXT NOT NULL,
  version INTEGER NOT NULL CHECK (version > 0),
  variant_key TEXT NOT NULL DEFAULT 'base',
  status TEXT NOT NULL CHECK (status IN ('draft', 'reviewed', 'active', 'retired')),
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('foundation', 'intermediate', 'advanced')),
  concept_ids_json TEXT NOT NULL,
  source_refs_json TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  reviewed_at TEXT,
  activated_at TEXT,
  retired_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(content_key, version, variant_key)
);

CREATE INDEX idx_war_content_pool
  ON war_content_versions(content_type, status, topic, difficulty);

CREATE TABLE war_ai_opponents (
  id TEXT PRIMARY KEY,
  profile_key TEXT NOT NULL,
  version INTEGER NOT NULL CHECK (version > 0),
  display_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  model_name TEXT NOT NULL,
  model_snapshot TEXT NOT NULL,
  benchmark_version TEXT NOT NULL,
  published_rating INTEGER NOT NULL CHECK (published_rating > 0),
  accuracy REAL NOT NULL CHECK (accuracy >= 0 AND accuracy <= 1),
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'retired')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(profile_key, version)
);

CREATE TABLE war_ai_answers (
  id TEXT PRIMARY KEY,
  ai_opponent_id TEXT NOT NULL,
  content_version_id TEXT NOT NULL,
  selected_option_id TEXT NOT NULL,
  explanation TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (ai_opponent_id) REFERENCES war_ai_opponents(id) ON DELETE RESTRICT,
  FOREIGN KEY (content_version_id) REFERENCES war_content_versions(id) ON DELETE RESTRICT,
  UNIQUE(ai_opponent_id, content_version_id)
);

CREATE TABLE war_matches (
  id TEXT PRIMARY KEY,
  mode TEXT NOT NULL CHECK (mode IN ('blitz', 'tradeoff')),
  queue_type TEXT NOT NULL CHECK (queue_type IN ('ranked_mix', 'topic', 'ai', 'ghost', 'challenge', 'rematch')),
  ranked INTEGER NOT NULL DEFAULT 0 CHECK (ranked IN (0, 1)),
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'check_in', 'active', 'twist', 'revision', 'reveal', 'debate', 'voting', 'adjudicating', 'review_required', 'complete', 'cancelled', 'abandoned')),
  rules_version TEXT NOT NULL,
  content_snapshot_json TEXT NOT NULL,
  problem_version_id TEXT,
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0),
  question_count INTEGER NOT NULL DEFAULT 0 CHECK (question_count >= 0),
  phase TEXT,
  phase_ends_at TEXT,
  state_version INTEGER NOT NULL DEFAULT 1 CHECK (state_version > 0),
  public_slug TEXT UNIQUE,
  public_visibility TEXT NOT NULL DEFAULT 'private' CHECK (public_visibility IN ('private', 'result', 'excerpt')),
  result TEXT CHECK (result IN ('side_a', 'side_b', 'draw', 'forfeit', 'void')),
  winner_participant_id TEXT,
  scheduled_for TEXT,
  started_at TEXT,
  deadline_at TEXT,
  finalized_at TEXT,
  created_by_user_id TEXT NOT NULL,
  create_idempotency_key TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (problem_version_id) REFERENCES war_content_versions(id) ON DELETE RESTRICT,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  UNIQUE(created_by_user_id, create_idempotency_key)
);

CREATE INDEX idx_war_matches_user_time ON war_matches(created_by_user_id, created_at DESC);
CREATE INDEX idx_war_matches_status_deadline ON war_matches(status, deadline_at);
CREATE INDEX idx_war_matches_mode_finalized ON war_matches(mode, finalized_at DESC);

CREATE TABLE war_participants (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('side_a', 'side_b')),
  participant_type TEXT NOT NULL CHECK (participant_type IN ('human', 'ai', 'ghost')),
  user_id TEXT,
  ai_opponent_id TEXT,
  ghost_attempt_id TEXT,
  display_name_snapshot TEXT NOT NULL,
  rating_snapshot INTEGER,
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'ready', 'active', 'complete', 'absent', 'forfeit')),
  correct_count INTEGER NOT NULL DEFAULT 0 CHECK (correct_count >= 0),
  qualifying_response_ms INTEGER NOT NULL DEFAULT 0 CHECK (qualifying_response_ms >= 0),
  score REAL,
  joined_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (match_id) REFERENCES war_matches(id) ON DELETE RESTRICT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (ai_opponent_id) REFERENCES war_ai_opponents(id) ON DELETE RESTRICT,
  UNIQUE(match_id, side),
  UNIQUE(match_id, user_id)
);

CREATE INDEX idx_war_participants_user_match ON war_participants(user_id, created_at DESC);

CREATE TABLE war_attempts (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'complete', 'expired', 'abandoned')),
  question_order_json TEXT NOT NULL,
  started_at TEXT,
  deadline_at TEXT NOT NULL,
  completed_at TEXT,
  consumed_by_match_id TEXT,
  is_ranked_ghost INTEGER NOT NULL DEFAULT 0 CHECK (is_ranked_ghost IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (match_id) REFERENCES war_matches(id) ON DELETE RESTRICT,
  FOREIGN KEY (participant_id) REFERENCES war_participants(id) ON DELETE RESTRICT,
  FOREIGN KEY (consumed_by_match_id) REFERENCES war_matches(id) ON DELETE RESTRICT,
  UNIQUE(match_id, participant_id)
);

CREATE UNIQUE INDEX idx_war_attempt_ranked_ghost_once
  ON war_attempts(consumed_by_match_id)
  WHERE consumed_by_match_id IS NOT NULL;

CREATE INDEX idx_war_attempt_ghost_pool
  ON war_attempts(is_ranked_ghost, status, consumed_by_match_id, completed_at);

CREATE TABLE war_answers (
  id TEXT PRIMARY KEY,
  attempt_id TEXT NOT NULL,
  content_version_id TEXT NOT NULL,
  selected_option_id TEXT,
  is_correct INTEGER NOT NULL CHECK (is_correct IN (0, 1)),
  response_ms INTEGER NOT NULL CHECK (response_ms >= 0),
  operation_id TEXT NOT NULL,
  received_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (attempt_id) REFERENCES war_attempts(id) ON DELETE RESTRICT,
  FOREIGN KEY (content_version_id) REFERENCES war_content_versions(id) ON DELETE RESTRICT,
  UNIQUE(attempt_id, content_version_id),
  UNIQUE(attempt_id, operation_id)
);

CREATE TABLE war_artifacts (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  artifact_type TEXT NOT NULL CHECK (artifact_type IN ('text', 'code', 'schema', 'pseudocode', 'diagram', 'transcript')),
  phase TEXT NOT NULL,
  version INTEGER NOT NULL CHECK (version > 0),
  status TEXT NOT NULL CHECK (status IN ('draft', 'frozen', 'revealed', 'deleted')),
  inline_content TEXT,
  r2_key TEXT,
  content_hash TEXT NOT NULL,
  size_bytes INTEGER NOT NULL CHECK (size_bytes >= 0),
  visibility TEXT NOT NULL DEFAULT 'owner' CHECK (visibility IN ('owner', 'participants', 'public_excerpt')),
  save_idempotency_key TEXT NOT NULL,
  frozen_at TEXT,
  revealed_at TEXT,
  retention_until TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (match_id) REFERENCES war_matches(id) ON DELETE RESTRICT,
  FOREIGN KEY (participant_id) REFERENCES war_participants(id) ON DELETE RESTRICT,
  CHECK ((inline_content IS NOT NULL AND r2_key IS NULL) OR (inline_content IS NULL AND r2_key IS NOT NULL)),
  UNIQUE(match_id, participant_id, artifact_type, phase, version),
  UNIQUE(participant_id, save_idempotency_key)
);

CREATE INDEX idx_war_artifacts_match_visibility
  ON war_artifacts(match_id, status, visibility);

CREATE TABLE war_votes (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('win', 'loss', 'draw')),
  operation_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (match_id) REFERENCES war_matches(id) ON DELETE RESTRICT,
  FOREIGN KEY (participant_id) REFERENCES war_participants(id) ON DELETE RESTRICT,
  UNIQUE(match_id, participant_id),
  UNIQUE(participant_id, operation_id)
);

CREATE TABLE war_evaluations (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL,
  evaluation_type TEXT NOT NULL CHECK (evaluation_type IN ('player_votes', 'ai_adjudication', 'operator_review')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'valid', 'failed', 'review_required')),
  evaluator_version TEXT NOT NULL,
  rubric_version TEXT NOT NULL,
  evidence_hash TEXT NOT NULL,
  result_json TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  operation_id TEXT NOT NULL,
  last_error_code TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (match_id) REFERENCES war_matches(id) ON DELETE RESTRICT,
  UNIQUE(match_id, evaluation_type, evaluator_version),
  UNIQUE(operation_id)
);

CREATE TABLE war_challenges (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  mode TEXT NOT NULL CHECK (mode IN ('blitz', 'tradeoff')),
  creator_user_id TEXT NOT NULL,
  recipient_user_id TEXT,
  source_match_id TEXT,
  accepted_match_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('open', 'accepted', 'completed', 'expired', 'revoked')),
  rules_json TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  accepted_at TEXT,
  completed_at TEXT,
  create_idempotency_key TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (creator_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (source_match_id) REFERENCES war_matches(id) ON DELETE RESTRICT,
  FOREIGN KEY (accepted_match_id) REFERENCES war_matches(id) ON DELETE RESTRICT,
  UNIQUE(creator_user_id, create_idempotency_key)
);

CREATE INDEX idx_war_challenges_status_expiry ON war_challenges(status, expires_at);

CREATE TABLE war_ratings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('blitz', 'tradeoff')),
  rating INTEGER NOT NULL DEFAULT 1500 CHECK (rating > 0),
  ranked_matches INTEGER NOT NULL DEFAULT 0 CHECK (ranked_matches >= 0),
  wins INTEGER NOT NULL DEFAULT 0 CHECK (wins >= 0),
  draws INTEGER NOT NULL DEFAULT 0 CHECK (draws >= 0),
  losses INTEGER NOT NULL DEFAULT 0 CHECK (losses >= 0),
  leaderboard_visible INTEGER NOT NULL DEFAULT 1 CHECK (leaderboard_visible IN (0, 1)),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  UNIQUE(user_id, mode)
);

CREATE INDEX idx_war_ratings_leaderboard
  ON war_ratings(mode, leaderboard_visible, rating DESC, ranked_matches DESC);

CREATE TABLE war_rating_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('blitz', 'tradeoff')),
  match_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('result', 'correction', 'void')),
  before_rating INTEGER NOT NULL CHECK (before_rating > 0),
  after_rating INTEGER NOT NULL CHECK (after_rating > 0),
  score REAL NOT NULL CHECK (score IN (0, 0.5, 1)),
  opponent_type TEXT NOT NULL CHECK (opponent_type IN ('human', 'ai', 'ghost', 'operator')),
  opponent_rating_snapshot INTEGER NOT NULL CHECK (opponent_rating_snapshot > 0),
  algorithm_version TEXT NOT NULL,
  compensates_event_id TEXT,
  operation_id TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (match_id) REFERENCES war_matches(id) ON DELETE RESTRICT,
  FOREIGN KEY (compensates_event_id) REFERENCES war_rating_events(id) ON DELETE RESTRICT,
  UNIQUE(user_id, match_id, event_type)
);

CREATE INDEX idx_war_rating_events_user_time
  ON war_rating_events(user_id, mode, created_at DESC);

CREATE TABLE war_content_reports (
  id TEXT PRIMARY KEY,
  content_version_id TEXT NOT NULL,
  match_id TEXT NOT NULL,
  reporter_user_id TEXT NOT NULL,
  reason_code TEXT NOT NULL CHECK (reason_code IN ('ambiguous', 'incorrect', 'outdated', 'source', 'other')),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
  resolution_note TEXT,
  operation_id TEXT NOT NULL,
  resolved_by_user_id TEXT,
  resolved_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (content_version_id) REFERENCES war_content_versions(id) ON DELETE RESTRICT,
  FOREIGN KEY (match_id) REFERENCES war_matches(id) ON DELETE RESTRICT,
  FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (resolved_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  UNIQUE(reporter_user_id, operation_id)
);

CREATE INDEX idx_war_content_reports_review
  ON war_content_reports(status, content_version_id, created_at);

CREATE TABLE war_remediation_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  match_id TEXT NOT NULL,
  content_version_id TEXT,
  concept_id TEXT NOT NULL,
  evidence_type TEXT NOT NULL CHECK (evidence_type IN ('blitz_miss', 'blitz_success', 'tradeoff_rubric')),
  fsrs_rating TEXT CHECK (fsrs_rating IN ('again', 'hard', 'good')),
  evidence_json TEXT NOT NULL,
  operation_id TEXT NOT NULL,
  applied_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (match_id) REFERENCES war_matches(id) ON DELETE RESTRICT,
  FOREIGN KEY (content_version_id) REFERENCES war_content_versions(id) ON DELETE RESTRICT,
  UNIQUE(user_id, match_id, concept_id, evidence_type),
  UNIQUE(user_id, operation_id)
);

CREATE INDEX idx_war_remediation_user_concept
  ON war_remediation_events(user_id, concept_id, created_at DESC);

CREATE TABLE war_media_sessions (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL CHECK (provider IN ('realtimekit', 'disabled')),
  provider_meeting_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'creating', 'active', 'closed', 'failed', 'disabled')),
  transcript_consent_a INTEGER NOT NULL DEFAULT 0 CHECK (transcript_consent_a IN (0, 1)),
  transcript_consent_b INTEGER NOT NULL DEFAULT 0 CHECK (transcript_consent_b IN (0, 1)),
  transcript_status TEXT NOT NULL DEFAULT 'not_requested' CHECK (transcript_status IN ('not_requested', 'requested', 'processing', 'ready', 'failed', 'declined')),
  transcript_r2_key TEXT,
  transcript_hash TEXT,
  transcript_retention_until TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (match_id) REFERENCES war_matches(id) ON DELETE RESTRICT
);

CREATE TABLE war_provider_events (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  provider_event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('received', 'queued', 'processed', 'failed')),
  received_at TEXT NOT NULL DEFAULT (datetime('now')),
  processed_at TEXT,
  UNIQUE(provider, provider_event_id)
);

CREATE TABLE war_media_participants (
  id TEXT PRIMARY KEY,
  media_session_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  provider_participant_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('enrolled', 'active', 'left', 'revoked')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (media_session_id) REFERENCES war_media_sessions(id) ON DELETE RESTRICT,
  FOREIGN KEY (participant_id) REFERENCES war_participants(id) ON DELETE RESTRICT,
  UNIQUE(media_session_id, participant_id),
  UNIQUE(media_session_id, provider_participant_id)
);

CREATE TABLE war_queue_jobs (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('transcript_copy', 'adjudication', 'finalize_tradeoff')),
  operation_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'complete', 'failed', 'dead_letter')),
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  payload_json TEXT NOT NULL,
  last_error_code TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (match_id) REFERENCES war_matches(id) ON DELETE RESTRICT
);

CREATE INDEX idx_war_queue_jobs_status ON war_queue_jobs(status, job_type, created_at);
