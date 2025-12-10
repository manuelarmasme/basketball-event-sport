import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CONSTANTS } from '@/lib/config/constant';
import { getAdminAuth } from '../_lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { uid, email } = await request.json();

    // Validate required fields
    if (!uid || !email) {
      return NextResponse.json(
        { error: 'UID y email son requeridos' },
        { status: 400 }
      );
    }

    // Check if user already exists in USERS collection (already accepted invitation)
    const userDocRef = doc(db, CONSTANTS.FIREBASE_COLLECTIONS.USERS, uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return NextResponse.json({
        hasAccess: true,
        role: userData.role,
        message: 'Usuario existente con acceso válido',
      });
    }

    // Check if user has a pending invitation
    const invitationsRef = collection(db, CONSTANTS.FIREBASE_COLLECTIONS.INVITATIONS);
    const inviteQuery = query(
      invitationsRef,
      where('email', '==', email),
      where('status', '==', 'pending')
    );
    const inviteSnapshot = await getDocs(inviteQuery);

    if (!inviteSnapshot.empty) {
      // User has a valid pending invitation
      const invitation = inviteSnapshot.docs[0].data();

      // Check if invitation is expired
      const expiresAt = invitation.expiresAt.toDate();
      if (expiresAt < new Date()) {
        // Delete the Firebase Auth user since invitation expired
        const adminAuth = getAdminAuth();
        await adminAuth.deleteUser(uid);

        return NextResponse.json(
          {
            hasAccess: false,
            error: 'La invitación ha expirado. Contacta al administrador para una nueva invitación.'
          },
          { status: 403 }
        );
      }

      return NextResponse.json({
        hasAccess: true,
        hasPendingInvitation: true,
        message: 'Usuario tiene invitación pendiente',
      });
    }

    // No user record and no pending invitation - unauthorized access
    // Delete the Firebase Auth user
    const adminAuth = getAdminAuth();
    await adminAuth.deleteUser(uid);

    return NextResponse.json(
      {
        hasAccess: false,
        error: 'No tienes una invitación para acceder a esta aplicación. Contacta al administrador.'
      },
      { status: 403 }
    );

  } catch (error) {
    console.error('Verify user access error:', error);
    return NextResponse.json(
      { error: 'Error al verificar acceso de usuario' },
      { status: 500 }
    );
  }
}
