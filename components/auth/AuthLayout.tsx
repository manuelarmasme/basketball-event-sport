"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

/**
 * AuthLayout - Client-side authentication wrapper
 *
 * Protects routes by checking Firebase Auth state.
 * Redirects unauthenticated users to login with return URL.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      // Not authenticated, redirect to login with return URL
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/login?redirect=${returnUrl}`);
    }
  }, [user, loading, router, pathname]);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  // Not authenticated, will redirect in useEffect
  if (!user) {
    return null;
  }

  // Authenticated, render protected content
  return <>{children}</>;
}
