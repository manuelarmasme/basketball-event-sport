import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '../_lib/firebase-admin';
import { collection, query, where, getDocs, updateDoc, doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CONSTANTS } from '@/lib/config/constant';

export async function POST(request: NextRequest) {
  try {
    const { uid, token } = await request.json();

    // Validate required fields
    if (!uid || !token) {
      return NextResponse.json(
        { error: 'UID y token son requeridos' },
        { status: 400 }
      );
    }

    // Verify invitation token in Firestore
    const invitationsRef = collection(db, CONSTANTS.FIREBASE_COLLECTIONS.INVITATIONS);
    const q = query(
      invitationsRef,
      where('token', '==', token),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Invitación inválida o ya utilizada' },
        { status: 400 }
      );
    }

    const invitationDoc = snapshot.docs[0];
    const invitation = invitationDoc.data();

    // Check expiration (24 hours)
    const expiresAt = invitation.expiresAt.toDate();
    if (expiresAt < new Date()) {
      await updateDoc(invitationDoc.ref, { status: 'expired' });
      return NextResponse.json(
        { error: 'La invitación ha expirado' },
        { status: 400 }
      );
    }

    // Set custom claims using Firebase Admin SDK
    const adminAuth = getAdminAuth();
    await adminAuth.setCustomUserClaims(uid, {
      role: invitation.role,
    });

    // Update invitation status
    await updateDoc(invitationDoc.ref, {
      status: 'accepted',
      acceptedAt: Timestamp.now(),
    });

    // Create user profile in Firestore
    console.log('Creating user profile for UID:', uid);

    await setDoc(doc(db, CONSTANTS.FIREBASE_COLLECTIONS.USERS, uid), {
      email: invitation.email,
      name: invitation.name,
      role: invitation.role,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({
      success: true,
      role: invitation.role,
    });
  } catch (error) {
    console.error('Set user role error:', error);
    return NextResponse.json(
      { error: 'Error al configurar rol de usuario' },
      { status: 500 }
    );
  }
}
