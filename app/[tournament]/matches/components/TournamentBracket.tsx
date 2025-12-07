"use client";

import { Match } from "@/lib/types/tournament";
import { useMemo } from "react";
import MatchCard from "./MatchCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import RoundHeader from "./RoundHeader";

interface TournamentBracketProps {
  matches: Match[];
  tournamentId: string;
}

interface RoundGroup {
  roundIndex: number;
  roundName: string;
  matches: Match[];
}

export default function TournamentBracket({
  matches,
  tournamentId,
}: TournamentBracketProps) {
  // Group matches by round
  const rounds = useMemo(() => {
    const roundMap = new Map<number, RoundGroup>();

    matches.forEach((match) => {
      if (!roundMap.has(match.roundIndex)) {
        roundMap.set(match.roundIndex, {
          roundIndex: match.roundIndex,
          roundName: match.roundName,
          matches: [],
        });
      }
      roundMap.get(match.roundIndex)!.matches.push(match);
    });

    // Convert to array and sort by round index
    return Array.from(roundMap.values()).sort(
      (a, b) => a.roundIndex - b.roundIndex
    );
  }, [matches]);

  if (matches.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No hay partidos disponibles</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ScrollArea className="h-[50vh] sm:h-[350px]">
        <div className="space-y-6">
          {rounds.map((round, index) => (
            <div key={index} className="space-y-4">
              <RoundHeader
                name={round.roundName}
                matchCount={round.matches.length}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {round.matches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    tournamentId={tournamentId}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
