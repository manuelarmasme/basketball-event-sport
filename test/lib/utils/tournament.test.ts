/**
 * Tournament Bracket Generation Tests
 * Tests for single-elimination tournament bracket creation logic
 */

import { describe, it, expect } from 'vitest';
import {
  generateTournamentBracket,
  calculateTournamentStats,
} from '@/lib/utils/tournament';
import { MatchPlayer } from '@/lib/types/tournament';
import { Timestamp } from 'firebase/firestore';

// Helper to create mock participants
function createMockParticipants(count: number): MatchPlayer[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `player_${i + 1}`,
    name: `Player ${i + 1}`,
    createdAt: Timestamp.now(),
    createdBy: 'test_user',
    updatedAt: null,
    updatedBy: null,
  }));
}

describe('calculateTournamentStats', () => {
  it('should calculate stats for 2 participants', () => {
    const stats = calculateTournamentStats(2);
    expect(stats).toEqual({
      bracketSize: 2,
      byeCount: 0,
      firstRoundMatches: 1,
      totalRounds: 1,
      totalMatches: 1,
    });
  });

  it('should calculate stats for 4 participants (perfect power of 2)', () => {
    const stats = calculateTournamentStats(4);
    expect(stats).toEqual({
      bracketSize: 4,
      byeCount: 0,
      firstRoundMatches: 2,
      totalRounds: 2,
      totalMatches: 3,
    });
  });

  it('should calculate stats for 8 participants (perfect power of 2)', () => {
    const stats = calculateTournamentStats(8);
    expect(stats).toEqual({
      bracketSize: 8,
      byeCount: 0,
      firstRoundMatches: 4,
      totalRounds: 3,
      totalMatches: 7,
    });
  });

  it('should calculate stats for 5 participants (needs byes)', () => {
    const stats = calculateTournamentStats(5);
    expect(stats).toEqual({
      bracketSize: 8,
      byeCount: 3,
      firstRoundMatches: 1, // (5 - 3) / 2 = 1
      totalRounds: 3,
      totalMatches: 7,
    });
  });

  it('should calculate stats for 13 participants', () => {
    const stats = calculateTournamentStats(13);
    expect(stats).toEqual({
      bracketSize: 16,
      byeCount: 3,
      firstRoundMatches: 5, // (13 - 3) / 2 = 5
      totalRounds: 4,
      totalMatches: 15,
    });
  });

  it('should calculate stats for 74 participants', () => {
    const stats = calculateTournamentStats(74);
    expect(stats).toEqual({
      bracketSize: 128,
      byeCount: 54,
      firstRoundMatches: 10, // (74 - 54) / 2 = 10
      totalRounds: 7,
      totalMatches: 127,
    });
  });

  it('should throw error for less than 2 participants', () => {
    expect(() => calculateTournamentStats(1)).toThrow(
      'Tournament requires at least 2 participants'
    );
    expect(() => calculateTournamentStats(0)).toThrow(
      'Tournament requires at least 2 participants'
    );
  });
});

describe('generateTournamentBracket', () => {
  it('should throw error for less than 2 participants', () => {
    const participants = createMockParticipants(1);
    expect(() => generateTournamentBracket(participants)).toThrow(
      'Tournament requires at least 2 participants'
    );
  });

  it('should generate bracket for 2 participants', () => {
    const participants = createMockParticipants(2);
    const matches = generateTournamentBracket(participants);

    expect(matches).toHaveLength(1);
    expect(matches[0].roundIndex).toBe(0);
    expect(matches[0].roundName).toBe('Final');
    expect(matches[0].nextMatchId).toBeNull();
    expect(matches[0].status).toBe('READY');
    expect(matches[0].players[0]).not.toBeNull();
    expect(matches[0].players[1]).not.toBeNull();
  });

  it('should generate bracket for 4 participants (perfect power of 2)', () => {
    const participants = createMockParticipants(4);
    const matches = generateTournamentBracket(participants);

    // 4 participants = 3 total matches (2 semi-finals + 1 final)
    expect(matches).toHaveLength(3);

    // Check round distribution
    const round0Matches = matches.filter((m) => m.roundIndex === 0);
    const round1Matches = matches.filter((m) => m.roundIndex === 1);

    expect(round0Matches).toHaveLength(2); // Semi Finals
    expect(round1Matches).toHaveLength(1); // Final

    // All first round matches should be READY (no byes)
    round0Matches.forEach((match) => {
      expect(match.status).toBe('READY');
      expect(match.players[0]).not.toBeNull();
      expect(match.players[1]).not.toBeNull();
    });

    // Final should be WAITING
    expect(round1Matches[0].status).toBe('WAITING');
  });

  it('should generate bracket for 8 participants (perfect power of 2)', () => {
    const participants = createMockParticipants(8);
    const matches = generateTournamentBracket(participants);

    // 8 participants = 7 total matches (4 + 2 + 1)
    expect(matches).toHaveLength(7);

    // Check round names
    const round0Matches = matches.filter((m) => m.roundIndex === 0);
    const round1Matches = matches.filter((m) => m.roundIndex === 1);
    const round2Matches = matches.filter((m) => m.roundIndex === 2);

    expect(round0Matches).toHaveLength(4); // Quarter Finals
    expect(round1Matches).toHaveLength(2); // Semi Finals
    expect(round2Matches).toHaveLength(1); // Final

    expect(round0Matches[0].roundName).toBe('Quarter Finals');
    expect(round1Matches[0].roundName).toBe('Semi Finals');
    expect(round2Matches[0].roundName).toBe('Final');

    // All first round matches should be READY
    round0Matches.forEach((match) => {
      expect(match.status).toBe('READY');
    });
  });

  it('should generate bracket for 5 participants (needs 3 byes)', () => {
    const participants = createMockParticipants(5);
    const matches = generateTournamentBracket(participants);

    // 5 participants in 8-bracket = 7 total matches
    expect(matches).toHaveLength(7);

    // First round: 4 matches
    const round0Matches = matches.filter((m) => m.roundIndex === 0);
    expect(round0Matches).toHaveLength(4);

    // Count READY vs COMPLETED matches in first round
    const readyMatches = round0Matches.filter((m) => m.status === 'READY');
    const completedMatches = round0Matches.filter((m) => m.status === 'COMPLETED');

    // With 5 participants and 3 byes:
    // - 2 players compete in first round (1 READY match)
    // - 3 byes = 3 COMPLETED matches with one player
    expect(readyMatches).toHaveLength(1);
    expect(completedMatches).toHaveLength(3);

    // Completed matches should have a winnerId
    completedMatches.forEach((match) => {
      expect(match.winnerId).not.toBeNull();
      const playerCount = [match.players[0], match.players[1]].filter(
        (p) => p !== null
      ).length;
      expect(playerCount).toBe(1); // Only one player in bye match
    });
  });

  it('should generate bracket for 13 participants', () => {
    const participants = createMockParticipants(13);
    const matches = generateTournamentBracket(participants);

    // 13 participants in 16-bracket = 15 total matches
    expect(matches).toHaveLength(15);

    const round0Matches = matches.filter((m) => m.roundIndex === 0);
    const readyMatches = round0Matches.filter((m) => m.status === 'READY');
    const completedMatches = round0Matches.filter((m) => m.status === 'COMPLETED');

    // 13 participants with 3 byes = 10 play in first round (5 matches)
    expect(readyMatches).toHaveLength(5);
    expect(completedMatches).toHaveLength(3);
  });

  it('should connect matches correctly (nextMatchId)', () => {
    const participants = createMockParticipants(4);
    const matches = generateTournamentBracket(participants);

    const round0Matches = matches.filter((m) => m.roundIndex === 0);
    const finalMatch = matches.find((m) => m.roundIndex === 1);

    // Both semi-finals should point to the final
    round0Matches.forEach((match) => {
      expect(match.nextMatchId).toBe(finalMatch!.id);
      expect([0, 1]).toContain(match.nextMatchSlot);
    });

    // Final should have no next match
    expect(finalMatch!.nextMatchId).toBeNull();
  });

  it('should assign all participants to the bracket', () => {
    const participants = createMockParticipants(10);
    const matches = generateTournamentBracket(participants);

    // Collect all players from all matches
    const allPlayers = matches.flatMap((m) => m.players).filter((p) => p !== null);

    // Count unique player IDs
    const uniquePlayerIds = new Set(allPlayers.map((p) => p!.id));

    // All 10 participants should appear exactly once
    expect(uniquePlayerIds.size).toBe(10);
  });

  it('should handle large tournament (74 participants)', () => {
    const participants = createMockParticipants(74);
    const matches = generateTournamentBracket(participants);

    // 74 participants in 128-bracket = 127 total matches
    expect(matches).toHaveLength(127);

    // Verify all participants are assigned
    const allPlayers = matches.flatMap((m) => m.players).filter((p) => p !== null);
    const uniquePlayerIds = new Set(allPlayers.map((p) => p!.id));
    expect(uniquePlayerIds.size).toBe(74);
  });
});
