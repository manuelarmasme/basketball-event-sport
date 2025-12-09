'use client'

import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { Match, MatchPlayer, SportEvent } from '../types/tournament';
import { CONSTANTS } from '../config/constant';
import posthog from 'posthog-js';
import { generateAndSaveTournamentBracket } from '../actions/tournament';
import { calculateTournamentStats } from '../utils/tournament';

export function useEvents() {
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, CONSTANTS.FIREBASE_COLLECTIONS.TOURNAMENTS));

    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (querySnapshot) => {
        const eventsData: SportEvent[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          eventsData.push({
            id: doc.id,
            name: data.name,
            date: data.date,
            status: data.status,
            config: data.config,
            event_winner: data.event_winner,
            googleSheetUrl: data.googleSheetUrl,
            createdAt: data.createdAt,
            createdBy: data.createdBy,
            updatedAt: data.updatedAt,
            updatedBy: data.updatedBy,
          });
        });

        setEvents(eventsData);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => unsubscribe();
  }, []);

  return { events, loading, error };
}

// create a hook to create an event this hook recevied the event data
export function useCreateEvent() {


  async function createEvent(partialEventData: Partial<SportEvent>): Promise<string | null> {
    try {
      // Aquí iría la lógica para crear el evento en Firestore
      // Por ejemplo, usando addDoc de firebase/firestore
      const docRef = await addDoc(collection(db, CONSTANTS.FIREBASE_COLLECTIONS.TOURNAMENTS), partialEventData);
      return docRef.id;
    } catch (err) {
      posthog.captureException(err, {
        'error_location': 'useCreateEvent'
      })
      throw new Error('Error creating event');
    }
  }


  return { createEvent };
}

// create a hook to update an event
export function useUpdateEvent() {
  async function updateEvent(eventId: string, partialEventData: Partial<SportEvent>): Promise<void> {
    try {
      const docRef = doc(db, CONSTANTS.FIREBASE_COLLECTIONS.TOURNAMENTS, eventId);
      await updateDoc(docRef, partialEventData);
    } catch (err) {
      posthog.captureException(err, {
        'error_location': 'useUpdateEvent'
      })
      throw new Error('Error updating event');
    }
  }

  return { updateEvent };
}

// create a hook to delete an event and all its related data
export function useDeleteEvent() {
  async function deleteEvent(eventId: string): Promise<void> {
    try {
      // Get all matches
      const matchesRef = collection(
        db,
        CONSTANTS.FIREBASE_COLLECTIONS.TOURNAMENTS,
        eventId,
        CONSTANTS.FIREBASE_COLLECTIONS.MATCHES
      );
      const matchesSnapshot = await getDocs(matchesRef);

      // Get all participants
      const participantsRef = collection(
        db,
        CONSTANTS.FIREBASE_COLLECTIONS.TOURNAMENTS,
        eventId,
        CONSTANTS.FIREBASE_COLLECTIONS.PARTICIPANTS
      );
      const participantsSnapshot = await getDocs(participantsRef);

      // Firestore batch has a limit of 500 operations
      // We'll need to handle this in chunks if there are more
      const allDocs = [
        ...matchesSnapshot.docs,
        ...participantsSnapshot.docs,
      ];

      const BATCH_SIZE = 500;
      const batches = [];

      for (let i = 0; i < allDocs.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const chunk = allDocs.slice(i, i + BATCH_SIZE);

        chunk.forEach((document) => {
          batch.delete(document.ref);
        });

        batches.push(batch.commit());
      }

      // Execute all batches
      await Promise.all(batches);

      // Finally, delete the event itself in a separate batch
      const finalBatch = writeBatch(db);
      const eventDocRef = doc(db, CONSTANTS.FIREBASE_COLLECTIONS.TOURNAMENTS, eventId);
      finalBatch.delete(eventDocRef);
      await finalBatch.commit();
    } catch (err) {
      posthog.captureException(err, {
        'error_location': 'useDeleteEvent',
        'event_id': eventId
      })
      throw new Error('Error deleting event');
    }
  }

  return { deleteEvent };
}

// Create a similar hook for a single event
export function useEvent(eventId: string) {
  const [event, setEvent] = useState<SportEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, CONSTANTS.FIREBASE_COLLECTIONS.TOURNAMENTS, eventId);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        setEvent({ id: doc.id, ...doc.data() } as SportEvent);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [eventId]);

  return { event, loading };
}

// create a hook to fetch the participants inside of a subcollection called participants that belongs to a tournament use realtime updates
export function useParticipants(tournamentId: string) {
  const [participants, setParticipants] = useState<MatchPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, CONSTANTS.FIREBASE_COLLECTIONS.TOURNAMENTS, tournamentId, CONSTANTS.FIREBASE_COLLECTIONS.PARTICIPANTS));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const participantsData: MatchPlayer[] = [];

      querySnapshot.forEach((doc) => {
        participantsData.push({ id: doc.id, ...doc.data() } as MatchPlayer);
      });

      setParticipants(participantsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tournamentId]);

  return { participants, loading };
}

export function useCreateParticipant() {
  async function createParticipant(partialParticipantData: Partial<MatchPlayer>, tournamentId: string): Promise<string | null> {
    try {
      const docRef = await addDoc(
        collection(
          db,
          CONSTANTS.FIREBASE_COLLECTIONS.TOURNAMENTS,
          tournamentId,
          CONSTANTS.FIREBASE_COLLECTIONS.PARTICIPANTS
        ),
        partialParticipantData
      );

      return docRef.id;
    } catch (err) {

      posthog.captureException(err, {
        'error_location': 'useCreateParticipant',
        'tournament_id': tournamentId
      })

      throw new Error('Error creating participant');
    }
  }

  async function removeParticipant(participantId: string, tournamentId: string): Promise<void> {
    try {
      const docRef = doc(
        db,
        CONSTANTS.FIREBASE_COLLECTIONS.TOURNAMENTS,
        tournamentId,
        CONSTANTS.FIREBASE_COLLECTIONS.PARTICIPANTS,
        participantId
      );
      await deleteDoc(docRef);
    } catch (err) {
      posthog.captureException(err, {
        'error_location': 'useRemoveParticipant',
        'tournament_id': tournamentId,
        'participant_id': participantId
      });
      throw new Error('Error removing participant');
    }
  }

  return { createParticipant, removeParticipant };
}

/**
 * Hook to manage tournament bracket generation
 * Provides function to start tournament and generate bracket
 */
export function useTournamentBracket() {
  const [loading, setLoading] = useState(false);

  /**
   * Generate tournament bracket and start the tournament
   *
   * @param tournamentId - The tournament ID
   * @param participants - Array of enrolled players
   * @param userId - User ID performing the action (for now, use a placeholder)
   * @returns Object with success status and match count
   */
  async function startTournament(
    tournamentId: string,
    participants: MatchPlayer[],
    userId: string = 'system'
  ): Promise<{ success: boolean; matchCount: number }> {
    setLoading(true);

    try {
      const result = await generateAndSaveTournamentBracket(
        tournamentId,
        participants,
        userId
      );

      posthog.capture('tournament_started', {
        tournament_id: tournamentId,
        participant_count: participants.length,
        match_count: result.matchCount,
      });

      return result;
    } catch (err) {
      posthog.captureException(err, {
        error_location: 'useTournamentBracket_startTournament',
        tournament_id: tournamentId,
        participant_count: participants.length,
      });

      throw err;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Get tournament statistics without generating bracket
   * Useful for showing preview before starting tournament
   */
  function getTournamentStats(participantCount: number) {
    try {
      return calculateTournamentStats(participantCount);
    } catch {
      return null;
    }
  }

  return { startTournament, loading, getTournamentStats };
}

/**
 * Hook to fetch matches for a tournament with real-time updates
 */
export function useMatches(tournamentId: string) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(
        db,
        CONSTANTS.FIREBASE_COLLECTIONS.TOURNAMENTS,
        tournamentId,
        CONSTANTS.FIREBASE_COLLECTIONS.MATCHES
      )
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const matchesData: Match[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        // Ensure players array exists and has correct structure
        const players = data.players || [null, null];

        matchesData.push({
          id: doc.id,
          ...data,
          players: [
            players[0] || null,
            players[1] || null
          ] as [MatchPlayer | null, MatchPlayer | null]
        } as Match);
      });

      // Sort by roundIndex and match position
      matchesData.sort((a, b) => {
        if (a.roundIndex !== b.roundIndex) {
          return a.roundIndex - b.roundIndex;
        }
        return a.id.localeCompare(b.id);
      });

      setMatches(matchesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tournamentId]);

  return { matches, loading };
}