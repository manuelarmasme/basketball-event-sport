'use client';

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { CONSTANTS } from '../config/constant';
import type { Invitation } from '../types/invitation';

/**
 * Hook to fetch and subscribe to real-time invitation updates
 * Follows the same pattern as useEvents hook
 */
export function useInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Query invitations ordered by creation date (newest first)
    const q = query(
      collection(db, CONSTANTS.FIREBASE_COLLECTIONS.INVITATIONS),
      orderBy('invitedAt', 'desc')
    );

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      q,
      { includeMetadataChanges: true },
      (querySnapshot) => {
        const invitationsData: Invitation[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          invitationsData.push({
            id: doc.id,
            email: data.email,
            name: data.name,
            role: data.role,
            token: data.token,
            status: data.status,
            invitedBy: data.invitedBy,
            invitedAt: data.invitedAt,
            expiresAt: data.expiresAt,
            acceptedAt: data.acceptedAt,
          } as Invitation);
        });

        setInvitations(invitationsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching invitations:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return { invitations, loading, error };
}
