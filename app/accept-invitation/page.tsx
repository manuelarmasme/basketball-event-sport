"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Chrome } from "lucide-react";
import { Loading } from "@/components/ui/loading";

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(false);

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
      console.error("Accept invitation error:", error);

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

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Aceptar Invitación
          </h1>
          <p className="text-gray-600">
            Inicia sesión con Google para aceptar tu invitación y unirte a
            Reskata Event Sport
          </p>
        </div>

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
              className="w-full"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Procesando...
                </>
              ) : (
                <>
                  <Chrome className="mr-2 h-5 w-5" />
                  Continuar con Google
                </>
              )}
            </Button>

            <p className="text-xs text-center text-gray-500">
              Al continuar, aceptas los términos de servicio y la política de
              privacidad
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AcceptInvitationContent />
    </Suspense>
  );
}
