"use client";

import { useParams } from "next/navigation";
import { useEvent, useMatches } from "@/lib/hooks/useEvents";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Trophy, ArrowLeft } from "lucide-react";
import TournamentBracket from "./components/TournamentBracket";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function MatchesPage() {
  const params = useParams();
  const tournamentId = params.tournament as string;

  const { event, loading: eventLoading } = useEvent(tournamentId);
  const { matches, loading: matchesLoading } = useMatches(tournamentId);

  if (eventLoading || matchesLoading) {
    return <Loading message="Cargando torneo..." />;
  }

  if (!event) {
    return (
      <div className="container mx-auto p-4">
        <Empty>
          <EmptyMedia>
            <Trophy className="w-16 h-16 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>Torneo no encontrado</EmptyTitle>
        </Empty>
      </div>
    );
  }

  const getStatusColor = () => {
    switch (event.status) {
      case "registration":
        return "bg-blue-500/10 text-blue-600";
      case "locked":
        return "bg-yellow-500/10 text-yellow-600";
      case "in_progress":
        return "bg-green-500/10 text-green-600";
      case "finished":
        return "bg-gray-500/10 text-gray-600";
    }
  };

  const getStatusLabel = () => {
    switch (event.status) {
      case "registration":
        return "Inscripciones Abiertas";
      case "locked":
        return "Bloqueado";
      case "in_progress":
        return "En Progreso";
      case "finished":
        return "Finalizado";
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Link href={`/${tournamentId}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver al torneo
          </Button>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              {event.name}
            </h1>
            <Badge variant="outline" className={getStatusColor()}>
              {getStatusLabel()}
            </Badge>
          </div>

          {event.event_winner && (
            <Card className="w-fit">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Campeón</p>
                    <p className="font-bold text-lg">
                      {event.event_winner.name}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Tournament Bracket */}
      {matches.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <Empty>
              <EmptyMedia>
                <Trophy className="w-16 h-16 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>No hay partidos disponibles</EmptyTitle>
              <p className="text-sm text-muted-foreground mt-2">
                El torneo aún no ha comenzado. Los partidos aparecerán aquí una
                vez que se inicie el torneo.
              </p>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <TournamentBracket matches={matches} tournamentId={tournamentId} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
