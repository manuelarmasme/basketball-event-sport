"use client";

import { Match } from "@/lib/types/tournament";
import { useMemo } from "react";
import MatchCard from "./MatchCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

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
      {/* Mobile/Tablet: Vertical Layout */}
      <div className="lg:hidden space-y-6">
        {rounds.map((round, index) => (
          <div key={index} className="space-y-4">
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur pb-2 pt-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-primary">
                  {round.roundName}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {round.matches.length}{" "}
                  {round.matches.length === 1 ? "partido" : "partidos"}
                </Badge>
              </div>
            </div>

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

      {/* Desktop: Horizontal Scrollable Bracket */}
      <div className="hidden lg:block">
        <ScrollArea className="w-full">
          <div className="flex gap-8 pb-4 min-w-max px-4">
            {rounds.map((round, roundIdx) => (
              <div
                key={round.roundIndex}
                className="flex flex-col space-y-4 min-w-[300px]"
              >
                {/* Round Header */}
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur pb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-primary">
                      {round.roundName}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {round.matches.length}
                    </Badge>
                  </div>
                </div>

                {/* Matches */}
                <div
                  className="flex flex-col gap-4"
                  style={{
                    // Add spacing between matches to show bracket structure
                    gap:
                      roundIdx > 0
                        ? `${Math.pow(2, roundIdx) * 1.5}rem`
                        : "1rem",
                  }}
                >
                  {round.matches.map((match) => (
                    <div
                      key={match.id}
                      className="relative"
                      style={{
                        // Add margin top for better alignment in later rounds
                        marginTop:
                          roundIdx > 0
                            ? `${Math.pow(2, roundIdx - 1) * 1}rem`
                            : "0",
                      }}
                    >
                      <MatchCard
                        match={match}
                        compact
                        tournamentId={tournamentId}
                      />

                      {/* Connection line to next round */}
                      {match.nextMatchId && roundIdx < rounds.length - 1 && (
                        <div className="absolute top-1/2 -right-8 w-8 h-0.5 bg-border" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
