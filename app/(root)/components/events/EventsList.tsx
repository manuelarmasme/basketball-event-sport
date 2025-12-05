'use client'

import { EmptyState } from '@/components/ui/empty-state';
import { Loading } from '@/components/ui/loading';
import { useEvents } from '@/lib/hooks/useEvents';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarX, 
  Calendar, 
  Users, 
  Trophy,
  Clock
} from 'lucide-react';
import { Event, TournamentStatus } from '@/lib/types/tournament';

const statusConfig: Record<TournamentStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  REGISTRATION: { label: 'Inscripción', variant: 'secondary' },
  LOCKED: { label: 'Bloqueado', variant: 'outline' },
  IN_PROGRESS: { label: 'En Progreso', variant: 'default' },
  FINISHED: { label: 'Finalizado', variant: 'secondary' }
};

function EventCard({ event }: { event: Event }) {
  const statusInfo = statusConfig[event.status] || { label: 'Desconocido', variant: 'outline' as const };
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-primary truncate group-hover:text-primary/90 transition-colors">
              {event.name}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Calendar className="size-4 shrink-0" />
              <span>{formattedDate}</span>
            </div>
          </div>
          <Badge variant={statusInfo.variant} className="shrink-0">
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3 border-t">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="size-4" />
            <span className="font-medium">Participantes:</span>
          </div>
          <span className="font-semibold text-foreground">
            {event.config?.maxParticipants}
          </span>
        </div>

        {event.event_winner ? (
          <div className="flex items-start gap-3 pt-2">
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="size-5 text-yellow-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Ganador</span>
                <span className="font-semibold text-primary text-base">
                  {event.event_winner.name}
                </span>
              </div>
            </div>
          </div>
        ) : event.status === 'IN_PROGRESS' ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
            <Clock className="size-4 animate-pulse" />
            <span className="italic">Torneo en curso...</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function EventsList() {
  const { events, loading, error } = useEvents();

  if (loading) return <Loading message='Cargando eventos...' />;
  
  if (error) return (
    <EmptyState 
      icon={CalendarX}
      message="Error al cargar los eventos. Por favor, intenta de nuevo."
      ctaText="Recargar"
      ctaAction={() => window.location.reload()}
    />
  );

  if (events.length === 0) {
    return (
      <EmptyState 
        icon={CalendarX}
        message="No hay eventos disponibles en este momento."
        ctaText="Crear Evento"
        ctaAction={() => console.log('create')}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Eventos Deportivos</h1>
        <p className="text-lg text-muted-foreground">
          Explora y participa en torneos de baloncesto emocionantes
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}