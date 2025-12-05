"use client";
import { useState, useEffect, useTransition } from "react";
import { Loading } from "@/components/ui/loading";
import { useEvent } from "@/lib/hooks/useEvents";
import TournamentDetailHeader from "./header";
import { fetchParticipants } from "@/lib/actions/sheets";
import { PreIncriptionPlayer } from "@/lib/types/tournament";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Empty, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Users, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function TournamentDetailContainer({
  tournamentId,
}: {
  tournamentId: string;
}) {
  const { event, loading } = useEvent(tournamentId);
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

      {event?.googleSheetUrl && (
        <Card>
          <CardHeader className="text-primary font-bold text-xl flex justify-between items-center">
            Participantes Pre-inscritos
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
              <ScrollArea className="h-64">
                <ul className="flex flex-col gap-4">
                  {participants.map((player, index) => (
                    <li className="text-lg" key={index}>
                      {player.name}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
