"use client";

import { InviteUserDialog } from "./components/InviteUserDialog";
import InvitationsList from "./components/InvitationsList";
import { useInvitations } from "@/lib/hooks/useInvitations";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";

export default function Users() {
  const { invitations, loading, error } = useInvitations();

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">
            Error al cargar las invitaciones. Por favor recarga la página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between mb-6">
            <Link href={`/`} className="cursor-pointer">
              <div className=" flex flex-row items-center text-sm mb-2 gap-2 text-gray-500 ">
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio
              </div>
            </Link>
            <div className="flex flex-row justify-between w-full">
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold">Usuarios</h1>
                <p className="text-gray-400 mt-1">
                  Gestiona las invitaciones de usuarios al sistema
                </p>
              </div>
              <InviteUserDialog />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <InvitationsList invitations={invitations} />
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
