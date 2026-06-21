const CONTRACTS = {
  build: ["VITE_GOOGLE_CLIENT_ID"],
  runtime: [
    "GOOGLE_CLIENT_ID",
    "JWT_SECRET",
    "TURSO_AUTH_TOKEN",
    "TURSO_DATABASE_URL",
  ],
};

const mode = process.argv[2] ?? "deploy";

function requiredFor(selectedMode) {
  if (selectedMode === "build") return CONTRACTS.build;
  if (selectedMode === "runtime") return CONTRACTS.runtime;
  if (selectedMode === "deploy") {
    return [...CONTRACTS.build, ...CONTRACTS.runtime];
  }
  console.error(`Unknown env validation mode: ${selectedMode}`);
  process.exit(2);
}

const missing = requiredFor(mode).filter((name) => {
  const value = process.env[name];
  return typeof value !== "string" || value.trim() === "";
});

if (missing.length > 0) {
  console.error(`Missing required ${mode} environment variables:`);
  for (const name of missing) {
    console.error(`- ${name}`);
  }
  console.error("Refusing to continue because this deployment would break auth.");
  process.exit(1);
}

const OPTIONAL_DIGEST = [
  "DIGEST_FROM_EMAIL",
  "APP_URL",
  "VAPID_PUBLIC_KEY",
  "VAPID_PRIVATE_KEY",
  "VITE_VAPID_PUBLIC_KEY",
];

if (mode === "deploy") {
  const missingOptional = OPTIONAL_DIGEST.filter((name) => {
    const value = process.env[name];
    return typeof value !== "string" || value.trim() === "";
  });
  if (missingOptional.length > 0) {
    console.warn("Optional digest/push env not set (daily reminders disabled until configured):");
    for (const name of missingOptional) {
      console.warn(`- ${name}`);
    }
  }
}

console.log(`Environment contract ok for ${mode}.`);
