/**
 * scripts/prepare-db.js
 *
 * Runs before `next build` on Vercel or locally.
 * If DATABASE_URL is configured:
 *  1. Pushes the schema to the database (prisma db push)
 *  2. Seeds initial data from db/export.json if database is empty
 */

const { execSync } = require('child_process');
const path = require('path');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.log('[prepare-db] DATABASE_URL is not set — skipping schema push & seeding.');
  process.exit(0);
}

try {
  console.log('[prepare-db] DATABASE_URL detected. Synchronizing schema...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('[prepare-db] Schema synchronized successfully.');
} catch (err) {
  console.warn('[prepare-db] Schema sync warning (continuing build):', err.message);
}

try {
  console.log('[prepare-db] Checking and seeding database records...');
  execSync('node ' + path.join(__dirname, 'seed-database.js'), { stdio: 'inherit' });
} catch (err) {
  console.warn('[prepare-db] Seeding warning (continuing build):', err.message);
}

process.exit(0);
