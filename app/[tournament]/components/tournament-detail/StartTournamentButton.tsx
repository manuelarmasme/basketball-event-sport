"use client";

import { Button } from "@/components/ui/button";
import { useTournamentBracket } from "@/lib/hooks/useEvents";
import { MatchPlayer } from "@/lib/types/tournament";
import posthog from "posthog-js";
import { toast } from "sonner";

interface StartTournamentButtonProps {
  tournamentId: string;
  participants: MatchPlayer[];
  tournamentStatus: string;
}

export default function StartTournamentButton({
  tournamentId,
  participants,
  tournamentStatus,
}: StartTournamentButtonProps) {
  const { startTournament, loading: tournamentLoading, getTournamentStats } =
    useTournamentBracket();

  const handleStartTournament = async () => {
    if (participants.length < 2) {
      toast.error("Se necesitan al menos 2 participantes para iniciar el torneo");
      return;
    }

    try {
      const stats = getTournamentStats(participants.length);

      if (stats) {
        toast.info(
          `Se generará un torneo con ${stats.totalMatches} partidos. ${stats.byeCount > 0 ? `${stats.byeCount} jugadores pasarán automáticamente a la siguiente ronda.` : ""}`
        );
      }

      const result = await startTournament(tournamentId, participants);

      toast.success(
        `¡Torneo iniciado! Se crearon ${result.matchCount} partidos.`
      );
    } catch (error) {
      posthog.captureException(error, {
        error_location: "StartTournamentButton_handleStartTournament",
        tournament_id: tournamentId,
      });
      toast.error("Error al iniciar el torneo. Inténtalo de nuevo.");
    }
  };

  return (
    <Button
      disabled={
        participants.length < 2 ||
        tournamentLoading ||
        tournamentStatus !== "registration"
      }
      variant="default"
      onClick={handleStartTournament}
    >
      {tournamentLoading ? "Iniciando..." : "Comenzar torneo"}
    </Button>
  );
}
