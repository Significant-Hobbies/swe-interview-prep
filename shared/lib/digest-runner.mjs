import { buildDigestMessage, countDueFromMastery, digestEnabled } from './digest.mjs';
import { sendWebPush } from './web-push.mjs';

const DEFAULT_PROFILE = {
  minutesPerDay: 45,
  interviewHorizonDays: null,
  digestEmail: false,
  pushEnabled: false,
};

export async function runDigestForAllUsers(env, { dryRun = false } = {}) {
  const client = env.db;
  if (!client) throw new Error('db client required');

  const usersRes = await client.execute({
    sql: `SELECT u.id, u.email, u.name, p.profile_json
          FROM users u
          LEFT JOIN user_profile p ON p.user_id = u.id`,
  });

  const appUrl = env.APP_URL || 'https://swe-interview-prep.pages.dev';
  let sent = 0;
  let skipped = 0;

  for (const row of usersRes.rows) {
    let profile = DEFAULT_PROFILE;
    try {
      if (row.profile_json) profile = { ...DEFAULT_PROFILE, ...JSON.parse(row.profile_json) };
    } catch {
      // keep defaults
    }

    if (!digestEnabled(profile)) {
      skipped += 1;
      continue;
    }

    const rqRes = await client.execute({
      sql: 'SELECT due FROM review_question_mastery WHERE user_id = ?',
      args: [row.id],
    });
    const cmRes = await client.execute({
      sql: 'SELECT due FROM concept_mastery WHERE user_id = ?',
      args: [row.id],
    });

    const dueReviews = countDueFromMastery(rqRes.rows);
    const dueConcepts = countDueFromMastery(cmRes.rows);
    const msg = buildDigestMessage({
      name: row.name,
      dueReviews,
      dueConcepts,
      sessionMinutes: profile.minutesPerDay || 45,
      horizonDays: profile.interviewHorizonDays,
      appUrl,
    });

    if (dryRun) {
      sent += 1;
      continue;
    }

    if (profile.digestEmail && env.EMAIL && env.DIGEST_FROM_EMAIL) {
      try {
        await env.EMAIL.send({
          to: row.email,
          from: { email: env.DIGEST_FROM_EMAIL, name: 'Loop' },
          subject: msg.subject,
          text: msg.text,
          html: msg.html,
        });
        sent += 1;
      } catch (err) {
        console.error('Email digest failed', row.id, err);
      }
    }

    if (profile.pushEnabled && env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY) {
      const subs = await client.execute({
        sql: 'SELECT endpoint, p256dh, auth FROM user_push_subscriptions WHERE user_id = ?',
        args: [row.id],
      });
      for (const sub of subs.rows) {
        try {
          await sendWebPush(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            { title: msg.pushTitle, body: msg.pushBody, url: `${appUrl}/today` },
            {
              publicKey: env.VAPID_PUBLIC_KEY,
              privateKey: env.VAPID_PRIVATE_KEY,
              subject: env.VAPID_SUBJECT || `mailto:${env.DIGEST_FROM_EMAIL || 'digest@loop.local'}`,
            },
          );
          sent += 1;
        } catch (err) {
          console.error('Push failed', row.id, err);
        }
      }
    }
  }

  return { sent, skipped, users: usersRes.rows.length };
}