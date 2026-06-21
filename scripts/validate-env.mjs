import { loadEnvFiles } from './load-env.mjs';

loadEnvFiles();

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

console.log(`Environment contract ok for ${mode}.`);
