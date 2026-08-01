PRAGMA defer_foreign_keys = true;

INSERT OR REPLACE INTO users (id, google_id, email, name, picture, created_at)
VALUES ('d1-rehearsal-user', 'd1-rehearsal-google', 'd1-rehearsal@example.invalid', 'D1 Rehearsal', NULL, '2026-08-01T00:00:00.000Z');

INSERT OR REPLACE INTO user_progress (
  id, user_id, problem_id, status, code, language, bookmarked, last_attempted,
  ease, interval, repetitions, next_review, last_review, updated_at
) VALUES (
  'd1-rehearsal-progress', 'd1-rehearsal-user', 'two-sum', 'solved',
  'return indices;', 'typescript', 1, '2026-08-01T00:00:00.000Z',
  2.5, 3, 2, '2026-08-04T00:00:00.000Z', '2026-08-01T00:00:00.000Z',
  '2026-08-01T00:00:00.000Z'
);

INSERT OR REPLACE INTO concept_mastery (
  id, user_id, concept_id, stability, difficulty, elapsed_days, scheduled_days,
  reps, lapses, state, last_review, due, confidence, updated_at
) VALUES (
  'd1-rehearsal-mastery', 'd1-rehearsal-user', 'hash-maps', 4.5, 5.0, 1, 3,
  2, 0, 2, '2026-08-01T00:00:00.000Z', '2026-08-04T00:00:00.000Z', 0.8,
  '2026-08-01T00:00:00.000Z'
);

INSERT OR REPLACE INTO user_learning_notes (
  id, user_id, scope, ref_id, title, body, updated_at
) VALUES (
  'd1-rehearsal-note', 'd1-rehearsal-user', 'concept', 'hash-maps',
  'Collision strategy', 'Compare chaining and open addressing.', '2026-08-01T00:00:00.000Z'
);

INSERT OR REPLACE INTO user_projects (
  id, user_id, project_id, status, next_action, milestones_json, updated_at
) VALUES (
  'd1-rehearsal-project', 'd1-rehearsal-user', 'kv-store', 'active',
  'Implement compaction', '["write path"]', '2026-08-01T00:00:00.000Z'
);

INSERT OR REPLACE INTO activity_log (
  id, user_id, kind, problem_id, concept_ids, duration_ms, payload, created_at
) VALUES (
  'd1-rehearsal-activity', 'd1-rehearsal-user', 'drill_complete', 'two-sum',
  '["hash-maps"]', 120000, '{"grade":90}', '2026-08-01T00:00:00.000Z'
);
