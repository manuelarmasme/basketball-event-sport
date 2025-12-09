"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loading } from "@/components/ui/loading";
import Google from "../assets/icons/gmail";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { useAuth } from "@/lib/hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading } = useAuth();

  // Redirect authenticated users to home
  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  async function handleGoogleSignIn() {
    if (!token) {
      toast.error("Token de invitación inválido");
      return;
    }

    setIsLoading(true);

    try {
      // Sign in with Google
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Set custom claims via API route
      const response = await fetch("/api/set-user-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: result.user.uid,
          token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to set user role");
      }

      toast.success(
        "¡Bienvenido! Tu cuenta ha sido configurada correctamente."
      );

      // Redirect to home page
      router.push("/");
    } catch (error: unknown) {
      // Handle specific error messages
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("expired")) {
        toast.error(
          "La invitación ha expirado. Por favor contacta al administrador."
        );
      } else if (errorMessage.includes("inválida")) {
        toast.error("Invitación inválida o ya utilizada.");
      } else {
        toast.error(
          "Error al aceptar la invitación. Por favor intenta de nuevo."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Don't show form if already authenticated (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="max-w-md w-full rounded-lg shadow-lg">
        <Card className="p-6">
          <CardHeader>
            <div className="text-center">
              <h1 className="text-3xl font-bold  my-2">Aceptar Invitación</h1>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-center">
              Inicia sesión con Google para aceptar tu invitación y unirte a
              Reskata Event Sport
            </p>
          </CardContent>

          <CardAction>
            {!token ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-800">
                  Token de invitación no encontrado. Verifica que el enlace sea
                  correcto.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  size="lg"
                  className="w-full cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Google className="mr-2 h-5 w-5" />
                      Continuar con Google
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  Al continuar, aceptas los términos de servicio y la política
                  de privacidad
                </p>
              </div>
            )}
          </CardAction>
        </Card>
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<Loading message="Cargando invitación" />}>
      <AcceptInvitationContent />
    </Suspense>
  );
}
