"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Match } from "@/lib/types/tournament";
import { cn } from "@/lib/utils";
import { Trophy, Clock, CheckCircle2, Ban } from "lucide-react";
import { useState } from "react";
import UpdateMatchDialog from "./UpdateMatchDialog";
import ParticipantNameScore from "./ParticipantNameScore";

interface MatchCardProps {
  match: Match;
  tournamentId: string;
  compact?: boolean;
}

export default function MatchCard({
  match,
  tournamentId,
  compact = false,
}: MatchCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  // Safety check for players array
  if (!match.players || !Array.isArray(match.players)) {
    return null;
  }

  const player1 = match.players[0];
  const player2 = match.players[1];
  const isCompleted = match.status === "COMPLETED";
  const isReady = match.status === "READY";
  const hasDisqualification = player1?.disqualified || player2?.disqualified;

  const getStatusColor = () => {
    switch (match.status) {
      case "COMPLETED":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "READY":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "WAITING":
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getStatusIcon = () => {
    switch (match.status) {
      case "COMPLETED":
        return <CheckCircle2 className="w-3 h-3" />;
      case "READY":
        return <Trophy className="w-3 h-3" />;
      case "WAITING":
        return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusLabel = () => {
    switch (match.status) {
      case "COMPLETED":
        return "Finalizado";
      case "READY":
        return "Por jugar";
      case "WAITING":
        return "Esperando";
    }
  };

  return (
    <>
      <Card
        className={cn(
          "relative overflow-hidden transition-all hover:shadow-md cursor-pointer",
          compact ? "min-w-[200px]" : "min-w-[280px]",
          isCompleted && "border-green-500/30",
          isReady && "border-blue-500/30"
        )}
        onClick={() => setDialogOpen(true)}
      >
        <CardHeader className="pb-3 space-y-0">
          <div className="flex items-center justify-between gap-2">
            <Badge
              variant="outline"
              className={cn("w-fit text-xs", getStatusColor())}
            >
              <span className="flex items-center gap-1">
                {getStatusIcon()}
                {getStatusLabel()}
              </span>
            </Badge>

            {hasDisqualification && (
              <Badge variant="destructive" className="text-xs">
                <Ban className="w-3 h-3 mr-1" />
                DQ
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {/* Player 1 */}

          <ParticipantNameScore
            player={player1}
            isCompleted={isCompleted}
            match={match}
          />

          {/* VS Divider */}
          <div className="flex items-center justify-center">
            <span className="text-xs text-muted-foreground font-semibold px-2">
              VS
            </span>
          </div>

          {/* Player 2 */}
          <ParticipantNameScore
            player={player2}
            isCompleted={isCompleted}
            match={match}
          />
        </CardContent>
      </Card>

      <UpdateMatchDialog
        match={match}
        tournamentId={tournamentId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
