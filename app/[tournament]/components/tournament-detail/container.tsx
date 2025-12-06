"use client";
import { useState, useEffect, useTransition } from "react";
import { Loading } from "@/components/ui/loading";
import { useEvent, useParticipants } from "@/lib/hooks/useEvents";
import TournamentDetailHeader from "./header";
import { fetchParticipants } from "@/lib/actions/sheets";
import { PreIncriptionPlayer } from "@/lib/types/tournament";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Empty, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Users, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ListParticipants from "./ListParticipants";
import { Badge } from "@/components/ui/badge";

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

  useEffect(() => {
    if (event?.googleSheetUrl) {
      startTransition(async () => {
        const data = await fetchParticipants(event.googleSheetUrl as string);
        console.log("Data received in client:", data);
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

      <section className="w-full grid grid-cols-1 md:grid-cols-2">
        {event?.googleSheetUrl && (
          <Card>
            <CardHeader className="text-primary font-bold text-xl flex justify-between items-center">
              <div className="flex flex-row justify-center items-center">
                Participantes Pre-inscritos
                {participants.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 text-xs rounded-full h-5 min-w-5 "
                  >
                    {participants.length}
                  </Badge>
                )}
              </div>
              <Button variant="outline" size="lg">
                <Plus className="w-4 h-4" />
              </Button>
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
                <ListParticipants participants={participants} />
              )}
            </CardContent>
          </Card>
        )}

        <Card className="mt-8 md:mt-0 md:ml-8">
          <CardHeader className="text-primary font-bold text-xl">
            Inscritos
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
              <ScrollArea className="h-64">
                <ul className="flex flex-col gap-4">
                  {matchParticipants.map((player) => (
                    <li className="text-lg" key={player.id}>
                      {player.name}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
