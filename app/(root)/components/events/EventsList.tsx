"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { Loading } from "@/components/ui/loading";
import { useEvents } from "@/lib/hooks/useEvents";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Calendar, Clock, List } from "lucide-react";
import { TournamentStatus } from "@/lib/types/tournament";
import { formatFirebaseTimestampToShowDateTime } from "@/lib/utils/dates";
import { Timestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getEventStatusValue } from "@/lib/config/constant";
import { useRouter } from "next/navigation";

export function EventsList() {
  const { events, loading, error } = useEvents();
  const router = useRouter();

  if (loading) return <Loading message="Cargando eventos..." />;

  if (error)
    return (
      <EmptyState
        icon={Calendar}
        message="Error al cargar los eventos. Por favor, intenta de nuevo."
        ctaText="Recargar"
        ctaAction={() => window.location.reload()}
      />
    );

  if (events.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        message="No hay eventos disponibles en este momento."
        ctaText="Crear Evento"
        ctaAction={() => console.log("create")}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Eventos Deportivos
        </h1>
      </div>

      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-row items-center gap-2">
            <List className="w-4 h-4 text-primary " />
            <h2 className="text-lg font-semibold">Lista de Eventos</h2>
          </div>

          <p>
            Gestiona y supervisa todos tus eventos deportivos desde este panel.
          </p>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableBody>
                {events.map((event) => {
                  const statusInfo = getEventStatusValue(
                    event.status as TournamentStatus
                  );

                  return (
                    <TableRow
                      key={event.id}
                      className="cursor-pointer flex flex-row justify-between items-center"
                      onClick={() => router.push(`/${event.id}`)}
                    >
                      <TableCell className="font-medium flex flex-col gap-2">
                        <h3 className="text-white text-xl">{event.name}</h3>
                        <span className="text-lg flex flex-row items-center gap-2 text-sm text-gray-400">
                          <Clock className="w-4 h-4" />
                          {formatFirebaseTimestampToShowDateTime(
                            event.date as unknown as Timestamp
                          )}
                        </span>

                        <div className="table-cell md:hidden">
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </Badge>

                          <Badge className="ml-2" variant="outline">
                            Participantes: {event.config.maxParticipants}
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>

                        <Badge className="ml-2" variant="outline">
                          Participantes: {event.config.maxParticipants}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
