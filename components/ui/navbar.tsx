"use client";

import Image from "next/image";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function NavBar() {
  const { user, loading, signOut, isAuthenticated } = useAuth();

  return (
    <header
      className={
        isAuthenticated
          ? "flex items-center justify-between px-4 "
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

      {!loading && isAuthenticated && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300">
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
