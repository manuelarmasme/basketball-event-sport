# Reskata Event Sport 🏀

A modern tournament management system built with Next.js 16, React 19, and Firebase. Manage basketball tournaments with real-time updates, participant registration, and single-elimination bracket generation.

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Architecture & Best Practices](#️-architecture--best-practices)
- [Key Features Deep Dive](#-key-features-deep-dive)
- [Firebase Collections Structure](#-firebase-collections-structure)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Development Workflow](#️-development-workflow)
- [Contributing](#-contributing)
- [Known Issues & Roadmap](#-known-issues--limitations)
- [Support & License](#-license)

## 🚀 Features

### Tournament Management
- **Event Creation**: Create and manage multiple basketball tournaments with date, participants limit, and Google Sheets integration
- **Event Lifecycle**: Four states - Registration, Locked, In Progress, and Finished
- **CRUD Operations**: Full create, read, update, and delete capabilities for events
- **Real-time Status Updates**: Live synchronization across all clients using Firebase Firestore

### Participant Management
- **Google Sheets Integration**: Import pre-registered participants directly from Google Forms responses
- **Dual Registration System**: Separate views for "Pre-inscritos" (imported) and "Inscritos" (enrolled)
- **Dynamic Management**: Add, remove, and manage participants during registration phase
- **Maximum Capacity**: Configurable participant limits per tournament

### Tournament Bracket System
- **Single-Elimination Algorithm**: Automatically generate tournament brackets with optimal seeding
- **Smart Bye Placement**: Players with byes advance directly to Round 2 (no walkover matches)
- **Fisher-Yates Shuffle**: Random participant distribution for fair matchups
- **Power-of-2 Brackets**: Support for any participant count (2-128+)
- **18 Unit Tests**: Comprehensive test coverage for bracket generation logic

### Match Management
- **Round-by-Round View**: Organized bracket visualization from Round 1 to Final
- **Score Tracking**: Record scores for both players in each match
- **Winner Declaration**: Select match winner with automatic progression to next round
- **Disqualification Support**: Handle player DQs with visual indicators
- **Real-time Updates**: Instant UI updates via Firestore subscriptions

### User Management & Security
- **Invitation System**: Admin-only user invitation via email
- **Role-Based Access**: Admin and Manager roles with Firebase custom claims
- **Email Invitations**: Automated email sending via Resend API
- **24-Hour Token Expiry**: Secure time-limited invitation links
- **Google Authentication**: Secure OAuth login with Firebase Auth
- **Access Control**: Protected routes requiring authentication

### Analytics & Monitoring
- **PostHog Integration**: Product analytics and error tracking
- **Exception Handling**: Comprehensive error logging and user feedback
- **User Event Tracking**: Monitor user actions and system usage

### UI/UX
- **Responsive Design**: Mobile-first UI with desktop enhancements
- **Real-time Updates**: Live data synchronization using Firebase Firestore
- **Loading States**: Spinners, skeletons, and progress indicators
- **Toast Notifications**: User-friendly feedback with Sonner
- **Modern Design**: Shadcn/UI components with Tailwind CSS 4
- **Type Safety**: Full TypeScript implementation with strict typing

## 🛠️ Tech Stack

### Core
- **Next.js 16.0.7** - React framework with App Router
- **React 19.2.0** - Latest React with server components
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling

### Backend & Data
- **Firebase 12.6.0** - Authentication, Firestore database, and real-time updates
- **Zod 4.1.13** - Runtime type validation and schema definition

### UI Components
- **Shadcn/UI** - Radix UI primitives with Tailwind styling
- **Lucide React** - Modern icon library
- **Sonner** - Toast notifications
- **React Day Picker** - Date selection

### Developer Tools
- **Vitest** - Fast unit testing framework
- **PostHog** - Product analytics and error tracking
- **ESLint 9** - Code linting with Next.js config

## 📦 Getting Started

### Prerequisites
- **Node.js 18+** (18.17.0 or higher recommended)
- **pnpm** (recommended) or npm/yarn
- **Firebase Account** with Firestore and Authentication enabled
- **Google Cloud Account** for Sheets API
- **Resend Account** for email sending (optional for development)

### Quick Start (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/manuelarmasme/basketball-event-sport.git
cd basketball-event-sport

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

# 4. Run development server
pnpm dev

# 5. Open browser
open http://localhost:3000
```

### Full Installation

```bash
# Clone the repository
git clone https://github.com/manuelarmasme/basketball-event-sport.git
cd basketball-event-sport

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration (see Environment Variables section)
```

### Environment Variables

Create a `.env.local` file based on `.env.example`:

```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Admin SDK (Service Account JSON)
# Get from: Firebase Console > Project Settings > Service Accounts > Generate New Private Key
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...",...}'

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key-here
NEXT_PUBLIC_POSTHOG_HOST=your-posthog-host-here

# Google Sheets API (for participant import)
GOOGLE_SHEETS_API_KEY=your-google-sheets-api-key-here

# Resend API (for email invitations)
RESEND_API_KEY=your-resend-api-key-here

# Application URL (for email links)
NEXT_PUBLIC_APP_URL=your-app-url-here
```

### Development

```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run linter
pnpm lint

# Build for production
pnpm build

# Start production server
pnpm start
```

## 📁 Project Structure

```
reskata-event-sport/
├── app/                                    # Next.js App Router
│   ├── (root)/                            # Home page route group
│   │   ├── page.tsx                       # Events list page
│   │   └── components/
│   │       └── events/                    # Event management components
│   │           ├── CreateEventForm.tsx    # Create new tournament
│   │           ├── EditEventDialog.tsx    # Edit tournament details
│   │           ├── DeleteEventDialog.tsx  # Delete tournament
│   │           ├── EventsList.tsx         # Display all events
│   │           └── EventActions.tsx       # Event action buttons
│   ├── [tournament]/                      # Dynamic tournament routes
│   │   ├── page.tsx                       # Tournament detail page
│   │   ├── matches/                       # Bracket visualization
│   │   │   ├── page.tsx                   # Matches page
│   │   │   └── components/
│   │   │       ├── TournamentBracket.tsx  # Bracket display
│   │   │       └── MatchCard.tsx          # Individual match card
│   │   └── components/
│   │       └── tournament-detail/
│   │           ├── container.tsx          # Main tournament container
│   │           ├── header.tsx             # Tournament header
│   │           ├── ListParticipants.tsx   # Participant list view
│   │           ├── ParticipantsCard.tsx   # Participant card
│   │           ├── InscriptionButton.tsx  # Add participant
│   │           ├── CreateInscriptionDialog.tsx  # Manual enrollment
│   │           ├── RemoveInscriptionDialog.tsx  # Remove participant
│   │           ├── StartTournamentButton.tsx    # Start tournament
│   │           ├── ResetTournamentButton.tsx    # Reset tournament
│   │           ├── FilterInput.tsx        # Search participants
│   │           └── CreatingMatchesLoader.tsx    # Loading state
│   ├── login/
│   │   └── page.tsx                       # Google OAuth login
│   ├── accept-invitation/
│   │   └── page.tsx                       # Accept user invitation
│   ├── users/
│   │   ├── page.tsx                       # User management page
│   │   └── components/
│   │       ├── InviteUserDialog.tsx       # Send invitations
│   │       └── InvitationsList.tsx        # List pending invitations
│   ├── api/                               # API routes
│   │   ├── send-invitation/
│   │   │   └── route.ts                   # Send email invitation
│   │   ├── set-user-role/
│   │   │   └── route.ts                   # Set Firebase custom claims
│   │   ├── verify-user-access/
│   │   │   └── route.ts                   # Verify user has access
│   │   └── _lib/
│   │       └── firebase-admin.ts          # Firebase Admin SDK
│   └── assets/
│       └── icons/
│           └── gmail.tsx                  # Google icon component
├── components/
│   ├── auth/
│   │   └── AuthLayout.tsx                 # Protected route wrapper
│   └── ui/                                # Shadcn/UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── calendar.tsx
│       ├── select.tsx
│       ├── badge.tsx
│       ├── table.tsx
│       ├── empty-state.tsx
│       ├── loading.tsx
│       ├── spinner.tsx
│       └── sonner.tsx                     # Toast notifications
├── lib/
│   ├── actions/                           # Server actions
│   │   ├── sheets.ts                      # Google Sheets participant import
│   │   ├── tournament.ts                  # Tournament bracket generation
│   │   └── invitations.ts                 # User invitation logic
│   ├── hooks/                             # Custom React hooks
│   │   ├── useEvents.ts                   # Event & match data hooks
│   │   ├── useAuth.ts                     # Authentication hook
│   │   └── useInvitations.ts              # Invitations data hook
│   ├── schemas/                           # Zod validation schemas
│   │   ├── events.ts                      # Event validation
│   │   ├── player.ts                      # Player validation
│   │   └── invitation.ts                  # Invitation validation
│   ├── types/                             # TypeScript type definitions
│   │   ├── tournament.ts                  # Tournament, Match, Player types
│   │   └── invitation.ts                  # Invitation types
│   ├── utils/                             # Utility functions
│   │   ├── tournament.ts                  # Bracket generation algorithm
│   │   ├── dates.ts                       # Date formatting utilities
│   │   ├── auth.ts                        # Auth helper functions
│   │   └── [other utilities]
│   ├── config/
│   │   └── constant.ts                    # App constants & env vars
│   └── firebase.ts                        # Firebase client initialization
├── test/                                  # Vitest unit tests
│   └── lib/
│       ├── schemas/
│       │   └── invitation.test.ts         # Invitation schema tests
│       └── utils/
│           ├── tournament.test.ts         # Bracket generation tests
│           ├── dates.test.ts              # Date utility tests
│           ├── invitation.test.ts         # Invitation tests
│           └── invitations-helpers.test.ts
├── public/                                # Static assets
├── components.json                        # Shadcn/UI configuration
├── next.config.ts                         # Next.js configuration
├── tailwind.config.ts                     # Tailwind CSS configuration
├── tsconfig.json                          # TypeScript configuration
├── vitest.config.ts                       # Vitest test configuration
├── eslint.config.mjs                      # ESLint configuration
└── package.json                           # Dependencies & scripts
```

## 🏗️ Architecture & Best Practices

### Application Architecture

**Layer Structure:**
```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (React Server/Client Components)      │
├─────────────────────────────────────────┤
│         Business Logic Layer            │
│    (Server Actions, Custom Hooks)       │
├─────────────────────────────────────────┤
│         Data Access Layer               │
│  (Firebase SDK, API Routes)            │
├─────────────────────────────────────────┤
│         External Services               │
│  (Firebase, Google Sheets, Resend)     │
└─────────────────────────────────────────┘
```

### Component Architecture
- **Server Components by Default**: Leverage React Server Components for better performance
- **Client Components When Needed**: Use `"use client"` only for interactivity (forms, dialogs, real-time updates)
- **Composition Over Props Drilling**: Pass React nodes as props for flexible component APIs
- **Conditional Rendering**: Status-based UI rendering for better UX
- **Co-located Components**: Feature components live in same directory as parent route

### State Management
- **Firebase Real-time Subscriptions**: Use `onSnapshot` for live data updates
- **Custom React Hooks**: Encapsulate data fetching logic
  - `useEvents()` - List all tournaments
  - `useEvent(id)` - Get single tournament
  - `useMatches(id)` - Get tournament matches
  - `useParticipants(id)` - Get tournament participants
  - `useAuth()` - Authentication state
  - `useInvitations()` - User invitations
- **Local State**: `useState` for UI state, `useTransition` for async operations
- **No Global State Library**: Firebase subscriptions + React hooks provide sufficient state management

### Data Layer
- **Firebase Firestore**: NoSQL database with real-time capabilities
- **Modular SDK**: Use Firebase v9+ modular imports for tree-shaking
- **Type Safety**: Strict TypeScript types with `UpdateData<DocumentData>`
- **Array Normalization**: Handle Firestore array serialization edge cases
- **Batch Operations**: Use `writeBatch()` for atomic multi-document updates (max 500 operations)
- **Persistent Cache**: Local cache with multi-tab support

### API Routes

**Three main API endpoints:**

1. **`POST /api/send-invitation`** - Send email invitation
   - Input: `{ email, name, invitationLink }`
   - Service: Resend API
   - Auth: Admin only (checked client-side before call)

2. **`POST /api/set-user-role`** - Set Firebase custom claims
   - Input: `{ uid, email, role, token }`
   - Service: Firebase Admin SDK
   - Validates invitation token and sets user role

3. **`POST /api/verify-user-access`** - Verify user has invitation
   - Input: `{ uid, email }`
   - Service: Firebase Admin SDK
   - Returns: `{ hasAccess: boolean }`
   - Deletes user if no valid invitation found

### Server Actions

**Tournament Actions** (`lib/actions/tournament.ts`):
- `generateAndSaveTournamentBracket()` - Create tournament matches
- Handles batch writes and status transitions
- Automatic rollback on failure

**Google Sheets Actions** (`lib/actions/sheets.ts`):
- `fetchParticipants()` - Import from Google Sheets
- Server-side caching (5 minutes)
- Validates and filters data

**Invitation Actions** (`lib/actions/invitations.ts`):
- `createInvitation()` - Create and send invitation
- `sendEmail()` - Wrapper for Resend API
- Token generation with 24-hour expiry

### Type Safety
- **Strict TypeScript**: Enable strict mode for maximum type safety
- **Zod Schemas**: Runtime validation for external data (Google Sheets, forms, API inputs)
- **Interface Segregation**: Small, focused interfaces over large union types
- **No `any` Types**: Explicit types for all variables and function parameters
- **Type Guards**: `isMatchReady()`, `isMatchCompleted()` for runtime type narrowing

### Testing Strategy
- **Vitest**: Fast, modern test runner with ESM support
- **Unit Tests**: Algorithm testing (bracket generation, match assignments)
- **Test Coverage**: Focus on business logic and complex algorithms
- **18 Tests Passing**: Core tournament generation logic fully tested
- **Test Files**:
  - `tournament.test.ts` - Bracket generation algorithm
  - `dates.test.ts` - Date formatting utilities
  - `invitation.test.ts` - Invitation validation
  - `invitations-helpers.test.ts` - Helper functions

### Performance Optimizations
- **Server Components**: Reduce client-side JavaScript bundle
- **Dynamic Imports**: Code splitting for routes
- **Optimistic UI Updates**: Immediate feedback with `useTransition`
- **Firebase Caching**: Persistent local cache reduces reads
- **Next.js Image**: Automatic image optimization
- **Route-level Loading**: Suspense boundaries with `loading.tsx`
- **Server Actions**: Reduce client-side code by moving logic to server

### Code Quality
- **ESLint 9**: Enforce code standards with Next.js config
- **TypeScript 5**: Latest TypeScript features
- **Consistent Naming**: 
  - camelCase for variables and functions
  - PascalCase for components and types
  - UPPER_CASE for constants
- **File Organization**: Feature-based structure with co-located components
- **Error Boundaries**: Graceful error handling with try-catch and toast notifications
- **PostHog Monitoring**: Track exceptions and user events

### Security Best Practices
- **Environment Variables**: Never commit `.env.local` to git
- **Firebase Security Rules**: Enforce authentication and role-based access
- **Custom Claims**: Server-side role verification with Firebase Admin SDK
- **Input Validation**: Zod schemas validate all external data
- **Token Expiry**: Invitation tokens expire after 24 hours
- **HTTPS Only**: All API calls require HTTPS in production
- **Protected Routes**: `AuthLayout` wrapper enforces authentication

## 🔥 Key Features Deep Dive

### Tournament Bracket Generation Algorithm

The bracket generation is powered by a sophisticated single-elimination algorithm:

**Core Logic:**
```typescript
// lib/utils/tournament.ts
generateTournamentBracket(participants: MatchPlayer[]): Match[]
```

**Features:**
- **Power-of-2 Brackets**: Automatically calculates next power of 2 (4, 8, 16, 32, 64, 128)
- **Bye Handling**: Players with byes advance directly to Round 2 without playing a "walkover" match
- **Fisher-Yates Shuffle**: Random seeding for fair matchup distribution
- **Match Linking**: Each match knows its `nextMatchId` and `nextMatchSlot` (0 or 1)
- **Round Naming**: Automatic generation of "Round of 16", "Quarter Finals", "Semi Finals", "Final"
- **Batch Writes**: Saves all matches to Firestore atomically (up to 500 operations)

**Tournament Lifecycle:**
1. **Registration Phase** → Participants can enroll
2. **Locked Phase** → Bracket generation in progress (prevents changes)
3. **In Progress Phase** → Tournament running, matches being played
4. **Finished Phase** → Tournament completed with winner

**Testing:**
- 18 comprehensive unit tests covering all scenarios
- Tests for 2, 3, 4, 8, 16, 31, 32, 63, 64, 127, 128 participants
- Edge case validation

### Match Management System

**Match States:**
- `WAITING` - Waiting for previous round winners
- `READY` - Both players assigned, ready to play
- `COMPLETED` - Match finished with winner

**Workflow:**
1. Player 1 and Player 2 enter scores
2. Manager selects winner
3. Winner automatically advances to `nextMatchId` at `nextMatchSlot`
4. Next match status updates to `READY` when both slots filled
5. Real-time UI updates across all connected clients

**Disqualification:**
- Mark player as disqualified
- Visual indicators (strikethrough, badge)
- Opponent automatically advances

### User Authentication & Authorization

**Role-Based Access Control (RBAC):**
- **Admin**: Full access - manage users, tournaments, matches
- **Manager**: Limited access - manage tournaments and matches (no user management)

**Custom Claims Implementation:**
```typescript
// Set via Firebase Admin SDK
admin.auth().setCustomUserClaims(uid, { role: 'admin' })

// Verify client-side
const token = await user.getIdTokenResult();
const isAdmin = token.claims.role === 'admin';
```

**Invitation Flow:**
1. Admin sends invitation via email (Resend API)
2. User receives email with unique token (24-hour expiry)
3. User clicks link → Google OAuth login
4. API verifies token and sets custom claims
5. User gains access based on assigned role

**Protected Routes:**
- All routes wrapped in `<AuthLayout>` component
- Redirects to `/login` if not authenticated
- Checks custom claims for role-based features

### Google Sheets Integration

**Import Process:**
```typescript
// lib/actions/sheets.ts
fetchParticipants(googleSheetUrl: string): Promise<PreIncriptionPlayer[]>
```

**Features:**
- Extracts Sheet ID from Google Sheets URL
- Fetches data from "Respuestas de formulario 1" sheet, column B
- Caches results for 5 minutes (`next: { revalidate: 300 }`)
- Filters empty rows and trims whitespace
- Alphabetically sorts participants

**Expected Format:**
- Google Form responses sheet
- Column B contains participant names
- Starts from row 2 (row 1 is header)

### Real-time Data Synchronization

**Firestore Subscriptions:**
```typescript
// lib/hooks/useEvents.ts
onSnapshot(collection(db, 'events'), (snapshot) => {
  // Automatic UI updates
});
```

**Benefits:**
- Zero polling - server pushes updates
- Multiple clients stay synchronized
- Optimistic UI updates with `useTransition`
- Persistent local cache for offline support

### UI/UX Patterns

**Loading States:**
- Full-page loaders during navigation
- Component-level spinners for actions
- Skeleton screens for data fetching
- Progress indicators for tournament creation

**Error Handling:**
- Try-catch blocks with user-friendly messages
- Toast notifications (Sonner)
- PostHog exception tracking
- Rollback on failure (tournament status)

**Responsive Design:**
- Mobile-first approach
- Tailwind CSS 4 breakpoints
- Touch-optimized buttons and dialogs
- Adaptive layouts for small screens

**Accessibility:**
- Semantic HTML elements
- ARIA labels for screen readers
- Keyboard navigation support
- Focus management in dialogs

## 🚢 Deployment

### Vercel (Recommended)

This project is optimized for Vercel deployment with Next.js 16.

**Steps:**
```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

**Environment Variables:**
In Vercel Dashboard > Project Settings > Environment Variables, add all variables from `.env.example`:

- Firebase configuration (8 variables)
- Google Sheets API key
- Resend API key
- PostHog keys
- Application URL

**Important Notes:**
- Set `NEXT_PUBLIC_APP_URL` to your Vercel domain
- Firebase rewrites for OAuth are configured in `next.config.ts`
- PostHog proxy configured for better tracking

### Alternative Deployment Platforms

**Requirements:**
- Node.js 18+ runtime
- Support for Next.js 16 App Router
- Environment variables configuration
- HTTPS (required for Firebase Auth)

**Compatible Platforms:**
- Vercel (recommended)
- Netlify
- Railway
- Render
- AWS Amplify
- Self-hosted with Docker

### Firebase Setup

#### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. Register your web app to get configuration values

#### 2. Enable Firebase Services
- **Authentication**: Enable Google Sign-In provider
- **Firestore Database**: Create database in production mode
- **Service Account**: Generate private key for Admin SDK
  - Go to Project Settings > Service Accounts
  - Click "Generate New Private Key"
  - Save JSON file securely (needed for `FIREBASE_SERVICE_ACCOUNT_JSON`)

#### 3. Firestore Security Rules
Copy the security rules from the "Firebase Security Rules" section above

#### 4. Firestore Collections
Create these collections (they'll be auto-created on first use):
- `events` - Main tournaments
- `events/{eventId}/participants` - Enrolled participants
- `events/{eventId}/matches` - Tournament brackets
- `invitations` - User invitations

#### 5. Set Custom Claims (Initial Admin)
Use Firebase Admin SDK to set your first admin:
```bash
# In Firebase Console > Authentication > Users
# Copy your User UID, then run:
firebase functions:shell

# Set admin role
admin.auth().setCustomUserClaims('YOUR_USER_UID', { role: 'admin' })
```

### Google Sheets API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google Sheets API
3. Create credentials (API Key)
4. Add API key to `.env.local`

**Google Sheets Format:**
- Sheet name: "Respuestas de formulario 1"
- Column B: Participant names (starting from row 2)

### Resend API Setup (Email Invitations)

1. Sign up at [resend.com](https://resend.com)
2. Verify your sending domain
3. Generate API key
4. Add to `.env.local`

### PostHog Setup (Optional)

1. Sign up at [posthog.com](https://posthog.com)
2. Create a project
3. Copy project key and host
4. Add to `.env.local`

## 📊 Firebase Collections Structure

```typescript
// Collection: events (main tournaments)
{
  id: string;
  name: string;
  date: Timestamp;
  status: 'registration' | 'locked' | 'in_progress' | 'finished';
  config: {
    maxParticipants: number;
  };
  event_winner: MatchPlayer | null;
  googleSheetUrl: string | null;
  createdAt: Timestamp;
  createdBy: string;         // User ID
  updatedAt: Timestamp | null;
  updatedBy: string | null;  // User ID
}

// Subcollection: events/{eventId}/participants
{
  id: string;
  name: string;
  createdAt: Timestamp;
  createdBy: string;         // User ID
  updatedAt: Timestamp | null;
  updatedBy: string | null;  // User ID
}

// Subcollection: events/{eventId}/matches (generated brackets)
{
  id: string;                // Format: "match_r{roundIndex}_m{matchInRound}"
  roundIndex: number;        // 0-based round number
  roundName: string;         // "Round of 16", "Quarter Finals", "Semi Finals", "Final"
  nextMatchId: string | null; // null for final match
  nextMatchSlot: 0 | 1;      // Slot in next match (0 = top, 1 = bottom)
  winnerId: string | null;   // null until match completed
  status: 'WAITING' | 'READY' | 'COMPLETED';
  players: [MatchPlayer | null, MatchPlayer | null];  // Exactly 2 slots
}

// MatchPlayer (embedded in matches)
{
  id: string;
  name: string;
  score?: number;
  disqualified?: boolean;
  createdAt: Timestamp;
  createdBy: string;         // User ID
  updatedAt: Timestamp | null;
  updatedBy: string | null;  // User ID
}

// Collection: invitations (user management)
{
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager';
  token: string;             // UUID v4
  status: 'pending' | 'accepted';
  invitedBy: string;         // User ID
  invitedAt: Timestamp;
  expiresAt: Timestamp;      // 24 hours from invitedAt
}
```

### Firebase Security Rules

Ensure proper security rules are configured:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             request.auth.token.role == 'admin';
    }
    
    function isManager() {
      return isAuthenticated() && 
             (request.auth.token.role == 'manager' || 
              request.auth.token.role == 'admin');
    }
    
    // Events collection
    match /events/{eventId} {
      allow read: if isAuthenticated();
      allow create: if isManager();
      allow update, delete: if isManager();
      
      // Participants subcollection
      match /participants/{participantId} {
        allow read: if isAuthenticated();
        allow write: if isManager();
      }
      
      // Matches subcollection
      match /matches/{matchId} {
        allow read: if isAuthenticated();
        allow write: if isManager();
      }
    }
    
    // Invitations collection
    match /invitations/{invitationId} {
      allow read: if isAdmin();
      allow create: if isAdmin();
      allow delete: if isAdmin();
    }
  }
}
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:ui

# Run tests once
pnpm test:run

# Generate coverage report
pnpm test:coverage
```

## 🛠️ Development Workflow

### Branch Strategy
- `main` - Production branch
- `staging` - Staging/testing branch
- `feature/*` - Feature branches

### Git Workflow
1. Create feature branch from `staging`
2. Make changes and test locally
3. Run tests: `pnpm test`
4. Run linter: `pnpm lint`
5. Commit with descriptive message
6. Push and create Pull Request to `staging`
7. After testing, merge to `main`

### Code Standards
- **TypeScript**: Strict mode enabled, no `any` types
- **Components**: Server Components by default, client only when needed
- **Naming**: 
  - camelCase for variables and functions
  - PascalCase for components and types
  - UPPER_CASE for constants
- **File Organization**: Feature-based with co-located components
- **Comments**: Document complex logic and public APIs

### Testing Guidelines
- Write unit tests for utilities and algorithms
- Test coverage for business logic
- Run `pnpm test` before committing
- Use Vitest UI for debugging: `pnpm test:ui`

### Performance Best Practices
- Use Server Components for static content
- Minimize client-side JavaScript
- Leverage Firebase caching
- Optimize images with Next.js Image component
- Use `loading.tsx` for route-level loading states

## 🤝 Contributing

This is a private project for Reskata. For internal contributors:

1. Clone the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following code standards
4. Write/update tests as needed
5. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request to `staging` branch

### Commit Message Format
Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## 🐛 Known Issues & Limitations

- **Participant Limit**: Google Sheets import limited to 1000 rows
- **Match Batch Size**: Maximum 127 matches (128 participants) per tournament due to Firestore batch limit
- **Email Delivery**: Resend API free tier has sending limits
- **Offline Support**: Limited offline functionality (requires internet for real-time updates)

## 🔧 Troubleshooting

### Common Issues

**Firebase Authentication Error: "Permission denied"**
- Check Firebase Security Rules are properly configured
- Verify user has custom claims set (`role: 'admin'` or `role: 'manager'`)
- Ensure user is authenticated before accessing protected routes

**Google Sheets Import Not Working**
- Verify `GOOGLE_SHEETS_API_KEY` is set correctly
- Check Google Sheets URL format is correct
- Ensure sheet name is "Respuestas de formulario 1"
- Verify column B contains participant names

**Email Invitations Not Sending**
- Check `RESEND_API_KEY` is valid
- Verify sender domain is verified in Resend dashboard
- Check API rate limits haven't been exceeded
- Look for errors in server logs

**Tournament Bracket Not Generating**
- Ensure at least 2 participants are enrolled
- Check tournament status is "registration"
- Verify no matches already exist (use reset if needed)
- Check browser console for errors

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Rebuild
pnpm build
```

**Type Errors**
```bash
# Regenerate TypeScript types
pnpm tsc --noEmit

# Check for ESLint errors
pnpm lint
```

### Development Tips

- Use `pnpm test:ui` for interactive test debugging
- Check PostHog dashboard for production errors
- Use Firebase Emulator Suite for local testing (optional)
- Enable verbose logging in next.config.ts for debugging
- Use React DevTools for component debugging

## 🗺️ Roadmap

- [ ] Double-elimination tournament support
- [ ] Round-robin tournament format
- [ ] PDF export for tournament brackets
- [ ] WhatsApp notifications for match updates
- [ ] Multi-language support (i18n)
- [ ] Tournament templates
- [ ] Advanced statistics and analytics
- [ ] Mobile app (React Native)

## 📞 Support & Contact

For questions or support, contact the development team:
- **Project**: Reskata Event Sport
- **Client**: Reskata
- **Repository**: [basketball-event-sport](https://github.com/manuelarmasme/basketball-event-sport)

## 📝 License

This project is proprietary and confidential. All rights reserved by Reskata.

## 🙏 Acknowledgments

- **Next.js Team** - Amazing React framework with App Router
- **Shadcn** - Beautiful and accessible UI components
- **Vercel** - Seamless hosting and deployment
- **Firebase** - Real-time database and authentication
- **Radix UI** - Unstyled, accessible component primitives
- **Tailwind CSS** - Utility-first CSS framework
- **PostHog** - Product analytics and monitoring

## 📚 Additional Resources

### Documentation
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Shadcn/UI Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

### Related Projects
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Resend Email API](https://resend.com/docs)
- [PostHog Analytics](https://posthog.com/docs)
- [Vitest Testing Framework](https://vitest.dev)

---

**Built with ❤️ by the Reskata Team**  
**Powered by Next.js 16 and React 19**
