"use client";
import { Loading } from "@/components/ui/loading";
import { useEvent } from "@/lib/hooks/useEvents";
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
