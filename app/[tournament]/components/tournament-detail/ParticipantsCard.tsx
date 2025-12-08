import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MatchPlayer, PreIncriptionPlayer } from "@/lib/types/tournament";
import { Empty, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Loading } from "@/components/ui/loading";
import { Users } from "lucide-react";
import ListParticipants from "./ListParticipants";

interface ParticipantsListCardProps {
  cardTitle: string;
  participants: MatchPlayer[] | PreIncriptionPlayer[];
  emptyDescription: string;
  loadingMessage: string;
  canManageInscriptions: boolean;
  eventStatus: string;
  isPending: boolean;
  headerAction?: React.ReactNode;
  filterPlaceholder?: string;
  showRemoveButton?: boolean;
  alwaysShowHeaderAction?: boolean;
}

export default function ParticipantsListCard({
  cardTitle,
  participants,
  emptyDescription,
  loadingMessage,
  canManageInscriptions,
  eventStatus,
  isPending,
  headerAction,
  filterPlaceholder,
  showRemoveButton = false,
  alwaysShowHeaderAction = false,
}: ParticipantsListCardProps) {
  return (
    <>
      <Card>
        <CardHeader className="text-primary font-bold text-xl flex justify-between items-center">
          <div className="flex flex-row justify-center items-center">
            {cardTitle}
            {participants.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 text-xs rounded-full h-5 min-w-5 "
              >
                {participants.length}
              </Badge>
            )}
          </div>

          {(canManageInscriptions || alwaysShowHeaderAction) && headerAction}
        </CardHeader>
        <CardContent>
          {!canManageInscriptions ? (
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm text-muted-foreground">
                {eventStatus === "in_progress"
                  ? "🏀 El torneo está en curso. Las inscripciones están cerradas."
                  : eventStatus === "locked"
                  ? "🔒 El torneo está iniciando. Las inscripciones están cerradas."
                  : "🏆 El torneo ha finalizado. Las inscripciones están cerradas."}
              </p>
            </div>
          ) : isPending ? (
            <Loading message={loadingMessage} />
          ) : participants.length === 0 ? (
            <Empty>
              <EmptyMedia>
                <Users className="w-16 h-16 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>{emptyDescription}</EmptyTitle>
            </Empty>
          ) : (
            <ListParticipants
              participants={participants}
              filterPlaceholder={filterPlaceholder}
              removeInscription={showRemoveButton && canManageInscriptions}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
