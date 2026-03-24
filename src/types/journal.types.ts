import type { Timestamp } from 'firebase/firestore';
import type { EventCategory } from './shared.types';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  category: EventCategory;
  date: Timestamp;
  year: number;
  month?: number;
  tags: string[];
  photoUrls: string[];
  importance: 1 | 2 | 3 | 4 | 5;
  createdAt: Timestamp;
}

export type ThoughtType = 'thought' | 'pondering' | 'note' | 'question' | 'idea';

export interface Thought {
  id: string;
  type: ThoughtType;
  content: string;
  createdAt: Timestamp;
}

export interface LetterToFuture {
  id: string;
  content: string;
  unlockDate: Timestamp;
  createdAt: Timestamp;
  isUnlocked: boolean;
}
