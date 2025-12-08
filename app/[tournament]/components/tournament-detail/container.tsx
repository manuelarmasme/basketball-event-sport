"use client";
import { useState, useEffect, useTransition } from "react";
import { Loading } from "@/components/ui/loading";
import { useEvent, useParticipants } from "@/lib/hooks/useEvents";
import TournamentDetailHeader from "./header";
import { fetchParticipants } from "@/lib/actions/sheets";
import { MatchPlayer, PreIncriptionPlayer } from "@/lib/types/tournament";
import CreateInscriptionDialog from "./CreateInscriptionDialog";
import StartTournamentButton from "./StartTournamentButton";
import ParticipantsListCard from "./ParticipantsCard";
import CreatingMatchesLoader from "./CreatingMatchesLoader";
import ResetTournamentButton from "./ResetTournamentButton";

export default function TournamentDetailContainer({
  tournamentId,
}: {
  tournamentId: string;
}) {
  const { event, loading } = useEvent(tournamentId);
  const { participants: matchParticipants, loading: participantsLoading } =
    useParticipants(tournamentId);
  const [participants, setParticipants] = useState<PreIncriptionPlayer[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isCreatingTournament, setIsCreatingTournament] = useState(false);

  const canManageInscriptions = event?.status === "registration";

  const subscribedNames = new Set(
    matchParticipants.map((p) => p.name.toLowerCase())
  );
  const availableParticipants = participants.filter(
    (p) => !subscribedNames.has(p.name.toLowerCase())
  );

  useEffect(() => {
    if (event?.googleSheetUrl) {
      startTransition(async () => {
        const data = await fetchParticipants(event.googleSheetUrl as string);
        setParticipants(data);
      });
    }
  }, [event?.googleSheetUrl]);

  if (loading) {
    return <Loading message="Cargando datos de evento..." />;
  }

  if (isCreatingTournament) {
    return <CreatingMatchesLoader />;
  }

  return (
    <>
      <TournamentDetailHeader
        name={event?.name || ""}
        status={event?.status || ""}
        gobackUrl="/"
        matchesUrl={`/${tournamentId}/matches`}
      />

      <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {event?.googleSheetUrl && (
          <ParticipantsListCard
            cardTitle="Pre-inscritos"
            participants={availableParticipants}
            emptyDescription="No hay participantes pre-inscritos"
            loadingMessage="Cargando participantes..."
            canManageInscriptions={canManageInscriptions}
            eventStatus={event?.status || ""}
            isPending={isPending}
            headerAction={<CreateInscriptionDialog />}
            showRemoveButton={false}
          />
        )}

        <ParticipantsListCard
          cardTitle="Inscritos"
          participants={matchParticipants}
          emptyDescription="No hay inscritos"
          loadingMessage="Cargando inscritos..."
          canManageInscriptions={canManageInscriptions}
          eventStatus={event?.status || ""}
          isPending={participantsLoading}
          filterPlaceholder="Filtrar Inscritos..."
          alwaysShowHeaderAction={event?.status === "in_progress"}
          headerAction={
            <>
              {event?.status === "in_progress" && (
                <ResetTournamentButton
                  tournamentId={tournamentId}
                  participants={matchParticipants as MatchPlayer[]}
                  onStartResetting={() => setIsCreatingTournament(true)}
                />
              )}
              {event?.status === "registration" && (
                <StartTournamentButton
                  tournamentId={tournamentId}
                  participants={matchParticipants as MatchPlayer[]}
                  tournamentStatus={event?.status || ""}
                  onStartCreating={() => setIsCreatingTournament(true)}
                />
              )}
            </>
          }
          showRemoveButton={true}
        />
      </section>
    </>
  );
}
