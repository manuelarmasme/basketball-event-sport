"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateParticipant } from "@/lib/hooks/useEvents";
import { useParams } from "next/navigation";
import posthog from "posthog-js";
import { useState } from "react";
import { toast } from "sonner";

export default function RemoveInscriptionDialog({
  participantName,
  participantId,
}: {
  participantName: string;
  participantId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const { removeParticipant } = useCreateParticipant();
  const params = useParams();

  const handleRemoveInscription = async () => {
    setLoading(true);

    try {
      const tournamentId = params.tournament as string;

      await removeParticipant(participantId, tournamentId);

      toast.success(`Participante ${participantName} eliminado correctamente.`);
    } catch (error) {
      posthog.captureException(error, {
        error_location: "InscriptionDialog_handleRemoveInscription",
        participant_name: participantName,
        tournament_id: params.tournament,
      });
      toast.error("Error al eliminar al participante. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Dialog content goes here */}
      <DialogTrigger asChild>
        <Button
          type="button"
          className="cursor-pointer"
          variant="outline"
          size="sm"
        >
          Remover
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Remover a {participantName}
          </DialogTitle>

          <DialogDescription className="text-lg">
            ¿Estás seguro de que deseas remover a {participantName} del torneo?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="outline"
              className="cursor-pointer"
              disabled={loading}
            >
              Cancelar
            </Button>
          </DialogClose>

          <Button
            type="submit"
            variant="default"
            className="cursor-pointer"
            disabled={loading}
            onClick={handleRemoveInscription}
          >
            Remover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
