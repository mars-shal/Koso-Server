// Loads ./.env so `npm run start:dev` / `npm run start:prod` work locally
// without manually sourcing the file. No-op in production (no .env file);
// env vars already set (e.g. Render dashboard) always win, never overridden.
const loadEnvFile = process.loadEnvFile;
if (typeof loadEnvFile === 'function') {
  try {
    loadEnvFile();
  } catch {
    // no .env present - expected in production
  }
}