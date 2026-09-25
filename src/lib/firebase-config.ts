/**
 * Centralized Firebase configuration.
 *
 * Priority:
 * 1. NEXT_PUBLIC_* env vars (Vercel dashboard or .env.local)
 * 2. Hardcoded defaults (fallback for Vercel until env vars are added)
 *
 * To fully externalize, add all NEXT_PUBLIC_FIREBASE_* vars in Vercel's
 * Environment Variables UI and remove the defaults below.
 */

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBW1KUytxrMHY15UaXzcdWbH5Myei44Z2I',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'coremmc-hosting-v1.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'coremmc-hosting-v1',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'coremmc-hosting-v1.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '599224638089',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:599224638089:web:843ed93edfa7e49dde4458',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-SX8JKYQW8W',
};

/** Convenience: just the project ID for server-side REST API calls. */
export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;