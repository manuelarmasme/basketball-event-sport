"use client";

import { useState } from "react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import FilterInput from "@/app/[tournament]/components/tournament-detail/FilterInput";
import type { Invitation } from "@/lib/types/invitation";
import { formatFirebaseTimestampToShowDateTime } from "@/lib/utils/dates";

interface InvitationsListProps {
  invitations: Invitation[];
}

export default function InvitationsList({ invitations }: InvitationsListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInvitations = invitations.filter(
    (inv) =>
      inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "accepted":
        return "bg-green-500 hover:bg-green-600";
      case "expired":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "accepted":
        return "Aceptada";
      case "expired":
        return "Expirada";
      default:
        return status;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "manager":
        return "Manager";
      default:
        return role;
    }
  };

  if (invitations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          No hay invitaciones. Crea una nueva para empezar.
        </p>
      </div>
    );
  }

  return (
    <>
      <FilterInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Filtrar invitaciones..."
      />

      <ScrollArea className="h-96 mt-4">
        {filteredInvitations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No se encontraron invitaciones con ese criterio
            </p>
          </div>
        ) : (
          filteredInvitations.map((invitation) => (
            <Item key={invitation.id} className="w-full px-0">
              <ItemContent>
                <ItemTitle>{invitation.name}</ItemTitle>
                <p className="text-sm text-gray-500">{invitation.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Enviada:{" "}
                  {formatFirebaseTimestampToShowDateTime(invitation.invitedAt)}
                </p>
              </ItemContent>
              <ItemActions>
                <Badge className={getStatusColor(invitation.status)}>
                  {getStatusLabel(invitation.status)}
                </Badge>
                <Badge variant="outline">{getRoleLabel(invitation.role)}</Badge>
              </ItemActions>
            </Item>
          ))
        )}
      </ScrollArea>
    </>
  );
}
