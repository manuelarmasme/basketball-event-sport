/**
 * Tournament Bracket Generation Utilities
 * Handles single-elimination tournament bracket creation
 */

import { Match, MatchPlayer } from '../types/tournament';

/**
 * Generate a complete single-elimination tournament bracket
 * Uses standard seeding with byes for non-power-of-2 participant counts
 *
 * @param participants - Array of enrolled players
 * @returns Array of Match objects representing the complete bracket (only matches with 2 players)
 *
 * @example
 * // 15 participants → 16-slot bracket
 * // - First round: 7 matches (14 players compete)
 * // - Byes: 1 player skips to Round 2 (no walkover match created)
 * // - Round 2: 8 players (7 winners + 1 bye)
 *
 * // 74 participants → 128-slot bracket
 * // - First round: 10 matches (20 players compete)
 * // - Byes: 54 players skip to Round 2 (no walkover matches)
 * // - Round 2: 64 players (10 winners + 54 byes)
 *
 * // 8 participants → 8-slot bracket (perfect power of 2)
 * // - First round: 4 matches (all 8 players compete)
 * // - No byes needed
 */
export function generateTournamentBracket(
  participants: MatchPlayer[]
): Match[] {
  const participantCount = participants.length;

  if (participantCount < 2) {
    throw new Error('Tournament requires at least 2 participants');
  }

  // 1. Find next power of 2 for bracket size
  const bracketSize = Math.pow(2, Math.ceil(Math.log2(participantCount)));

  // 2. Shuffle participants randomly for fair matchups
  const shuffledParticipants = shuffleArray([...participants]);

  // 3. Calculate number of byes
  const byeCount = bracketSize - participantCount;

  // 4. Calculate total rounds
  const totalRounds = Math.log2(bracketSize);

  // 5. Generate all matches for entire bracket
  const matches: Match[] = [];

  // Build bracket from first round to final
  for (let roundIndex = 0; roundIndex < totalRounds; roundIndex++) {
    const matchesInRound = Math.pow(2, totalRounds - 1 - roundIndex);
    const roundName = getRoundName(roundIndex, totalRounds);

    for (let matchInRound = 0; matchInRound < matchesInRound; matchInRound++) {
      const matchId = `match_r${roundIndex}_m${matchInRound}`;

      // Determine next match connection
      let nextMatchId: string | null = null;
      let nextMatchSlot: 0 | 1 = 0;

      if (roundIndex < totalRounds - 1) {
        // Not the final, so there's a next match
        const nextMatchIndex = Math.floor(matchInRound / 2);
        nextMatchId = `match_r${roundIndex + 1}_m${nextMatchIndex}`;
        nextMatchSlot = matchInRound % 2 === 0 ? 0 : 1;
      }

      matches.push({
        id: matchId,
        roundIndex,
        roundName,
        nextMatchId,
        nextMatchSlot,
        winnerId: null,
        status: 'WAITING',
        players: [null, null],
      });
    }
  }

  // 6. Assign players to first round (and bye players to round 2)
  assignPlayersToFirstRound(matches, shuffledParticipants, byeCount);

  // 7. Filter out first-round matches that have no players (bye slots)
  // This creates a cleaner bracket without empty "walkover" matches
  const filteredMatches = matches.filter((match) => {
    // Keep all non-first-round matches
    if (match.roundIndex > 0) return true;
    // Only keep first-round matches that have both players assigned
    return match.players[0] !== null && match.players[1] !== null;
  });

  return filteredMatches;
}

/**
 * Fisher-Yates shuffle algorithm for random array shuffling
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate human-readable round names
 *
 * @example
 * 128 players (7 rounds): Round of 128, Round of 64, Round of 32, Round of 16, Quarter Finals, Semi Finals, Final
 * 16 players (4 rounds): Round of 16, Quarter Finals, Semi Finals, Final
 * 8 players (3 rounds): Quarter Finals, Semi Finals, Final
 * 4 players (2 rounds): Semi Finals, Final
 */
function getRoundName(roundIndex: number, totalRounds: number): string {
  const roundsFromFinal = totalRounds - 1 - roundIndex;

  switch (roundsFromFinal) {
    case 0:
      return 'Final';
    case 1:
      return 'Semi Finals';
    case 2:
      return 'Quarter Finals';
    default:
      // For earlier rounds, use "Round of X"
      const playersInRound = Math.pow(2, roundIndex + 1);
      return `Round of ${playersInRound}`;
  }
}

/**
 * Assign shuffled players to first round matches
 * Players with byes skip the first round entirely and are placed directly in Round 2
 *
 * Strategy for 15 participants in 16-bracket:
 * - 1 bye player is placed directly in Quarter Finals (Round 2)
 * - 14 players compete in 7 first-round matches (READY)
 * - No walkover matches are created (cleaner UI)
 *
 * Strategy for 5 participants in 8-bracket:
 * - 3 bye players are placed directly in Round 2
 * - 2 players compete in 1 first-round match (READY)
 * - Round 2 will have 4 players (3 byes + 1 match winner)
 *
 * @param matches - All bracket matches
 * @param participants - Shuffled participant list
 * @param byeCount - Number of byes needed
 */
function assignPlayersToFirstRound(
  matches: Match[],
  participants: MatchPlayer[],
  byeCount: number
): void {
  // Separate first round matches (roundIndex = 0)
  const firstRoundMatches = matches.filter((m) => m.roundIndex === 0);

  let participantIndex = 0;

  // First, fill matches with players who will compete (2 players per match)
  // Number of actual first-round matches = (total participants - byes) / 2
  const actualMatches = (participants.length - byeCount) / 2;

  for (let i = 0; i < actualMatches; i++) {
    const match = firstRoundMatches[i];
    match.players[0] = participants[participantIndex++];
    match.players[1] = participants[participantIndex++];
    match.status = 'READY';
  }

  // Then, place bye players directly in Round 2 (skip first round matches)
  // This creates a cleaner bracket without "walkover" matches
  for (let i = actualMatches; i < firstRoundMatches.length && participantIndex < participants.length; i++) {
    const byePlayer = participants[participantIndex++];
    const firstRoundMatch = firstRoundMatches[i];

    // Place bye player directly in their Round 2 match
    if (firstRoundMatch.nextMatchId) {
      const nextMatch = matches.find((m) => m.id === firstRoundMatch.nextMatchId);
      if (nextMatch) {
        nextMatch.players[firstRoundMatch.nextMatchSlot] = byePlayer;
        // Check if next match is now ready (both players assigned)
        if (nextMatch.players[0] && nextMatch.players[1]) {
          nextMatch.status = 'READY';
        }
      }
    }
  }
}

/**
 * Helper to calculate tournament statistics
 * Useful for displaying info to users before generating bracket
 *
 * @example
 * calculateTournamentStats(74)
 * // Returns:
 * // {
 * //   bracketSize: 128,
 * //   byeCount: 54,
 * //   firstRoundMatches: 10,
 * //   totalRounds: 7,
 * //   totalMatches: 127
 * // }
 */
export function calculateTournamentStats(participantCount: number) {
  if (participantCount < 2) {
    throw new Error('Tournament requires at least 2 participants');
  }

  const bracketSize = Math.pow(2, Math.ceil(Math.log2(participantCount)));
  const byeCount = bracketSize - participantCount;
  const firstRoundMatches = (participantCount - byeCount) / 2;
  const totalRounds = Math.log2(bracketSize);
  const totalMatches = bracketSize - 1; // Total matches in single-elimination

  return {
    bracketSize,
    byeCount,
    firstRoundMatches,
    totalRounds,
    totalMatches,
  };
}
