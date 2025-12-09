'use server';

import { v4 as uuidv4 } from 'uuid';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { CONSTANTS } from '../config/constant';
import { invitationSchema } from '../schemas/invitation';
import posthog from 'posthog-js';
import { Invitation } from '../types/invitation';


export async function createInvitation(formData: Partial<Invitation>) {
  try {
    // Extract and validate form data
    console.log('formdata', formData);

    const data = {
      email: formData.email as string,
      name: formData.name as string,
      role: formData.role as 'admin' | 'manager',
    };

    const validation = invitationSchema.safeParse(data);
    if (!validation.success) {
        throw new Error('Hubo un error con los datos del formulario.');
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

    console.log('invitationRef',invitationRef);


    await sendEmail(token, validation.data.email, validation.data.name);

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

export async function sendEmail(token: string, email: string, name: string) {
    try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const invitationLink = `${appUrl}/accept-invitation?token=${token}`;

    const emailResponse = await fetch(`${appUrl}/api/send-invitation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        name: name,
        invitationLink,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(errorData.error || 'Failed to send invitation email');
    }

    } catch (error) {
        posthog.captureException(error, {
            context: 'sendEmail',
          });

        throw new Error('Error al enviar el correo de invitación.');
    }
}

