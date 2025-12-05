# 🧪 Test Suite Documentation

## Overview
This project has **35 automated tests** organized in a single `test/` folder to validate data structures, type safety, and Firebase integration.

## Test Structure
```
test/
├── schema.test.ts      # Validates TypeScript interfaces and mock data
└── firebase.test.ts    # Validates Firestore data converters
```

---

## 📋 schema.test.ts (25 tests)

### Purpose
**Ensures that all mock data strictly adheres to the TypeScript interfaces** defined in `types/tournament.ts`. This is critical because:

1. **Early Detection**: Catches data structure mismatches before they reach production
2. **Documentation**: Tests serve as living examples of valid data structures
3. **Refactoring Safety**: If you change an interface, tests immediately show what breaks
4. **UI Development**: Guarantees mock data used in development matches production data

### Test Groups

#### 1. Event Schema (6 tests)
**What it validates:**
- Event has all required fields (`id`, `name`, `date`, `status`, `config`, `currentParticipants`)
- Date is a valid ISO 8601 string
- Status is one of the valid `TournamentStatus` values
- `config.maxParticipants` is a number
- Both `REGISTRATION` and `IN_PROGRESS` events work correctly

**Why it matters:**
If someone changes the `Event` interface (e.g., adds a new required field), these tests fail immediately, prompting updates to mock data.

**Example:**
```typescript
// ✅ This test ensures:
expect(mockEvent.status).toBe('REGISTRATION');
// That mock data matches the type definition:
type TournamentStatus = 'REGISTRATION' | 'LOCKED' | 'IN_PROGRESS' | 'FINISHED';
```

---

#### 2. Participant Schema (5 tests)
**What it validates:**
- All 6 mock participants have correct structure
- Email format is valid (uses regex pattern)
- Age is a positive number
- Factory function creates participants with correct defaults
- Partial overrides work correctly

**Why it matters:**
Ensures registration forms collect all required data and that validation rules (email format, age > 0) are consistent.

**Example:**
```typescript
// ✅ This test catches if someone adds invalid emails to mocks:
expect(participant.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
```

---

#### 3. Match Schema (8 tests)
**What it validates:**
- Match structure (round info, status, players array)
- `players` array always has exactly 2 slots
- `nextMatchSlot` is either 0 or 1 (for bracket progression)
- Completed matches have a `winnerId`
- Waiting/Ready matches have `null` winnerId
- Final match has `null` nextMatchId
- Player scores are optional (only present after match starts)

**Why it matters:**
Tournament brackets are complex. These tests ensure:
- Bracket progression logic is correct
- Match states transition properly (WAITING → READY → COMPLETED)
- Winner advancement to next rounds works

**Example:**
```typescript
// ✅ This test ensures bracket final has no next match:
const finalMatch = mockMatches.find(m => m.roundName === 'Final');
expect(finalMatch.nextMatchId).toBeNull();
```

---

#### 4. Full Bracket Schema (3 tests)
**What it validates:**
- Complete tournament structure (Quarter Finals → Semi Finals → Final)
- Correct number of matches at each round (4 QF, 2 SF, 1 Final)
- Round indices are sequential (0, 1, 2)

**Why it matters:**
Validates that bracket generation logic creates proper tournament structures.

---

#### 5. Factory Functions (3 tests)
**What it validates:**
- `createMockEvent()` generates valid events
- `createMockParticipant()` generates valid participants
- Generated IDs are unique (no collisions)

**Why it matters:**
These factory functions are used throughout your app for:
- Unit testing components
- Storybook stories
- Development seed data
- Integration tests

If factories produce invalid data, tests catch it immediately.

**Example:**
```typescript
// ✅ This test ensures factories create unique IDs:
const event1 = createMockEvent();
const event2 = createMockEvent();
expect(event1.id).not.toBe(event2.id); // Must be different
```

---

## 🔥 firebase.test.ts (10 tests)

### Purpose
**Validates that Firestore Data Converters correctly transform data** between Firestore's native format and your TypeScript types. Critical because:

1. **Firestore uses special types**: Like `Timestamp` which needs conversion
2. **Type Safety at Runtime**: Ensures data from Firestore matches your interfaces
3. **Date Handling**: Prevents timezone/format bugs
4. **Nested Objects**: Validates complex structures survive round-trip conversions

### Test Groups

#### 1. Timestamp Conversion (3 tests)
**What it validates:**
- Firestore `Timestamp` → ISO string conversion works
- Current timestamp (`Timestamp.now()`) converts correctly
- Date accuracy is preserved (no millisecond loss)

**Why it matters:**
Firestore stores dates as `Timestamp` objects, but your app uses ISO strings. These tests ensure:
- Dates display correctly in UI
- Date comparisons work
- No timezone bugs

**Example:**
```typescript
// ✅ This test ensures dates survive conversion:
const originalDate = new Date('2025-07-15T10:00:00.000Z');
const timestamp = Timestamp.fromDate(originalDate);
const converted = timestamp.toDate().toISOString();
expect(converted).toBe('2025-07-15T10:00:00.000Z'); // Exact match
```

---

#### 2. Event Converter (2 tests)
**What it validates:**
- Raw Firestore data with `Timestamp` converts to `Event` type
- String dates pass through without conversion (flexibility)

**Why it matters:**
Simulates what happens when you fetch an event from Firestore. If the converter breaks, events won't load correctly in your UI.

---

#### 3. Participant Converter (1 test)
**What it validates:**
- Firestore document → `Participant` type conversion

**Why it matters:**
Ensures participant list displays correctly when loaded from database.

---

#### 4. Match Converter (2 tests)
**What it validates:**
- Complex match data (nested players array) converts correctly
- Matches with `null` players (waiting state) handle correctly

**Why it matters:**
Match objects are complex (nested arrays, optional fields). These tests ensure:
- Bracket displays correctly
- Player scores show properly
- Empty match slots render correctly

---

#### 5. Data Integrity (2 tests)
**What it validates:**
- Numbers remain numbers (not converted to strings)
- Nested objects preserve structure
- Arrays remain arrays

**Why it matters:**
Type coercion bugs are subtle. These tests catch if converters accidentally stringify numbers or flatten objects.

---

## 🎯 Real-World Benefits

### 1. **Prevents Production Bugs**
```typescript
// ❌ Without tests, this bug reaches production:
const event = {
  // Oops! Forgot 'status' field
  id: '1',
  name: 'Tournament',
  // ... app crashes when accessing event.status
};

// ✅ With tests, caught immediately:
// Error: mockEvent.status is undefined
```

### 2. **Safe Refactoring**
```typescript
// You decide to change Match interface:
interface Match {
  // ... old fields
  courtNumber: number; // New required field
}

// ✅ Tests fail instantly, showing exactly what needs updating:
// - mockMatches need courtNumber
// - createMockMatch() needs default courtNumber
// - 8 tests need updates
```

### 3. **Documentation**
Tests show developers **exactly** what valid data looks like:
```typescript
// New developer asks: "How do I create a completed match?"
// They read the test:
it('should validate completed match has winnerId', () => {
  const completedMatch = mockMatches.find(m => m.status === 'COMPLETED');
  expect(completedMatch.winnerId).toBeTypeOf('string'); // Ah! Need winnerId
});
```

### 4. **Confidence in Changes**
- Change Firebase structure? Tests validate converters still work.
- Update TypeScript types? Tests show which mocks need fixing.
- Add new status? Tests document the new behavior.

---

## 🚀 Running Tests

```bash
# Watch mode (auto-runs on file changes)
pnpm test

# Run once (for CI/CD)
pnpm test:run

# With visual UI
pnpm test:ui

# With coverage report
pnpm test:coverage
```

---

## 📊 Current Status
✅ **35/35 tests passing** (100%)
- 25 schema validation tests
- 10 Firebase converter tests

---

## 🔄 When to Update Tests

### Add new tests when:
1. Adding a new interface to `types/tournament.ts`
2. Adding a new Firestore collection
3. Changing data validation rules
4. Adding new mock data

### Update existing tests when:
1. Modifying interface structure
2. Changing field types (string → number)
3. Adding/removing required fields
4. Updating mock data format

---

## 💡 Key Takeaway

**These tests act as a safety net**: They catch breaking changes before users see them, document your data structures for other developers, and give you confidence to refactor code without fear.

Without these tests, you'd discover data structure bugs manually:
- ❌ "Why is the tournament status undefined?"
- ❌ "Why are dates showing as [object Object]?"
- ❌ "Why does the bracket not advance winners?"

With tests:
- ✅ Immediate feedback when something breaks
- ✅ Clear examples of valid data
- ✅ Confidence to make changes

**Think of tests as insurance for your code** 🛡️
