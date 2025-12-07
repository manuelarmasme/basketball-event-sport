import { Match, MatchPlayer } from "@/lib/types/tournament";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";

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
  return (
    <>
      <div
        className={cn(
          "flex items-center justify-between p-3 rounded-lg transition-colors",
          player
            ? isCompleted && match.winnerId === player.id
              ? "bg-green-500/10 ring-2 ring-green-500/30"
              : "bg-muted/50"
            : "bg-muted/30",
          !player && "text-muted-foreground"
        )}
      >
        <div className="flex items-center gap-2 flex-1 line-clamp-1">
          {isCompleted && match.winnerId === player?.id && (
            <Trophy className="w-4 h-4 text-green-600" />
          )}
          <span
            className={cn(
              "font-medium truncate",
              !player && "text-sm italic truncate"
            )}
          >
            {player ? player.name : "Por definir"}
          </span>
        </div>
        {player?.score !== undefined && (
          <span className="text-lg font-bold ml-2">{player.score}</span>
        )}
      </div>
    </>
  );
}
