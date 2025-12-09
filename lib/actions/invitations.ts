'use server';

import { v4 as uuidv4 } from 'uuid';
import { collection, addDoc, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { CONSTANTS } from '../config/constant';
import { invitationSchema } from '../schemas/invitation';
import posthog from 'posthog-js';
import { Invitation } from '../types/invitation';
import { headers } from 'next/headers';


export async function createInvitation(formData: Partial<Invitation>, userId: string) {
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



    // Save invitation to Firestore
    const invitationRef = await addDoc(
      collection(db, CONSTANTS.FIREBASE_COLLECTIONS.INVITATIONS),
      {
        email: validation.data.email,
        name: validation.data.name,
        role: validation.data.role,
        token,
        status: 'pending',
        invitedBy: userId,
        invitedAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(expiresAt),
      }
    );

    console.log('invitationRef',invitationRef);


    await sendEmail(token, validation.data.email, validation.data.name, invitationRef.id);

    // return {
    //   success: true,
    //   invitationId: invitationRef.id,
    // };
  } catch (error) {
    console.error('Create invitation error:', error);

    // Track error with PostHog
    posthog.captureException(error, {
      context: 'createInvitation',
    });

    throw new Error('Error al crear la invitación.');
  }
}

export async function sendEmail(token: string, email: string, name: string, invitationId: string) {
    try {
    const headersList = await headers();
    const host = headersList.get('host');
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const appUrl = `${protocol}://${host}`;

    const invitationLink = `${appUrl}/accept-invitation?token=${token}`;

    console.log('invitationLink', invitationLink);

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

          await removeInvitation(invitationId);

        throw new Error('Error al enviar el correo de invitación.', error as Error);
    }
}

async function removeInvitation(invitationId: string) {
    try {
      await deleteDoc(doc(db, CONSTANTS.FIREBASE_COLLECTIONS.INVITATIONS, invitationId));
  } catch (error) {
    console.error('Remove invitation error:', error);
    posthog.captureException(error, {
      context: 'removeInvitation',
    });
    throw new Error('Error al eliminar la invitación.');
  }
}
