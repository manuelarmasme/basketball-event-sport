"use client";

import { useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

interface AuthState {
  user: UserData | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to manage Firebase Authentication state
 * Provides user data, loading state, and sign out functionality
 *
 * @example
 * ```tsx
 * const { user, loading, signOut } = useAuth();
 *
 * if (loading) return <Loading />;
 * if (!user) return <LoginPrompt />;
 *
 * return <div>Welcome, {user.displayName}</div>;
 * ```
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: User | null) => {
        if (firebaseUser) {
          const userData: UserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
          };

          setAuthState({
            user: userData,
            loading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            loading: false,
            error: null,
          });
        }
      },
      (error) => {
        console.error("Auth state change error:", error);
        setAuthState({
          user: null,
          loading: false,
          error: error as Error,
        });
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  async function signOut() {
    try {
      await firebaseSignOut(auth);
      toast.success("Sesión cerrada correctamente");
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error al cerrar sesión");
    }
  }

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signOut,
    isAuthenticated: !!authState.user,
  };
}

/**
 * Hook to get custom claims from the current user's ID token
 * Useful for checking user roles (admin, manager, etc.)
 *
 * @example
 * ```tsx
 * const { claims, loading } = useUserClaims();
 *
 * if (claims?.role === 'admin') {
 *   return <AdminPanel />;
 * }
 * ```
 */
export function useUserClaims() {
  const [claims, setClaims] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          setClaims(idTokenResult.claims);
        } catch (error) {
          console.error("Error getting ID token:", error);
          setClaims(null);
        }
      } else {
        setClaims(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { claims, loading };
}

/**
 * Hook to require authentication for a page
 * Redirects to login if user is not authenticated
 *
 * @param redirectTo - Optional redirect path after login (default: current path)
 *
 * @example
 * ```tsx
 * function ProtectedPage() {
 *   const { user, loading } = useRequireAuth();
 *
 *   if (loading) return <Loading />;
 *
 *   // User is guaranteed to be authenticated here
 *   return <div>Protected content</div>;
 * }
 * ```
 */
export function useRequireAuth(redirectTo?: string) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      const currentPath = window.location.pathname;
      const redirect = redirectTo || currentPath;
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
    }
  }, [user, loading, router, redirectTo]);

  return { user, loading };
}
