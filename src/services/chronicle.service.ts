/**
 * Chronicle service — pure helper functions for chronicle state mutations.
 * All persistence goes through DataContext.
 */
import type { ChronicleState, ChronicleAnswer } from '@/types/chronicle.types';

export function createInitialChronicleState(): ChronicleState {
  const now = new Date().toISOString();
  return {
    currentChapter: 0,
    currentQuestion: 0,
    xp: 0,
    answers: {},
    achievements: [],
    customChapters: [],
    customEvents: [],
    startedAt: now,
    lastPlayedAt: now,
  };
}

export function addAnswer(
  state: ChronicleState,
  answer: ChronicleAnswer,
): ChronicleState {
  const key = `${answer.chapterId}_${answer.questionId}`;
  return {
    ...state,
    answers: { ...state.answers, [key]: answer },
    lastPlayedAt: new Date().toISOString(),
  };
}

export function updateProgress(
  state: ChronicleState,
  updates: Partial<ChronicleState>,
): ChronicleState {
  return {
    ...state,
    ...updates,
    lastPlayedAt: new Date().toISOString(),
  };
}
