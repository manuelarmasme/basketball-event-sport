"use client";

import { Button } from "@/components/ui/button";
import { useCreateParticipant } from "@/lib/hooks/useEvents";
import { useParams } from "next/navigation";
import posthog from "posthog-js";
import { useState } from "react";
import { toast } from "sonner";

export default function InscriptionButton({
  participantName,
}: {
  participantName: string;
}) {
  const [loading, setLoading] = useState(false);

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
    }
  };

  return (
    <Button
      type="button"
      className="cursor-pointer"
      variant="secondary"
      size="sm"
      aria-label="Inscribir"
      onClick={handleInscription}
      disabled={loading}
    >
      {loading ? "Inscribiendo..." : "Inscribir"}
    </Button>
  );
}
