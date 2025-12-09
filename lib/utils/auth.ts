/**
 * Auth utility functions for Firebase Authentication
 * Server-side and client-side helpers for user management
 */

import { User } from "firebase/auth";

/**
 * Extract user data from Firebase User object
 * Useful for serialization and storage
 */
export function getUserData(user: User | null) {
  if (!user) return null;

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
  };
}

/**
 * Check if user has a specific custom claim
 *
 * @example
 * ```ts
 * const isAdmin = await hasCustomClaim(user, 'role', 'admin');
 * ```
 */
export async function hasCustomClaim(
  user: User,
  claimKey: string,
  claimValue: unknown
): Promise<boolean> {
  try {
    const idTokenResult = await user.getIdTokenResult();
    return idTokenResult.claims[claimKey] === claimValue;
  } catch (error) {
    console.error("Error checking custom claim:", error);
    return false;
  }
}

/**
 * Get user's custom claims
 */
export async function getUserClaims(user: User): Promise<Record<string, unknown>> {
  try {
    const idTokenResult = await user.getIdTokenResult();
    return idTokenResult.claims;
  } catch (error) {
    console.error("Error getting user claims:", error);
    return {};
  }
}

/**
 * Format user display name for UI
 */
export function formatUserDisplayName(user: User | null): string {
  if (!user) return "Usuario";

  if (user.displayName) return user.displayName;
  if (user.email) return user.email.split("@")[0];

  return "Usuario";
}

/**
 * Check if user email is verified
 */
export function isEmailVerified(user: User | null): boolean {
  return user?.emailVerified ?? false;
}
