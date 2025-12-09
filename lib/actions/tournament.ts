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
  getDoc,
  UpdateData,
  DocumentData,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase';
import { CONSTANTS } from '../config/constant';
import { Match, MatchPlayer } from '../types/tournament';
import { generateTournamentBracket } from '../utils/tournament';
import posthog from 'posthog-js';

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
 * @param scores - Optional scores for both players
 * @param disqualifiedPlayerId - Optional ID of disqualified player
 *
 * @example
 * await updateMatchWinner('tournament_123', 'match_r0_m0', 'player_456', 'user_789', { player1Score: 21, player2Score: 18 });
 */
export async function updateMatchWinner(
  tournamentId: string,
  matchId: string,
  winnerId: string,
  userId: string,
  scores?: { player1Score?: number; player2Score?: number },
  disqualifiedPlayerId?: string
): Promise<void> {
  // First, read the current match to get nextMatchId and player info
  const currentMatchRef = doc(
    db,
    CONSTANTS.FIREBASE_COLLECTIONS.TOURNAMENTS,
    tournamentId,
    CONSTANTS.FIREBASE_COLLECTIONS.MATCHES,
    matchId
  );

  const currentMatchSnap = await getDoc(currentMatchRef);
  if (!currentMatchSnap.exists()) {
    throw new Error('Match not found');
  }

  const currentMatch = currentMatchSnap.data() as Match;
  const winner = currentMatch.players.find((p) => p?.id === winnerId);

  if (!winner) {
    throw new Error('Winner not found in match players');
  }

  const batch = writeBatch(db);

  // 1. Update current match with winner and scores
  // Create a copy of players array with updated scores
  const updatedPlayers = [...currentMatch.players];

  // Update scores if provided
  if (scores) {
    if (scores.player1Score !== undefined && updatedPlayers[0]) {
      updatedPlayers[0] = { ...updatedPlayers[0], score: scores.player1Score };
    }
    if (scores.player2Score !== undefined && updatedPlayers[1]) {
      updatedPlayers[1] = { ...updatedPlayers[1], score: scores.player2Score };
    }
  }

  // Mark disqualified player if provided
  if (disqualifiedPlayerId) {
    if (updatedPlayers[0]?.id === disqualifiedPlayerId) {
      updatedPlayers[0] = { ...updatedPlayers[0], disqualified: true };
    }
    if (updatedPlayers[1]?.id === disqualifiedPlayerId) {
      updatedPlayers[1] = { ...updatedPlayers[1], disqualified: true };
    }
  }

  const updateData: UpdateData<DocumentData> = {
    winnerId,
    status: 'COMPLETED',
    updatedAt: Timestamp.now(),
    updatedBy: userId,
    players: updatedPlayers, // Update entire array instead of using dot notation
  };

  batch.update(currentMatchRef, updateData);

  // 2. Propagate winner to next match if it exists
  if (currentMatch.nextMatchId) {
    const nextMatchRef = doc(
      db,
      CONSTANTS.FIREBASE_COLLECTIONS.TOURNAMENTS,
      tournamentId,
      CONSTANTS.FIREBASE_COLLECTIONS.MATCHES,
      currentMatch.nextMatchId
    );

    // Update the appropriate player slot in the next match
    // Read next match first to avoid overwriting the entire players array
    const nextMatchSnap = await getDoc(nextMatchRef);
    if (!nextMatchSnap.exists()) {
      throw new Error('Next match not found');
    }

    const nextMatch = nextMatchSnap.data() as Match;

    // Normalize players array (Firestore might not preserve array structure)
    const currentPlayers = Array.isArray(nextMatch.players)
      ? nextMatch.players
      : [nextMatch.players?.[0] || null, nextMatch.players?.[1] || null];

    const updatedNextPlayers = [...currentPlayers];
    updatedNextPlayers[currentMatch.nextMatchSlot] = winner;

    const nextMatchUpdate: UpdateData<DocumentData> = {
      players: updatedNextPlayers, // Update entire array
      updatedAt: Timestamp.now(),
      updatedBy: userId,
    };

    // If both player slots are now filled, mark as READY
    if (updatedNextPlayers[0] && updatedNextPlayers[1]) {
      nextMatchUpdate.status = 'READY';
    }

    batch.update(nextMatchRef, nextMatchUpdate);
  }

  await batch.commit();
}

// create a function which erase all matches for a tournament and create again the matches given the participants
export async function resetAndGenerateTournamentBracket(
  tournamentId: string,
  participants: MatchPlayer[],
  userId: string
): Promise<void> {
  if (participants.length < 2) {
    throw new Error('Tournament requires at least 2 participants to start');
  }

  try {
    // 1. Delete existing matches
    const matchesRef = collection(
      db,
      CONSTANTS.FIREBASE_COLLECTIONS.TOURNAMENTS,
      tournamentId,
      CONSTANTS.FIREBASE_COLLECTIONS.MATCHES
    );

    const matchesSnap = await getDocs(matchesRef);
    const deleteBatch = writeBatch(db);

    matchesSnap.forEach((doc) => {
      deleteBatch.delete(doc.ref);
    });

    await deleteBatch.commit();

    // 2. update tournament status to 'registration'
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



  } catch (error) {
    posthog.captureException(error, {
      error_location: 'resetAndGenerateTournamentBracket',
      tournament_id: tournamentId,
    });
    throw new Error('Error resetting and generating tournament bracket');
  }
}