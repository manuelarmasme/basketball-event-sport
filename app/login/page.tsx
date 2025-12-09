"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Google from "../assets/icons/gmail";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleGoogleSignIn() {
    setIsLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      toast.success(`Bienvenido, ${result.user.displayName || "Usuario"}`);

      // Redirect to home or dashboard
      router.push("/");
    } catch (error) {
      console.error("Error signing in:", error);
      toast.error("Error al iniciar sesión con Google");
    } finally {
      setIsLoading(false);
    }
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
              Accede a tu cuenta para continuar
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            variant="outline"
            className="w-full h-12 gap-3 cursor-pointer"
          >
            <Google className="w-5 h-5" />
            {isLoading ? "Iniciando sesión..." : "Continuar con Google"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Al continuar, aceptas nuestros términos de servicio y política de
            privacidad
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
