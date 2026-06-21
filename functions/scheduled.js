import { createClient } from "@libsql/client/web";
import { runDigestForAllUsers } from "../shared/lib/digest-runner.mjs";

function getDb(env) {
  return createClient({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  });
}

/** Daily digest — email + web push for opted-in users. */
export async function onSchedule(context) {
  const { env } = context;
  if (!env.TURSO_DATABASE_URL || !env.TURSO_AUTH_TOKEN) {
    console.error("scheduled digest: missing Turso env");
    return;
  }

  const db = getDb(env);
  const result = await runDigestForAllUsers({
    db,
    EMAIL: env.EMAIL,
    DIGEST_FROM_EMAIL: env.DIGEST_FROM_EMAIL,
    VAPID_PUBLIC_KEY: env.VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY: env.VAPID_PRIVATE_KEY,
    VAPID_SUBJECT: env.VAPID_SUBJECT,
    APP_URL: env.APP_URL || "https://swe-interview-prep.pages.dev",
  });

  console.log("scheduled digest complete", result);
}