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

export default function InscriptionDialog({
  participantName,
}: {
  participantName: string;
}) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const { createParticipant } = useCreateParticipant();
  const params = useParams();

  const handleInscription = async () => {
    setLoading(true);

    try {
      const tournamentId = params.tournament as string;

      await createParticipant({ name: participantName }, tournamentId);

      toast.success(`Participante ${participantName} inscrito correctamente.`);
    } catch (error) {
      posthog.captureException(error, {
        error_location: "InscriptionDialog_handleInscription",
        participant_name: participantName,
        tournament_id: params.tournament,
      });
      toast.error("Error al inscribir al participante. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Dialog content goes here */}
      <DialogTrigger asChild>
        <Button type="button" variant="secondary" size="sm">
          Inscribir
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Inscribir a {participantName}
          </DialogTitle>

          <DialogDescription className="text-lg">
            ¿Estás seguro de que deseas inscribir a {participantName} en el
            torneo?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={loading}>
              Cancelar
            </Button>
          </DialogClose>

          <Button
            type="submit"
            variant="default"
            disabled={loading}
            onClick={handleInscription}
          >
            Inscribir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
