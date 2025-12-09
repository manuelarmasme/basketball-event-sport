/**
 * Firebase Admin SDK Initialization
 *
 * SECURITY: This file must stay inside app/api/ directory
 * to ensure credentials are never exposed to the client.
 *
 * Uses singleton pattern to prevent multiple initializations.
 *
 * Requires FIREBASE_SERVICE_ACCOUNT_JSON environment variable
 * with the complete service account JSON.
 */

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';

let adminApp: App | null = null;
let adminAuthInstance: Auth | null = null;

/**
 * Get or initialize Firebase Admin App
 * Singleton pattern ensures only one instance exists
 */
export function getAdminApp(): App {
  if (adminApp) {
    return adminApp;
  }

  const apps = getApps();
  if (apps.length > 0) {
    adminApp = apps[0];
    return adminApp;
  }

  // Parse service account from environment variable
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_JSON environment variable is required.\n\n' +
      'Setup instructions:\n' +
      '1. Get your service account JSON from Firebase Console\n' +
      '   (Project Settings → Service Accounts → Generate New Private Key)\n' +
      '2. Add to .env file:\n' +
      '   FIREBASE_SERVICE_ACCOUNT_JSON=\'{"type":"service_account",...}\'\n' +
      '3. For Vercel: Add as environment variable in dashboard\n'
    );
  }

  let serviceAccount: Record<string, unknown>;

  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } catch {
    throw new Error(
      'Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON environment variable.\n' +
      'Make sure it contains valid JSON (the complete service account object).'
    );
  }

  // Initialize Firebase Admin SDK
  adminApp = initializeApp({
    credential: cert(serviceAccount),
  });

  return adminApp;
}/**
 * Get Firebase Admin Auth instance
 * Lazy initialization of Auth service
 */
export function getAdminAuth(): Auth {
  if (!adminAuthInstance) {
    adminAuthInstance = getAuth(getAdminApp());
  }
  return adminAuthInstance;
}
