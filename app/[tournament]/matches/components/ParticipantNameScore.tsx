import { Match, MatchPlayer } from "@/lib/types/tournament";
import { cn } from "@/lib/utils";
import { Trophy, Ban } from "lucide-react";

interface ParticipantNameScoreProps {
  player: MatchPlayer | null;
  isCompleted: boolean;
  match: Match;
}
export default function ParticipantNameScore({
  player,
  isCompleted,
  match,
}: ParticipantNameScoreProps) {
  const isWinner = isCompleted && match.winnerId === player?.id;
  const isDisqualified = player?.disqualified;

  return (
    <>
      <div
        className={cn(
          "flex items-center justify-between p-2 rounded-md transition-colors",
          player
            ? isDisqualified
              ? "bg-destructive/5 border border-destructive/30"
              : isWinner
              ? "bg-green-500/10 ring-1 ring-green-500/30"
              : "bg-muted/50"
            : "bg-muted/30",
          !player && "text-muted-foreground"
        )}
      >
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {isDisqualified ? (
            <Ban className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
          ) : isWinner ? (
            <Trophy className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
          ) : null}
          <span
            className={cn(
              "font-medium text-sm truncate",
              isDisqualified && "text-muted-foreground",
              !player && "text-xs italic"
            )}
          >
            {player ? player.name : "Por definir"}
          </span>
        </div>
        {player?.score !== undefined && (
          <span
            className={cn(
              "text-base font-bold ml-2 flex-shrink-0",
              isDisqualified && "text-muted-foreground"
            )}
          >
            {player.score}
          </span>
        )}
      </div>
    </>
  );
}
