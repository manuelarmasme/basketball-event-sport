# Firebase Authentication Guide

Complete authentication setup for the Basketball Tournament App using Firebase Authentication with Google Sign-In.

## 🔥 Features Implemented

- ✅ **Google Sign-In**: OAuth authentication with Google
- ✅ **Auth State Management**: Real-time authentication state tracking
- ✅ **Custom Claims Support**: Role-based access control (admin, manager)
- ✅ **Protected Routes**: Automatic redirect for unauthenticated users
- ✅ **Type-Safe**: Full TypeScript support with strict typing
- ✅ **Utility Functions**: Helper functions for common auth tasks

## 📁 File Structure

```
app/
├── login/
│   └── page.tsx                    # Login page with Google Sign-In
├── accept-invitation/
│   └── page.tsx                    # Invitation acceptance (already existed)
lib/
├── hooks/
│   └── useAuth.ts                  # Auth hooks (useAuth, useUserClaims, useRequireAuth)
├── utils/
│   └── auth.ts                     # Auth utility functions
├── examples/
│   └── auth-examples.ts            # Usage examples and patterns
└── firebase.ts                     # Firebase initialization (includes auth)
```

## 🚀 Quick Start

### 1. Login Page

Navigate to `/login` to see the Google Sign-In page:

```tsx
// app/login/page.tsx
// Simple, clean UI with Google OAuth
```

### 2. Use Auth State in Components

```tsx
'use client';

import { useAuth } from '@/lib/hooks/useAuth';

export function MyComponent() {
  const { user, loading, signOut, isAuthenticated } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  if (!isAuthenticated) {
    return <a href="/login">Login</a>;
  }

  return (
    <div>
      <p>Welcome, {user?.displayName}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### 3. Protect Routes

```tsx
'use client';

import { useRequireAuth } from '@/lib/hooks/useAuth';

export default function ProtectedPage() {
  const { user, loading } = useRequireAuth();

  if (loading) return <div>Loading...</div>;

  // User is guaranteed to be authenticated here
  return <div>Protected content for {user?.displayName}</div>;
}
```

### 4. Check User Roles

```tsx
'use client';

import { useUserClaims } from '@/lib/hooks/useAuth';

export function AdminPanel() {
  const { claims, loading } = useUserClaims();

  if (loading) return <div>Loading...</div>;

  if (claims?.role !== 'admin') {
    return <div>Access denied</div>;
  }

  return <div>Admin Panel</div>;
}
```

## 📚 API Reference

### Hooks

#### `useAuth()`

Main authentication hook that provides user state and sign out functionality.

**Returns:**
- `user: UserData | null` - Current user data
- `loading: boolean` - Loading state
- `error: Error | null` - Error state
- `signOut: () => Promise<void>` - Sign out function
- `isAuthenticated: boolean` - Quick auth check

**Example:**
```tsx
const { user, loading, signOut, isAuthenticated } = useAuth();
```

#### `useUserClaims()`

Get custom claims from the user's ID token (for role-based access control).

**Returns:**
- `claims: Record<string, unknown> | null` - User's custom claims
- `loading: boolean` - Loading state

**Example:**
```tsx
const { claims, loading } = useUserClaims();
const isAdmin = claims?.role === 'admin';
```

#### `useRequireAuth(redirectTo?)`

Require authentication for a page. Automatically redirects to login if not authenticated.

**Parameters:**
- `redirectTo?: string` - Optional redirect path after login

**Returns:**
- `user: UserData | null` - Current user (guaranteed to exist after loading)
- `loading: boolean` - Loading state

**Example:**
```tsx
const { user, loading } = useRequireAuth('/dashboard');
```

### Utility Functions

#### `getUserData(user)`

Extract serializable user data from Firebase User object.

```tsx
import { auth } from '@/lib/firebase';
import { getUserData } from '@/lib/utils/auth';

const user = auth.currentUser;
const userData = getUserData(user);
// { uid, email, displayName, photoURL, emailVerified }
```

#### `hasCustomClaim(user, key, value)`

Check if user has a specific custom claim.

```tsx
const isAdmin = await hasCustomClaim(user, 'role', 'admin');
```

#### `getUserClaims(user)`

Get all custom claims for a user.

```tsx
const claims = await getUserClaims(user);
console.log(claims.role); // 'admin' | 'manager' | undefined
```

#### `formatUserDisplayName(user)`

Get formatted display name for UI.

```tsx
const displayName = formatUserDisplayName(user);
// Returns: displayName || email username || 'Usuario'
```

#### `isEmailVerified(user)`

Check if user's email is verified.

```tsx
const verified = isEmailVerified(user);
```

## 🔒 Security Best Practices

### 1. Protected API Routes

Always verify the user's token in API routes:

```tsx
// app/api/protected/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/app/api/_lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const auth = getAdminAuth();
    
    // Verify token
    const decodedToken = await auth.verifyIdToken(token);
    
    // Check role if needed
    if (decodedToken.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Proceed with protected logic
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
```

### 2. Client-Side Token Sending

When calling protected APIs from the client:

```tsx
import { auth } from '@/lib/firebase';

async function callProtectedAPI() {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('Not authenticated');
  }

  const token = await user.getIdToken();

  const response = await fetch('/api/protected', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: 'some data' }),
  });

  return response.json();
}
```

### 3. Firestore Security Rules

Update your Firestore security rules to check authentication:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() && 
             request.auth.token.role == 'admin';
    }
    
    // Tournaments collection
    match /tournaments/{tournamentId} {
      allow read: if true;
      allow write: if isAuthenticated();
      
      // Participants
      match /participants/{participantId} {
        allow read: if true;
        allow create: if isAuthenticated();
        allow update, delete: if isAuthenticated();
      }
      
      // Matches
      match /matches/{matchId} {
        allow read: if true;
        allow write: if isAuthenticated();
      }
    }
    
    // Invitations (admin only)
    match /invitations/{invitationId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

## 🎨 UI Components Integration

### Navbar with Auth

```tsx
'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Navbar() {
  const { user, loading, signOut, isAuthenticated } = useAuth();

  return (
    <nav className="flex items-center justify-between p-4 border-b">
      <Link href="/">
        <h1 className="text-xl font-bold">Basketball App</h1>
      </Link>

      <div className="flex items-center gap-4">
        {loading ? (
          <div>Loading...</div>
        ) : isAuthenticated ? (
          <>
            {user?.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-8 h-8 rounded-full"
              />
            )}
            <span>{user?.displayName}</span>
            <Button onClick={signOut} variant="outline" size="sm">
              Sign Out
            </Button>
          </>
        ) : (
          <Link href="/login">
            <Button variant="default" size="sm">
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}
```

### User Menu Dropdown

```tsx
'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/ui/avatar';

export function UserMenu() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar src={user.photoURL} alt={user.displayName || 'User'} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user.displayName}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## 🧪 Testing

To test the authentication flow:

1. **Start dev server**: `pnpm dev`
2. **Navigate to**: `http://localhost:3000/login`
3. **Click "Continuar con Google"**
4. **Sign in with your Google account**
5. **You'll be redirected to the home page**

To test protected routes:

1. **Navigate to a protected page** (one using `useRequireAuth`)
2. **If not logged in**: You'll be redirected to `/login`
3. **After login**: You'll be redirected back to the original page

## 🔗 Related Files

- **Firebase Config**: `lib/firebase.ts`
- **Admin SDK**: `app/api/_lib/firebase-admin.ts`
- **Invitation System**: `app/accept-invitation/page.tsx`
- **Set User Role API**: `app/api/set-user-role/route.ts`
- **Examples**: `lib/examples/auth-examples.ts`

## 📖 Additional Resources

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Next.js Authentication Guide](https://nextjs.org/docs/app/building-your-application/authentication)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)

---

**Status**: ✅ Authentication System Complete
