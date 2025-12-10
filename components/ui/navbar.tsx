"use client";

import Image from "next/image";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";

export default function NavBar() {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);

  // Check if user is being verified
  useEffect(() => {
    const checkVerification = () => {
      setIsVerifying(localStorage.getItem("isVerifyingAccess") === "true");
    };

    checkVerification();

    // Listen for storage changes
    window.addEventListener("storage", checkVerification);
    // Also check periodically in case same-tab changes
    const interval = setInterval(checkVerification, 100);

    return () => {
      window.removeEventListener("storage", checkVerification);
      clearInterval(interval);
    };
  }, []);

  return (
    <header
      className={
        isAuthenticated && !isVerifying
          ? "flex items-center justify-between px-4"
          : "dark flex w-full justify-center items-center px-4"
      }
    >
      <Image
        loading="eager"
        src="/logo.jpeg"
        alt="Logo"
        width={150}
        height={50}
      />

      {!loading && isAuthenticated && !isVerifying && (
        <div className="flex items-center gap-4">
          <span className="hidden md:block text-sm text-gray-300">
            {user?.displayName || user?.email}
          </span>
          <Button
            onClick={signOut}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </Button>
        </div>
      )}
    </header>
  );
}
