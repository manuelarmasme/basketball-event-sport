"use client";
import { useState, useEffect, useTransition } from "react";
import { Loading } from "@/components/ui/loading";
import { useEvent, useParticipants } from "@/lib/hooks/useEvents";
import TournamentDetailHeader from "./header";
import { fetchParticipants } from "@/lib/actions/sheets";
import { MatchPlayer, PreIncriptionPlayer } from "@/lib/types/tournament";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Empty, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Users } from "lucide-react";
import ListParticipants from "./ListParticipants";
import { Badge } from "@/components/ui/badge";
import CreateInscriptionDialog from "./CreateInscriptionDialog";
import { Button } from "@/components/ui/button";

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

  return (
    <>
      <TournamentDetailHeader
        name={event?.name || ""}
        status={event?.status || ""}
        gobackUrl="/"
      />

      <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
        {event?.googleSheetUrl && (
          <Card>
            <CardHeader className="text-primary font-bold text-xl flex justify-between items-center">
              <div className="flex flex-row justify-center items-center">
                Participantes Pre-inscritos
                {availableParticipants.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 text-xs rounded-full h-5 min-w-5 "
                  >
                    {availableParticipants.length}
                  </Badge>
                )}
              </div>

              <CreateInscriptionDialog />
            </CardHeader>

            <CardContent>
              {isPending ? (
                <Loading message="Cargando participantes..." />
              ) : participants.length === 0 ? (
                <Empty>
                  <EmptyMedia>
                    <Users className="w-16 h-16 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyTitle>No hay participantes</EmptyTitle>
                </Empty>
              ) : (
                <ListParticipants participants={availableParticipants} />
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="text-primary font-bold text-xl flex justify-between items-center">
            <div className="flex flex-row justify-center items-center">
              Inscritos
              {matchParticipants.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 text-xs rounded-full h-5 min-w-5 "
                >
                  {matchParticipants.length}
                </Badge>
              )}
            </div>
            <Button disabled={matchParticipants.length === 0} variant="default">
              Comenzar torneo
            </Button>
          </CardHeader>
          <CardContent>
            {participantsLoading ? (
              <Loading message="Cargando inscritos..." />
            ) : matchParticipants.length === 0 ? (
              <Empty>
                <EmptyMedia>
                  <Users className="w-16 h-16 text-muted-foreground" />
                </EmptyMedia>
                <EmptyTitle>No hay inscritos</EmptyTitle>
              </Empty>
            ) : (
              <ListParticipants
                participants={matchParticipants as MatchPlayer[]}
                filterPlaceholder="Filtrar Inscritos..."
                removeInscription={true}
              />
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
