/**
 * Journal service — pure helper functions for journal data mutations.
 * All persistence goes through DataContext.
 */
import type { JournalEntry, Thought } from '@/types/journal.types';

export function createJournalEntry(
  data: Omit<JournalEntry, 'id' | 'createdAt'>,
): JournalEntry {
  return {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
}

export function createThought(
  data: Omit<Thought, 'id' | 'createdAt'>,
): Thought {
  return {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
}

export function sortEntriesByDate(entries: JournalEntry[]): JournalEntry[] {
  return [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function sortThoughtsByDate(thoughts: Thought[]): Thought[] {
  return [...thoughts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
