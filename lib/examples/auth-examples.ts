/**
 * Example usage of authentication utilities
 *
 * This file demonstrates how to use the auth hooks and utilities
 * in different scenarios throughout your application.
 */

// ============================================
// Example 1: Basic Authentication Check
// ============================================

/**
 * Simple component that shows user info when logged in
 */
/*
'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';

export function UserProfile() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return (
      <div>
        <p>No has iniciado sesión</p>
        <a href="/login">Iniciar sesión</a>
      </div>
    );
  }

  return (
    <div>
      <h2>Bienvenido, {user.displayName || user.email}</h2>
      <img src={user.photoURL || '/default-avatar.png'} alt="Avatar" />
      <Button onClick={signOut}>Cerrar sesión</Button>
    </div>
  );
}
*/

// ============================================
// Example 2: Protected Page Component
// ============================================

/**
 * Page that requires authentication
 * Automatically redirects to login if not authenticated
 */
/*
'use client';

import { useRequireAuth } from '@/lib/hooks/useAuth';
import { Loading } from '@/components/ui/loading';

export default function DashboardPage() {
  const { user, loading } = useRequireAuth();

  if (loading) {
    return <Loading />;
  }

  // User is guaranteed to be authenticated here
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Hola {user?.displayName}</p>
    </div>
  );
}
*/

// ============================================
// Example 3: Role-Based Access Control
// ============================================

/**
 * Component that checks user role from custom claims
 */
/*
'use client';

import { useUserClaims } from '@/lib/hooks/useAuth';
import { Loading } from '@/components/ui/loading';

export function AdminPanel() {
  const { claims, loading } = useUserClaims();

  if (loading) {
    return <Loading />;
  }

  // Check if user has admin role
  if (claims?.role !== 'admin') {
    return <div>No tienes permisos de administrador</div>;
  }

  return (
    <div>
      <h2>Panel de Administrador</h2>
      <p>Rol: {claims.role as string}</p>
    </div>
  );
}
*/

// ============================================
// Example 4: Navbar with Auth State
// ============================================

/**
 * Navigation bar that changes based on auth state
 */
/*
'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import Link from 'next/link';

export function Navbar() {
  const { user, loading, signOut, isAuthenticated } = useAuth();

  return (
    <nav className="flex items-center justify-between p-4">
      <Link href="/">
        <h1>Mi App</h1>
      </Link>

      <div className="flex items-center gap-4">
        {loading ? (
          <div>Cargando...</div>
        ) : isAuthenticated ? (
          <>
            <Avatar src={user?.photoURL} alt={user?.displayName || 'User'} />
            <span>{user?.displayName}</span>
            <Button onClick={signOut} variant="outline">
              Cerrar sesión
            </Button>
          </>
        ) : (
          <Link href="/login">
            <Button>Iniciar sesión</Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
*/

// ============================================
// Example 5: Using Auth Utils
// ============================================

/**
 * Server action or client function using auth utilities
 */
/*
import { auth } from '@/lib/firebase';
import { getUserData, hasCustomClaim, formatUserDisplayName } from '@/lib/utils/auth';

async function checkUserPermissions() {
  const user = auth.currentUser;

  if (!user) {
    console.log('No user logged in');
    return;
  }

  // Get serializable user data
  const userData = getUserData(user);
  console.log('User data:', userData);

  // Check if user is admin
  const isAdmin = await hasCustomClaim(user, 'role', 'admin');
  console.log('Is admin:', isAdmin);

  // Get formatted display name
  const displayName = formatUserDisplayName(user);
  console.log('Display name:', displayName);
}
*/

// ============================================
// Example 6: Conditional Rendering Based on Auth
// ============================================

/**
 * Component that shows different content for authenticated users
 */
/*
'use client';

import { useAuth } from '@/lib/hooks/useAuth';

export function ConditionalContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      {user ? (
        <>
          <h2>Contenido para usuarios autenticados</h2>
          <p>Hola {user.displayName}</p>
        </>
      ) : (
        <>
          <h2>Contenido público</h2>
          <p>Inicia sesión para ver más</p>
        </>
      )}
    </div>
  );
}
*/

// ============================================
// Example 7: Protected API Route Handler
// ============================================

/**
 * API route that requires authentication
 */
/*
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/app/api/_lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const auth = getAdminAuth();

    // Verify the token
    const decodedToken = await auth.verifyIdToken(token);
    const uid = decodedToken.uid;

    // Check user role
    if (decodedToken.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    // Proceed with protected logic
    return NextResponse.json({ message: 'Success', uid });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}
*/

export {};
