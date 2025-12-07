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
          "flex items-center justify-between p-3 rounded-lg transition-colors",
          player
            ? isDisqualified
              ? "bg-destructive/5 border border-destructive/30"
              : isWinner
              ? "bg-green-500/10 ring-2 ring-green-500/30"
              : "bg-muted/50"
            : "bg-muted/30",
          !player && "text-muted-foreground"
        )}
      >
        <div className="flex items-center gap-2 flex-1 line-clamp-1">
          {isDisqualified ? (
            <Ban className="w-4 h-4 text-destructive" />
          ) : isWinner ? (
            <Trophy className="w-4 h-4 text-green-600" />
          ) : null}
          <span
            className={cn(
              "font-medium truncate",
              isDisqualified && "text-muted-foreground",
              !player && "text-sm italic truncate"
            )}
          >
            {player ? player.name : "Por definir"}
          </span>
        </div>
        {player?.score !== undefined && (
          <span
            className={cn(
              "text-lg font-bold ml-2",
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
