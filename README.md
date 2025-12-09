# Reskata Event Sport 🏀

A modern tournament management system built with Next.js 16, React 19, and Firebase. Manage basketball tournaments with real-time updates, participant registration, and single-elimination bracket generation.

## 🚀 Features

- **Tournament Management**: Create and manage basketball tournaments with real-time status updates
- **Participant Registration**: Import participants from Google Sheets and manage inscriptions
- **Automatic Bracket Generation**: Single-elimination tournament brackets with intelligent bye placement
- **Match Management**: Track scores, declare winners, and handle disqualifications
- **Real-time Updates**: Live data synchronization using Firebase Firestore
- **Responsive Design**: Mobile-first UI with modern design patterns
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
- Node.js 18+ 
- pnpm (recommended) or npm/yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: PostHog analytics
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=your_posthog_host
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
├── app/                          # Next.js App Router
│   ├── (root)/                   # Home page route group
│   │   ├── page.tsx             # Events list page
│   │   └── components/          # Event-related components
│   └── [tournament]/            # Dynamic tournament routes
│       ├── page.tsx             # Tournament detail page
│       ├── matches/             # Matches visualization
│       └── components/          # Tournament components
├── components/
│   └── ui/                      # Reusable UI components (Shadcn/UI)
├── lib/
│   ├── actions/                 # Server actions
│   │   ├── sheets.ts           # Google Sheets integration
│   │   └── tournament.ts       # Tournament operations
│   ├── hooks/                   # Custom React hooks
│   │   └── useEvents.ts        # Event & tournament data hooks
│   ├── schemas/                 # Zod validation schemas
│   ├── types/                   # TypeScript type definitions
│   ├── utils/                   # Utility functions
│   │   ├── tournament.ts       # Bracket generation algorithm
│   │   └── dates.ts            # Date formatting utilities
│   ├── config/                  # App configuration
│   └── firebase.ts             # Firebase initialization
├── test/                        # Test files
│   └── lib/utils/
│       └── tournament.test.ts  # Tournament algorithm tests
└── public/                      # Static assets
```

## 🏗️ Architecture & Best Practices

### Component Architecture
- **Server Components by Default**: Leverage React Server Components for better performance
- **Client Components When Needed**: Use `"use client"` only for interactivity (forms, dialogs, real-time updates)
- **Composition Over Props Drilling**: Pass React nodes as props for flexible component APIs
- **Conditional Rendering**: Status-based UI rendering for better UX

### State Management
- **Firebase Real-time Subscriptions**: Use `onSnapshot` for live data updates
- **React Hooks**: Custom hooks for data fetching (`useEvents`, `useParticipants`, `useTournamentBracket`)
- **Local State**: `useState` for UI state, `useTransition` for async operations
- **No Global State Library**: Firebase subscriptions + React hooks provide sufficient state management

### Data Layer
- **Firebase Firestore**: NoSQL database with real-time capabilities
- **Modular SDK**: Use Firebase v9+ modular imports for tree-shaking
- **Type Safety**: Strict TypeScript types with `UpdateData<DocumentData>`
- **Array Normalization**: Handle Firestore array serialization edge cases
- **Batch Operations**: Use `writeBatch()` for atomic multi-document updates

### Type Safety
- **Strict TypeScript**: Enable strict mode for maximum type safety
- **Zod Schemas**: Runtime validation for external data (Google Sheets, forms)
- **Interface Segregation**: Small, focused interfaces over large union types
- **No `any` Types**: Explicit types for all variables and function parameters

### Testing Strategy
- **Vitest**: Fast, modern test runner with ESM support
- **Unit Tests**: Algorithm testing (bracket generation, match assignments)
- **Test Coverage**: Focus on business logic and complex algorithms
- **18 Tests Passing**: Core tournament generation logic fully tested

### Performance Optimizations
- **Server Components**: Reduce client-side JavaScript bundle
- **Dynamic Imports**: Code splitting for routes
- **Optimistic UI Updates**: Immediate feedback with `useTransition`
- **Responsive Images**: Next.js Image component with optimization

### Code Quality
- **ESLint**: Enforce code standards with Next.js config
- **Prettier**: (Recommended) Code formatting
- **Consistent Naming**: camelCase for variables, PascalCase for components
- **File Organization**: Feature-based structure with co-located components

## 🔥 Key Features Implementation

### Tournament Bracket Generation
- **Algorithm**: Single-elimination with power-of-2 brackets
- **Bye Handling**: Players skip directly to Round 2 (no walkover matches)
- **Randomization**: Fisher-Yates shuffle for fair participant distribution
- **Tested**: 18 test cases covering all scenarios

### Match Management
- **Two-Step Updates**: Score entry → Winner selection for better UX
- **Disqualification Support**: Track and display DQ status with visual indicators
- **Real-time Sync**: Automatic UI updates via Firestore subscriptions
- **Winner Progression**: Automatic advancement to next round

### Participant Management
- **Google Sheets Integration**: Import pre-registered participants
- **Dual Lists**: Pre-inscritos vs Inscritos with filtered views
- **Status-based Actions**: Conditional rendering based on tournament status
- **Remove/Add**: Flexible participant management during registration

### UI/UX Patterns
- **Loading States**: Spinners, skeletons, and full-page loaders
- **Error Handling**: Toast notifications with user-friendly messages
- **Responsive Design**: Mobile-first with desktop enhancements
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation

## 🚢 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel
```

### Environment Variables
Ensure all environment variables are configured in your deployment platform.

### Firebase Setup
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Set up security rules for your collections
4. Add Firebase config to environment variables

## 📊 Firebase Collections Structure

```typescript
// events collection
{
  id: string;
  name: string;
  status: 'registration' | 'locked' | 'in_progress' | 'finished';
  googleSheetUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// matches subcollection (events/{eventId}/matches)
{
  id: string;
  round: number;
  matchNumber: number;
  players: [MatchPlayer | null, MatchPlayer | null];
  winner?: string;
  nextMatchId?: string;
  isCompleted: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// MatchPlayer
{
  id: string;
  name: string;
  score?: number;
  disqualified?: boolean;
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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow existing code style
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages

## 📝 License

This project is proprietary and confidential.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Shadcn for the beautiful UI components
- Vercel for hosting and deployment
- Firebase for real-time database capabilities

---

Built with ❤️ using Next.js 16 and React 19
