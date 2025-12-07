"use client";

import { Button } from "@/components/ui/button";
import { useTournamentBracket } from "@/lib/hooks/useEvents";
import { MatchPlayer } from "@/lib/types/tournament";
import posthog from "posthog-js";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface StartTournamentButtonProps {
  tournamentId: string;
  participants: MatchPlayer[];
  tournamentStatus: string;
  onStartCreating?: () => void;
}

export default function StartTournamentButton({
  tournamentId,
  participants,
  tournamentStatus,
  onStartCreating,
}: StartTournamentButtonProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const { startTournament, loading: tournamentLoading } =
    useTournamentBracket();

  const handleStartTournament = async () => {
    if (participants.length < 2) {
      toast.error(
        "Se necesitan al menos 2 participantes para iniciar el torneo"
      );
      return;
    }

    try {
      setIsCreating(true);
      onStartCreating?.();

      const result = await startTournament(tournamentId, participants);

      toast.success(
        `¡Torneo iniciado! Se crearon ${result.matchCount} partidos.`
      );

      // Navigate to matches page after tournament starts
      setTimeout(() => {
        router.push(`/${tournamentId}/matches`);
      }, 1500);
    } catch (error) {
      setIsCreating(false);
      posthog.captureException(error, {
        error_location: "StartTournamentButton_handleStartTournament",
        tournament_id: tournamentId,
      });
      toast.error("Error al iniciar el torneo. Inténtalo de nuevo.");
    }
  };

  // If tournament is in progress or finished, don't show button (header has Ver Partidos)
  if (tournamentStatus === "in_progress" || tournamentStatus === "finished") {
    return null;
  }

  // Otherwise, show "Comenzar torneo" button
  return (
    <Button
      disabled={
        participants.length < 2 ||
        tournamentLoading ||
        isCreating ||
        tournamentStatus !== "registration"
      }
      variant="default"
      onClick={handleStartTournament}
    >
      {isCreating ? "Creando..." : "Comenzar torneo"}
    </Button>
  );
}
