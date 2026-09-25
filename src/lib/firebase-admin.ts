import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { readFileSync } from 'fs';
import { join } from 'path';

let _app: App | null = null;
let _sa: Record<string, unknown> | null = null;

/**
 * Returns the parsed service-account credentials (cached).
 *
 * Resolution order:
 * 1. `FIREBASE_SERVICE_ACCOUNT` env var (JSON string) — for Netlify / Vercel
 * 2. `service-account.json` file in project root         — for local dev
 */
export function getServiceAccount(): Record<string, unknown> {
  if (_sa) return _sa;

  const envJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (envJson) {
    try {
      _sa = JSON.parse(envJson);
    } catch (parseErr) {
      throw new Error(
        `FIREBASE_SERVICE_ACCOUNT env var exists but is not valid JSON: ${parseErr instanceof Error ? parseErr.message : parseErr}. ` +
        `Ensure the value is a single-line JSON string. Length: ${envJson.length} chars.`
      );
    }
  } else {
    const filePath = join(process.cwd(), 'service-account.json');
    try {
      const raw = readFileSync(filePath, 'utf8');
      _sa = JSON.parse(raw);
    } catch {
      throw new Error(
        `FIREBASE_SERVICE_ACCOUNT env var is not set and service-account.json not found at ${filePath}. ` +
        `On Vercel: Project → Settings → Environment Variables → Add FIREBASE_SERVICE_ACCOUNT with your Firebase service account JSON (single-line string). ` +
        `Locally: place service-account.json in the project root, or set FIREBASE_SERVICE_ACCOUNT in .env.local.`
      );
    }
  }

  return _sa;
}

/**
 * Returns the Firebase Admin App instance (singleton).
 * Used for Admin Auth token verification.
 */
export function getAdminApp(): App {
  if (_app) return _app;

  if (!getApps().length) {
    try {
      const serviceAccount = getServiceAccount();
      _app = initializeApp({
        credential: cert(serviceAccount as Parameters<typeof cert>[0]),
      });
    } catch (initErr) {
      throw new Error(
        `Failed to initialize Firebase Admin: ${initErr instanceof Error ? initErr.message : initErr}`
      );
    }
  } else {
    _app = getApps()[0];
  }

  return _app;
}