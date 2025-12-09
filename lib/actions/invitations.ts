'use server';

import { v4 as uuidv4 } from 'uuid';
import { collection, addDoc, Timestamp, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { CONSTANTS } from '../config/constant';
import { invitationSchema } from '../schemas/invitation';
import posthog from 'posthog-js';
import { Invitation } from '../types/invitation';
import { headers } from 'next/headers';
import { Resend } from 'resend';


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

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: 'Reskata <contacto@reskataofficial.com>',
      to: [email],
      subject: 'Invitación a Reskata Event Sport',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Reskata Event Sport</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 40px 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1f2937; margin-top: 0;">Hola ${name},</h2>
              
              <p style="font-size: 16px; color: #4b5563;">
                Has sido invitado a unirte a <strong>Reskata Event Sport</strong> como parte del equipo de gestión de eventos deportivos.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${invitationLink}" 
                   style="display: inline-block; padding: 14px 32px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                  Aceptar Invitación
                </a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                <strong>Nota:</strong> Este enlace expirará en 24 horas por motivos de seguridad.
              </p>
              
              <p style="font-size: 14px; color: #9ca3af; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                Si no esperabas este correo, puedes ignorarlo de forma segura.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error('Error al enviar email con Resend');
    }

    console.log('Email sent successfully:', data);

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
