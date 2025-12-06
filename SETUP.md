# 🏀 Basketball Tournament App - Firebase Setup Guide

## ✅ Completed Setup

### 1. Firebase Client SDK Installation
Firebase SDK (`v12.6.0`) has been installed and configured with type-safe Firestore helpers.

### 2. Project Structure
```
reskata-event-sport/
├── app/                      # Next.js 16 App Router
├── lib/                      # Core library code
│   ├── firebase.ts          # Firebase configuration & type-safe helpers
│   └── mocks.ts             # Mock data factories for testing/UI dev
├── test/                     # Test suite (35 tests)
│   ├── firebase.test.ts     # Firestore converter tests (10 tests)
│   ├── schema.test.ts       # Schema validation tests (25 tests)
│   └── README.md            # Detailed test documentation
├── types/                    # TypeScript type definitions
│   └── tournament.ts        # Core interfaces & type unions
├── .env.local.example       # Environment variables template
├── vitest.config.ts         # Vitest configuration
└── package.json             # Dependencies & scripts
```

### 3. Environment Configuration

**Required**: Copy `.env.local.example` to `.env.local` and fill in your Firebase credentials:

```bash
cp .env.local.example .env.local
```

Get your credentials from: [Firebase Console](https://console.firebase.google.com/) → Project Settings → General → Your apps

### 4. Type Definitions

#### **TournamentStatus**
```typescript
type TournamentStatus = 'REGISTRATION' | 'LOCKED' | 'IN_PROGRESS' | 'FINISHED';
```

#### **MatchStatus**
```typescript
type MatchStatus = 'WAITING' | 'READY' | 'COMPLETED';
```

#### **Core Interfaces**
- `Event` - Tournament/Event entity
- `Participant` - Player registration
- `Match` - Tournament bracket match
- `MatchPlayer` - Player in a match with score
- `EventConfig` - Tournament configuration

### 5. Firebase Helpers

#### Type-Safe Collection References
```typescript
import { getEventsCollection, getParticipantsCollection, getMatchesCollection } from '@/lib/firebase';

// Get events collection
const eventsRef = getEventsCollection();

// Get participants for specific event
const participantsRef = getParticipantsCollection('event_id');

// Get matches for specific event
const matchesRef = getMatchesCollection('event_id');
```

#### Firestore Data Converters
All collections use Firestore Data Converters that:
- Convert Firestore `Timestamp` → ISO string for `Event.date`
- Automatically handle type casting
- Ensure type safety throughout your app

### 6. Mock Data for Development

```typescript
import { 
  mockEvent, 
  mockParticipants, 
  mockMatches,
  createMockEvent,
  createMockParticipant,
  createMockMatch 
} from '@/lib/mocks';

// Use static mocks
console.log(mockEvent); // Event in REGISTRATION status
console.log(mockParticipants); // Array of 6 participants
console.log(mockMatches); // Semi-finals + Final bracket

// Or create custom mocks
const customEvent = createMockEvent({ 
  name: 'My Tournament',
  status: 'IN_PROGRESS' 
});
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
pnpm test

# Run tests once (CI mode)
pnpm test:run

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

### Test Coverage
- ✅ **35 tests passing**
- ✅ Schema validation tests (25 tests) - Ensures mock data matches TypeScript interfaces
- ✅ Firestore converter tests (10 tests) - Validates Timestamp → ISO string conversions
- ✅ Mock data validation
- ✅ Type guard tests

📖 **See `test/README.md` for detailed explanation of what each test does and why it matters**

## 🚀 Next Steps

### 1. Configure Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Events collection
    match /events/{eventId} {
      allow read: if true;
      allow write: if request.auth != null;
      
      // Participants subcollection
      match /participants/{participantId} {
        allow read: if true;
        allow create: if request.auth != null;
        allow update, delete: if request.auth != null;
      }
      
      // Matches subcollection
      match /matches/{matchId} {
        allow read: if true;
        allow write: if request.auth != null;
      }
    }
  }
}
```

### 2. Create Firestore Indexes
For efficient queries, create these indexes in Firebase Console:

**Events Collection:**
- `status` (Ascending) + `date` (Ascending)

**Matches Collection:**
- `roundIndex` (Ascending) + `status` (Ascending)

### 3. Implement UI Components
Use the mock data to build your UI:
```typescript
'use client';
import { mockEvent, mockParticipants } from '@/lib/mocks';

export function EventCard() {
  return (
    <div>
      <h2>{mockEvent.name}</h2>
      <p>Participants: {mockEvent.currentParticipants}/{mockEvent.config.maxParticipants}</p>
    </div>
  );
}
```

### 4. Add Firebase Authentication (Optional)
```bash
pnpm add firebase-admin
```

## 📝 Usage Examples

### Fetching Events
```typescript
import { getDocs } from 'firebase/firestore';
import { getEventsCollection } from '@/lib/firebase';

async function fetchEvents() {
  const eventsRef = getEventsCollection();
  const snapshot = await getDocs(eventsRef);
  
  const events = snapshot.docs.map(doc => doc.data());
  // events is fully typed as Event[]
  return events;
}
```

### Creating a Participant
```typescript
import { addDoc } from 'firebase/firestore';
import { getParticipantsCollection } from '@/lib/firebase';
import type { Participant } from '@/types/tournament';

async function registerParticipant(eventId: string, data: Omit<Participant, 'id'>) {
  const participantsRef = getParticipantsCollection(eventId);
  const docRef = await addDoc(participantsRef, data);
  return docRef.id;
}
```

### Updating Match Score
```typescript
import { doc, updateDoc } from 'firebase/firestore';
import { getMatchesCollection } from '@/lib/firebase';

async function updateMatchScore(
  eventId: string, 
  matchId: string, 
  player1Score: number, 
  player2Score: number
) {
  const matchesRef = getMatchesCollection(eventId);
  const matchDoc = doc(matchesRef, matchId);
  
  await updateDoc(matchDoc, {
    'players.0.score': player1Score,
    'players.1.score': player2Score,
  });
}
```

## 🔒 Type Safety Features

- ✅ No `any` types used
- ✅ Strict TypeScript interfaces
- ✅ Firestore Data Converters for type safety
- ✅ Type guards for runtime checks
- ✅ Factory functions with type inference

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Vitest Documentation](https://vitest.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🎯 Key Benefits

1. **Type Safety**: Full TypeScript support with no `any` types
2. **Mock Data**: Ready-to-use mock data for rapid UI development
3. **Tested**: 35 passing tests ensuring data integrity
4. **Scalable**: Type-safe collection helpers for maintainable code
5. **Next.js 16**: Using latest Next.js with App Router

---

**Status**: ✅ Setup Complete - Ready for Development
