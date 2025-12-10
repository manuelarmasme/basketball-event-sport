"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Google from "../assets/icons/gmail";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/lib/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { user, loading } = useAuth();

  // Redirect authenticated users to home only if not currently verifying
  useEffect(() => {
    if (!loading && user && !isVerifying) {
      router.push("/");
    }
  }, [user, loading, isVerifying, router]);

  async function handleGoogleSignIn() {
    setIsLoading(true);
    setIsVerifying(true);
    // Set flag in localStorage to prevent navbar from showing
    localStorage.setItem('isVerifyingAccess', 'true');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Verify user has access (invited users only)
      const verifyResponse = await fetch("/api/verify-user-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
        }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData.hasAccess) {
        // User was deleted by API, sign out locally
        await auth.signOut();
        localStorage.removeItem('isVerifyingAccess');
        toast.error(verifyData.error || "No tienes acceso a esta aplicación");
        setIsVerifying(false);
        return;
      }

      toast.success(`Bienvenido, ${result.user.displayName || "Usuario"}`);

      // Redirect to original page or home
      localStorage.removeItem('isVerifyingAccess');
      const redirect = searchParams.get("redirect") || "/";
      setIsVerifying(false);
      router.push(redirect);
    } catch (error) {
      console.error("Error signing in:", error);
      localStorage.removeItem('isVerifyingAccess');
      toast.error("Error al iniciar sesión con Google");
      setIsVerifying(false);
    } finally {
      setIsLoading(false);
    }
  }

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Don't show login form if already authenticated (will redirect)
  if (user && !isVerifying) {
    return null;
  }

  return (
    <div className="h-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Iniciar Sesión
            </h1>
            <p className="text-muted-foreground">
              {isVerifying
                ? "Verificando tu acceso..."
                : "Accede a tu cuenta para continuar"}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isVerifying ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Spinner />
              <p className="text-sm text-muted-foreground">
                Validando tu invitación...
              </p>
            </div>
          ) : (
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              variant="outline"
              className="w-full h-12 gap-3 cursor-pointer"
            >
              <Google className="w-5 h-5" />
              {isLoading ? "Iniciando sesión..." : "Continuar con Google"}
            </Button>
          )}

          <p className="text-xs text-center text-muted-foreground">
            Al continuar, aceptas nuestros términos de servicio y política de
            privacidad
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full flex items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
