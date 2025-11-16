
import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAdmin?: boolean;
}

export enum ItemType {
  LOST = 'lost',
  FOUND = 'found',
}

export enum ItemStatus {
  OPEN = 'open',
  CLAIMED = 'claimed',
  CLOSED = 'closed',
}

export interface Item {
  id: string;
  title: string;
  description: string;
  type: ItemType;
  category: string;
  location: string;
  date: Timestamp;
  imageUrl?: string;
  userId: string;
  userDisplayName: string;
  status: ItemStatus;
  createdAt: Timestamp;
  tags?: string[];
  potentialMatches?: string[];
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: Timestamp;
}

export interface Chat {
  id: string;
  participants: string[]; // array of user UIDs
  lastMessage: Message | null;
  relatedItemId: string;
  createdAt: Timestamp;
}
   