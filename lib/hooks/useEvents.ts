'use client'

import { useEffect, useState } from 'react';
import { addDoc, collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';
import { SportEvent } from '../types/tournament';

export function useEvents() {
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'tournaments'));
    
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
      const docRef = await addDoc(collection(db, 'tournaments'), partialEventData);
      return docRef.id;
    } catch (err) {
      console.error('Error creating event:', err);
      return null;
    }
  }


  return { createEvent };
}