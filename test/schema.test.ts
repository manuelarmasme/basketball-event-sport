/**
 * Schema Validation Tests
 * Ensures mock data adheres to TypeScript interfaces
 */

import { describe, it, expect } from 'vitest';
import {
  mockEvent,
  mockEventInProgress,
  mockEventFinished,
  mockParticipants,
  mockMatches,
  mockFullBracket,
  createMockParticipant,
  createMockEvent,
  createMockMatch,
} from '@/lib/mocks';
import type { Event, Participant, Match, TournamentStatus, MatchStatus } from '@/lib/types/tournament';

describe('Tournament Type Schema Tests', () => {
  describe('Event Schema', () => {
    it('should validate mockEvent structure', () => {
      expect(mockEvent).toBeDefined();
      expect(mockEvent.id).toBeTypeOf('string');
      expect(mockEvent.name).toBeTypeOf('string');
      expect(mockEvent.date).toBeTypeOf('string');
      expect(mockEvent.status).toBe('REGISTRATION');
      expect(mockEvent.config).toBeDefined();
      expect(mockEvent.config.maxParticipants).toBeTypeOf('number');
      expect(mockEvent.event_winner).toBeNull();
    });

    it('should validate mockEventInProgress structure', () => {
      expect(mockEventInProgress.status).toBe('IN_PROGRESS');
      expect(mockEventInProgress.event_winner).toBeNull();
    });

    it('should validate mockEventFinished structure', () => {
      expect(mockEventFinished.status).toBe('FINISHED');
      expect(mockEventFinished.event_winner).toBeDefined();
      expect(mockEventFinished.event_winner?.id).toBe('prt_001');
      expect(mockEventFinished.event_winner?.name).toBe('Carlos Rodríguez');
      expect(mockEventFinished.event_winner?.score).toBe(21);
    });

    it('should validate event date is ISO string', () => {
      const date = new Date(mockEvent.date);
      expect(date.toISOString()).toBe(mockEvent.date);
    });

    it('should validate TournamentStatus type', () => {
      const validStatuses: TournamentStatus[] = ['REGISTRATION', 'LOCKED', 'IN_PROGRESS', 'FINISHED'];
      validStatuses.forEach(status => {
        const event = createMockEvent({ status });
        expect(event.status).toBe(status);
      });
    });
  });

  describe('Participant Schema', () => {
    it('should validate mockParticipants array', () => {
      expect(mockParticipants).toBeInstanceOf(Array);
      expect(mockParticipants.length).toBe(6);
    });

    it('should validate each participant has required fields', () => {
      mockParticipants.forEach((participant: Participant) => {
        expect(participant.id).toBeTypeOf('string');
        expect(participant.name).toBeTypeOf('string');
        expect(participant.email).toBeTypeOf('string');
        expect(participant.phone).toBeTypeOf('string');
        expect(participant.age).toBeTypeOf('number');
      });
    });

    it('should validate participant email format', () => {
      mockParticipants.forEach((participant: Participant) => {
        expect(participant.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });

    it('should validate participant age is positive', () => {
      mockParticipants.forEach((participant: Participant) => {
        expect(participant.age).toBeGreaterThan(0);
      });
    });

    it('should create participant with factory function', () => {
      const participant = createMockParticipant({ name: 'Test Player', age: 30 });
      expect(participant.name).toBe('Test Player');
      expect(participant.age).toBe(30);
      expect(participant.email).toBe('mock@example.com');
    });
  });

  describe('Match Schema', () => {
    it('should validate mockMatches array', () => {
      expect(mockMatches).toBeInstanceOf(Array);
      expect(mockMatches.length).toBe(3);
    });

    it('should validate match structure', () => {
      mockMatches.forEach((match: Match) => {
        expect(match.id).toBeTypeOf('string');
        expect(match.roundIndex).toBeTypeOf('number');
        expect(match.roundName).toBeTypeOf('string');
        expect(match.status).toMatch(/^(WAITING|READY|COMPLETED)$/);
        expect(match.players).toBeInstanceOf(Array);
        expect(match.players).toHaveLength(2);
      });
    });

    it('should validate MatchStatus type', () => {
      const validStatuses: MatchStatus[] = ['WAITING', 'READY', 'COMPLETED'];
      const matches = mockMatches.map(m => m.status);
      matches.forEach(status => {
        expect(validStatuses).toContain(status);
      });
    });

    it('should validate nextMatchSlot is 0 or 1', () => {
      mockMatches.forEach((match: Match) => {
        expect([0, 1]).toContain(match.nextMatchSlot);
      });
    });

    it('should validate completed match has winnerId', () => {
      const completedMatch = mockMatches.find(m => m.status === 'COMPLETED');
      expect(completedMatch).toBeDefined();
      if (completedMatch) {
        expect(completedMatch.winnerId).toBeTypeOf('string');
      }
    });

    it('should validate waiting/ready matches have null winnerId', () => {
      const nonCompletedMatches = mockMatches.filter(m => m.status !== 'COMPLETED');
      nonCompletedMatches.forEach((match: Match) => {
        expect(match.winnerId).toBeNull();
      });
    });

    it('should validate final match has null nextMatchId', () => {
      const finalMatch = mockMatches.find(m => m.roundName === 'Final');
      expect(finalMatch).toBeDefined();
      if (finalMatch) {
        expect(finalMatch.nextMatchId).toBeNull();
      }
    });

    it('should validate player scores are optional', () => {
      const matchWithScores = mockMatches.find(
        m => m.players[0]?.score !== undefined && m.players[1]?.score !== undefined
      );
      expect(matchWithScores).toBeDefined();
      if (matchWithScores && matchWithScores.players[0] && matchWithScores.players[1]) {
        expect(matchWithScores.players[0].score).toBeTypeOf('number');
        expect(matchWithScores.players[1].score).toBeTypeOf('number');
      }
    });
  });

  describe('Full Bracket Schema', () => {
    it('should validate mockFullBracket structure', () => {
      expect(mockFullBracket).toBeInstanceOf(Array);
      expect(mockFullBracket.length).toBe(7); // 4 QF + 2 SF + 1 Final
    });

    it('should validate bracket progression', () => {
      const quarterFinals = mockFullBracket.filter(m => m.roundName === 'Quarter Finals');
      const semiFinals = mockFullBracket.filter(m => m.roundName === 'Semi Finals');
      const finals = mockFullBracket.filter(m => m.roundName === 'Final');

      expect(quarterFinals).toHaveLength(4);
      expect(semiFinals).toHaveLength(2);
      expect(finals).toHaveLength(1);
    });

    it('should validate round indices are sequential', () => {
      const roundIndices = [...new Set(mockFullBracket.map(m => m.roundIndex))].sort();
      expect(roundIndices).toEqual([0, 1, 2]);
    });
  });

  describe('Factory Functions', () => {
    it('should create event with factory', () => {
      const event = createMockEvent({ name: 'Test Tournament' });
      expect(event.name).toBe('Test Tournament');
      expect(event.status).toBe('REGISTRATION');
    });

    it('should create match with factory', () => {
      const match = createMockMatch({ roundName: 'Test Round', status: 'READY' });
      expect(match.roundName).toBe('Test Round');
      expect(match.status).toBe('READY');
      expect(match.players).toEqual([null, null]);
    });

    it('should generate unique IDs with factory functions', () => {
      const event1 = createMockEvent();
      const event2 = createMockEvent();
      expect(event1.id).not.toBe(event2.id);
    });
  });

  describe('Type Guards', () => {
    it('should validate match players array length', () => {
      mockMatches.forEach((match: Match) => {
        expect(match.players.length).toBe(2);
      });
    });

    it('should validate players can be null', () => {
      const waitingMatch = mockMatches.find(m => m.status === 'WAITING');
      expect(waitingMatch).toBeDefined();
      if (waitingMatch) {
        const hasNullPlayer = waitingMatch.players.some(p => p === null);
        expect(hasNullPlayer).toBe(true);
      }
    });
  });
});
