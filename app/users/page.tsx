"use client";

import { InviteUserDialog } from "./components/InviteUserDialog";
import InvitationsList from "./components/InvitationsList";
import { useInvitations } from "@/lib/hooks/useInvitations";
import { Loading } from "@/components/ui/loading";

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
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Usuarios</h1>
          <p className="text-gray-600 mt-1">
            Gestiona las invitaciones de usuarios al sistema
          </p>
        </div>
        <InviteUserDialog />
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Invitaciones</h2>
        <InvitationsList invitations={invitations} />
      </div>
    </div>
  );
}
