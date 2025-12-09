import { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'manager';

export type InvitationStatus = 'pending' | 'accepted' | 'expired';

export interface Invitation {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  token: string;
  status: InvitationStatus;
  invitedBy: string;
  invitedAt: Timestamp;
  expiresAt: Timestamp;
  acceptedAt?: Timestamp;
}

export interface UserProfile {
  id: string; // uid from Firebase Auth
  email: string;
  name: string;
  role: UserRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
