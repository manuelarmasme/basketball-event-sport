/**
 * Firebase Client SDK Configuration
 * Initializes Firebase App and Firestore with type-safe collection helpers
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  Firestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { CONSTANTS } from './config/constant';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: CONSTANTS.ENV.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: CONSTANTS.ENV.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: CONSTANTS.ENV.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: CONSTANTS.ENV.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: CONSTANTS.ENV.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: CONSTANTS.ENV.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
] as const;

for (const envVar of requiredEnvVars) {
  if (!CONSTANTS.ENV[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Initialize Firebase App (singleton pattern)
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firestore
export const db: Firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
});

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);
