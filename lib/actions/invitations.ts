'use server';

import { v4 as uuidv4 } from 'uuid';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { CONSTANTS } from '../config/constant';
import { invitationSchema } from '../schemas/invitation';
import posthog from 'posthog-js';

export async function createInvitation(formData: FormData) {
  try {
    // Extract and validate form data
    const data = {
      email: formData.get('email') as string,
      name: formData.get('name') as string,
      role: formData.get('role') as 'admin' | 'manager',
    };

    const validation = invitationSchema.safeParse(data);
    if (!validation.success) {
      return {
        success: false,
        errors: validation.error.flatten().fieldErrors,
      };
    }

    // Generate UUID token (24 hour expiration)
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // 24 hours from now

    // TODO: Replace 'system' with actual authenticated user ID
    const currentUserId = 'system';

    // Save invitation to Firestore
    const invitationRef = await addDoc(
      collection(db, CONSTANTS.FIREBASE_COLLECTIONS.INVITATIONS),
      {
        email: validation.data.email,
        name: validation.data.name,
        role: validation.data.role,
        token,
        status: 'pending',
        invitedBy: currentUserId,
        invitedAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(expiresAt),
      }
    );

    // Send invitation email via API route
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const invitationLink = `${appUrl}/accept-invitation?token=${token}`;

    const emailResponse = await fetch(`${appUrl}/api/send-invitation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: validation.data.email,
        name: validation.data.name,
        invitationLink,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(errorData.error || 'Failed to send invitation email');
    }

    return {
      success: true,
      invitationId: invitationRef.id,
    };
  } catch (error) {
    console.error('Create invitation error:', error);

    // Track error with PostHog
    posthog.captureException(error, {
      context: 'createInvitation',
    });

    return {
      success: false,
      error: 'Error al enviar la invitación. Por favor intenta de nuevo.',
    };
  }
}
