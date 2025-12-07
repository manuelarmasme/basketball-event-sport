/**
 * Firebase Tournament Actions
 * Server-side and client-side functions for managing tournament bracket generation
 */

import {
  collection,
  doc,
  writeBatch,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { CONSTANTS } from '../config/constant';
import { Match, MatchPlayer } from '../types/tournament';
import { generateTournamentBracket } from '../utils/tournament';

/**
 * Generate and save tournament bracket to Firestore
 * Handles batch writes for large tournaments (up to 500 operations per batch)
 *
 * @param tournamentId - The tournament ID
 * @param participants - Array of enrolled players
 * @param userId - User ID performing the action
 * @returns Object with success status and match count
 *
 * @throws Error if tournament has less than 2 participants
 * @throws Error if batch write fails
 *
 * @example
 * const result = await generateAndSaveTournamentBracket(
 *   'tournament_123',
 *   participants,
 *   'user_456'
 * );
 * // result: { success: true, matchCount: 127, tournamentId: 'tournament_123' }
 */
export async function generateAndSaveTournamentBracket(
  tournamentId: string,
  participants: MatchPlayer[],
  userId: string
): Promise<{ success: boolean; matchCount: number; tournamentId: string }> {
  if (participants.length < 2) {
    throw new Error('Tournament requires at least 2 participants to start');
  }

  try {
    // 1. Generate bracket structure
    const matches = generateTournamentBracket(participants);

    // 2. Update tournament status to 'locked'
    const tournamentRef = doc(
      db,
      CONSTANTS.FIREBASE_COLLECTIONS.TOURNAMENTS,
      tournamentId
    );

    await updateDoc(tournamentRef, {
      status: 'locked',
      updatedAt: Timestamp.now(),
      updatedBy: userId,
    });

    // 3. Save matches in batches (Firestore limit: 500 operations per batch)
    await saveMatchesInBatches(tournamentId, matches, userId);

    // 4. Update tournament status to 'in_progress'
    await updateDoc(tournamentRef, {
      status: 'in_progress',
      updatedAt: Timestamp.now(),
      updatedBy: userId,
    });

    return {
      success: true,
      matchCount: matches.length,
      tournamentId,
    };
  } catch (error) {
    // Rollback tournament status if bracket generation fails
    const tournamentRef = doc(
      db,
      CONSTANTS.FIREBASE_COLLECTIONS.TOURNAMENTS,
      tournamentId
    );

    await updateDoc(tournamentRef, {
      status: 'registration',
      updatedAt: Timestamp.now(),
      updatedBy: userId,
    });

    throw error;
  }
}

/**
 * Save matches to Firestore in batches
 * Firebase allows maximum 500 operations per batch
 *
 * @param tournamentId - The tournament ID
 * @param matches - Array of matches to save
 * @param userId - User ID performing the action
 */
async function saveMatchesInBatches(
  tournamentId: string,
  matches: Match[],
  userId: string
): Promise<void> {
  const BATCH_SIZE = 500;
  const batches: Promise<void>[] = [];

  for (let i = 0; i < matches.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const matchesChunk = matches.slice(i, i + BATCH_SIZE);

    for (const match of matchesChunk) {
      const matchRef = doc(
        collection(
          db,
          CONSTANTS.FIREBASE_COLLECTIONS.TOURNAMENTS,
          tournamentId,
          CONSTANTS.FIREBASE_COLLECTIONS.MATCHES
        ),
        match.id
      );

      // Add timestamp metadata
      const matchData = {
        ...match,
        createdAt: Timestamp.now(),
        createdBy: userId,
        updatedAt: null,
        updatedBy: null,
      };

      batch.set(matchRef, matchData);
    }

    batches.push(batch.commit());
  }

  // Execute all batches in parallel
  await Promise.all(batches);
}

/**
 * Update match winner and propagate to next match
 *
 * @param tournamentId - The tournament ID
 * @param matchId - The match ID to update
 * @param winnerId - The player ID who won
 * @param userId - User ID performing the action
 *
 * @example
 * await updateMatchWinner('tournament_123', 'match_r0_m0', 'player_456', 'user_789');
 */
export async function updateMatchWinner(
  tournamentId: string,
  matchId: string,
  winnerId: string,
  userId: string
): Promise<void> {
  const batch = writeBatch(db);

  // 1. Update current match
  const currentMatchRef = doc(
    db,
    CONSTANTS.FIREBASE_COLLECTIONS.TOURNAMENTS,
    tournamentId,
    CONSTANTS.FIREBASE_COLLECTIONS.MATCHES,
    matchId
  );

  batch.update(currentMatchRef, {
    winnerId,
    status: 'COMPLETED',
    updatedAt: Timestamp.now(),
    updatedBy: userId,
  });

  // Note: Propagating winner to next match requires reading the current match
  // This will be handled by a separate function or Cloud Function for simplicity

  await batch.commit();
}
