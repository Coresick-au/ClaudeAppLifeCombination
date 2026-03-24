import type { EventCategory } from './shared.types';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  category: EventCategory;
  date: string;
  year: number;
  month?: number;
  tags: string[];
  photoUrls: string[];
  importance: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
}

export type ThoughtType = 'thought' | 'pondering' | 'note' | 'question' | 'idea';

export interface Thought {
  id: string;
  type: ThoughtType;
  content: string;
  createdAt: string;
}

export interface LetterToFuture {
  id: string;
  content: string;
  unlockDate: string;
  createdAt: string;
  isUnlocked: boolean;
}
