"use client";
import { Loading } from "@/components/ui/loading";
import { useEvent } from "@/lib/hooks/useEvents";
import { SportEvent } from "@/lib/types/tournament";
import TournamentDetailHeader from "./header";

export default function TournamentDetailContainer({
  tournamentId,
}: {
  tournamentId: string;
}) {
  const { event, loading } = useEvent(tournamentId);

  if (loading) {
    return <Loading message="Cargando datos de evento..." />;
  }

  {
    /* Aquí puedes renderizar los detalles del torneo usando los datos de 'event' */
  }

  return (
    <>
      <TournamentDetailHeader
        name={event?.name || ""}
        status={event?.status || ""}
        gobackUrl="/"
      />
    </>
  );
}
