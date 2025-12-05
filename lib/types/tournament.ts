/**
 * Tournament App Type Definitions
 * Strict TypeScript interfaces for Firebase collections
 */

import { Timestamp } from "firebase/firestore";

/**
 * Tournament status lifecycle
 * - REGISTRATION: Accepting new participants
 * - LOCKED: Registration closed, bracket generation in progress
 * - IN_PROGRESS: Tournament actively running
 * - FINISHED: Tournament completed
 */
export type TournamentStatus = 'registration' | 'locked' | 'in_progress' | 'finished';

/**
 * Match status lifecycle
 * - WAITING: Match not yet ready (waiting for previous rounds)
 * - READY: Both players assigned and ready to play
 * - COMPLETED: Match finished with a winner
 */
export type MatchStatus = 'WAITING' | 'READY' | 'COMPLETED';

/**
 * Event/Tournament configuration
 */
export interface EventConfig {
  maxParticipants: number;
}

export interface PreIncriptionPlayer {
  name: string;
}

/**
 * Main Event/Tournament entity
 */
export interface SportEvent {
  id: string;
  name: string;
  date: Timestamp; // ISO 8601 string
  status: TournamentStatus;
  config: EventConfig;
  event_winner: MatchPlayer | null;
  googleSheetUrl: string | null;
  createdAt: Timestamp; // ISO 8601 string
  createdBy: string; // User ID of creator
  updatedAt: Timestamp | null; // ISO 8601 string
  updatedBy: string | null; // User ID of last updater
}

/**
 * Player in a match with optional score
 */
export interface MatchPlayer {
  id: string;
  name: string;
  score?: number;
  createdAt: Timestamp; // ISO 8601 string
  createdBy: string; // User ID of creator
  updatedAt: Timestamp | null; // ISO 8601 string
  updatedBy: string | null; // User ID of last updater
}

/**
 * Tournament match in bracket
 */
export interface Match {
  id: string;
  roundIndex: number;
  roundName: string; // e.g., "Round of 16", "Quarter Finals", "Semi Finals", "Final"
  nextMatchId: string | null; // null for final match
  nextMatchSlot: 0 | 1; // 0 = top slot, 1 = bottom slot in next match
  winnerId: string | null; // null until match completed
  status: MatchStatus;
  players: [MatchPlayer | null, MatchPlayer | null]; // Exactly 2 slots
}

/**
 * Type guard to check if a match has both players
 */
export function isMatchReady(match: Match): boolean {
  return match.players[0] !== null && match.players[1] !== null;
}

/**
 * Type guard to check if a match is completed
 */
export function isMatchCompleted(match: Match): match is Match & { winnerId: string } {
  return match.status === 'COMPLETED' && match.winnerId !== null;
}
