/**
 * Firebase Admin SDK Initialization
 *
 * SECURITY: This file must stay inside app/api/ directory
 * to ensure credentials are never exposed to the client.
 *
 * Uses singleton pattern to prevent multiple initializations.
 */

import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import * as path from 'path';
import * as fs from 'fs';

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

  // Initialize with service account JSON file
  // The file path is relative to the project root
  const serviceAccountPath = path.join(process.cwd(), 'app', 'api', 'google-admin.json');

  // Verify the file exists
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error(
      'Firebase service account file not found at: ' + serviceAccountPath +
      '\nMake sure google-admin.json exists in app/api/ directory'
    );
  }

  // Read and parse the service account file
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

  // Initialize only once with service account credentials
  adminApp = initializeApp({
    credential: cert(serviceAccount),
  });

  return adminApp;
}

/**
 * Get Firebase Admin Auth instance
 * Lazy initialization of Auth service
 */
export function getAdminAuth(): Auth {
  if (!adminAuthInstance) {
    adminAuthInstance = getAuth(getAdminApp());
  }
  return adminAuthInstance;
}
