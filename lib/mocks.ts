// /**
//  * Mock Data Factories
//  * Static mock objects for testing and UI development
//  * All mocks strictly adhere to the interfaces in types/tournament.ts
//  */

// import type { SportEvent, Match } from '@/lib/types/tournament';

// /**
//  * Mock Event in REGISTRATION status
//  */
// export const mockEvent: SportEvent = {
//   id: 'evt_001',
//   name: 'Summer Basketball Championship 2025',
//   date: '2025-07-15T10:00:00.000Z',
//   status: 'REGISTRATION',
//   config: {
//     maxParticipants: 16,
//   },
//   event_winner: null,
// };

// /**
//  * Mock Event in IN_PROGRESS status
//  */
// export const mockEventInProgress: Event = {
//   id: 'evt_002',
//   name: 'Winter Basketball Tournament',
//   date: '2025-12-20T14:00:00.000Z',
//   status: 'IN_PROGRESS',
//   config: {
//     maxParticipants: 8,
//   },
//   event_winner: null,
// };

// /**
//  * Mock Event in FINISHED status with winner
//  */
// export const mockEventFinished: Event = {
//   id: 'evt_003',
//   name: 'Spring Championship 2025',
//   date: '2025-03-10T18:00:00.000Z',
//   status: 'FINISHED',
//   config: {
//     maxParticipants: 8,
//   },
//   event_winner: {
//     id: 'prt_001',
//     name: 'Carlos Rodríguez',
//     score: 21,
//   },
// };


// /**
//  * Mock Matches - Tournament Bracket Structure
//  * Semi Finals (2 matches) + Final (1 match)
//  */
// export const mockMatches: Match[] = [
//   // Semi Final 1
//   {
//     id: 'match_semi_1',
//     roundIndex: 0,
//     roundName: 'Semi Finals',
//     nextMatchId: 'match_final',
//     nextMatchSlot: 0, // Winner goes to top slot of final
//     winnerId: 'prt_001',
//     status: 'COMPLETED',
//     players: [
//       {
//         id: 'prt_001',
//         name: 'Carlos Rodríguez',
//         score: 21,
//       },
//       {
//         id: 'prt_002',
//         name: 'María González',
//         score: 18,
//       },
//     ],
//   },
//   // Semi Final 2
//   {
//     id: 'match_semi_2',
//     roundIndex: 0,
//     roundName: 'Semi Finals',
//     nextMatchId: 'match_final',
//     nextMatchSlot: 1, // Winner goes to bottom slot of final
//     winnerId: null,
//     status: 'READY',
//     players: [
//       {
//         id: 'prt_003',
//         name: 'Juan Martínez',
//         score: 15,
//       },
//       {
//         id: 'prt_004',
//         name: 'Ana López',
//         score: 15,
//       },
//     ],
//   },
//   // Final
//   {
//     id: 'match_final',
//     roundIndex: 1,
//     roundName: 'Final',
//     nextMatchId: null, // No next match (this is the final)
//     nextMatchSlot: 0, // Not used for final match
//     winnerId: null,
//     status: 'WAITING', // Waiting for Semi Final 2 to complete
//     players: [
//       {
//         id: 'prt_001',
//         name: 'Carlos Rodríguez',
//       },
//       null, // Waiting for winner of Semi Final 2
//     ],
//   },
// ];

// /**
//  * Mock Matches - Quarter Finals + Semi Finals + Final
//  * Complete 8-player bracket
//  */
// export const mockFullBracket: Match[] = [
//   // Quarter Finals
//   {
//     id: 'match_qf_1',
//     roundIndex: 0,
//     roundName: 'Quarter Finals',
//     nextMatchId: 'match_sf_1',
//     nextMatchSlot: 0,
//     winnerId: 'prt_001',
//     status: 'COMPLETED',
//     players: [
//       { id: 'prt_001', name: 'Carlos Rodríguez', score: 21 },
//       { id: 'prt_002', name: 'María González', score: 15 },
//     ],
//   },
//   {
//     id: 'match_qf_2',
//     roundIndex: 0,
//     roundName: 'Quarter Finals',
//     nextMatchId: 'match_sf_1',
//     nextMatchSlot: 1,
//     winnerId: 'prt_003',
//     status: 'COMPLETED',
//     players: [
//       { id: 'prt_003', name: 'Juan Martínez', score: 19 },
//       { id: 'prt_004', name: 'Ana López', score: 17 },
//     ],
//   },
//   {
//     id: 'match_qf_3',
//     roundIndex: 0,
//     roundName: 'Quarter Finals',
//     nextMatchId: 'match_sf_2',
//     nextMatchSlot: 0,
//     winnerId: 'prt_005',
//     status: 'COMPLETED',
//     players: [
//       { id: 'prt_005', name: 'Luis Fernández', score: 21 },
//       { id: 'prt_006', name: 'Carmen Sánchez', score: 18 },
//     ],
//   },
//   {
//     id: 'match_qf_4',
//     roundIndex: 0,
//     roundName: 'Quarter Finals',
//     nextMatchId: 'match_sf_2',
//     nextMatchSlot: 1,
//     winnerId: null,
//     status: 'READY',
//     players: [
//       { id: 'prt_007', name: 'Pedro Ruiz', score: 10 },
//       { id: 'prt_008', name: 'Laura García', score: 10 },
//     ],
//   },
//   // Semi Finals
//   {
//     id: 'match_sf_1',
//     roundIndex: 1,
//     roundName: 'Semi Finals',
//     nextMatchId: 'match_final',
//     nextMatchSlot: 0,
//     winnerId: null,
//     status: 'READY',
//     players: [
//       { id: 'prt_001', name: 'Carlos Rodríguez' },
//       { id: 'prt_003', name: 'Juan Martínez' },
//     ],
//   },
//   {
//     id: 'match_sf_2',
//     roundIndex: 1,
//     roundName: 'Semi Finals',
//     nextMatchId: 'match_final',
//     nextMatchSlot: 1,
//     winnerId: null,
//     status: 'WAITING',
//     players: [
//       { id: 'prt_005', name: 'Luis Fernández' },
//       null, // Waiting for Quarter Final 4 winner
//     ],
//   },
//   // Final
//   {
//     id: 'match_final',
//     roundIndex: 2,
//     roundName: 'Final',
//     nextMatchId: null,
//     nextMatchSlot: 0,
//     winnerId: null,
//     status: 'WAITING',
//     players: [null, null],
//   },
// ];


// /**
//  * Factory function to create a mock event
//  */
// export function createMockEvent(overrides?: Partial<Event>): Event {
//   return {
//     id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
//     name: 'Mock Tournament',
//     date: new Date().toISOString(),
//     status: 'REGISTRATION',
//     config: {
//       maxParticipants: 16,
//     },
//     event_winner: null,
//     ...overrides,
//   };
// }

// /**
//  * Factory function to create a mock match
//  */
// export function createMockMatch(overrides?: Partial<Match>): Match {
//   return {
//     id: `match_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
//     roundIndex: 0,
//     roundName: 'Round 1',
//     nextMatchId: null,
//     nextMatchSlot: 0,
//     winnerId: null,
//     status: 'WAITING',
//     players: [null, null],
//     ...overrides,
//   };
// }
