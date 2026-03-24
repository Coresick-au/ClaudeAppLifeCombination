import type { Achievement, ChronicleState } from '@/types/chronicle.types';
import { CHAPTERS } from './chapters';

const allChapterIds = (): string[] => CHAPTERS.map((ch) => ch.id);

const allRequiredQuestionKeys = (): string[] =>
  CHAPTERS.flatMap((ch) =>
    ch.questions
      .filter((q) => q.required)
      .map((q) => `${ch.id}_${q.id}`)
  );

const allQuestionKeys = (): string[] =>
  CHAPTERS.flatMap((ch) =>
    ch.questions.map((q) => `${ch.id}_${q.id}`)
  );

const answerCount = (state: ChronicleState): number =>
  Object.keys(state.answers).length;

const answeredChapterIds = (state: ChronicleState): Set<string> => {
  const ids = new Set<string>();
  for (const answer of Object.values(state.answers)) {
    ids.add(answer.chapterId);
  }
  return ids;
};

const sideQuestAnswerCount = (state: ChronicleState): number => {
  const requiredKeys = new Set(allRequiredQuestionKeys());
  return Object.keys(state.answers).filter((key) => !requiredKeys.has(key)).length;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-answer',
    title: 'First Words',
    description: 'Answer your first question.',
    icon: '✏️',
    condition: (state) => answerCount(state) >= 1,
  },
  {
    id: 'chapter-1-complete',
    title: 'Origin Story',
    description: 'Complete Chapter 1 — every required question in your birth chapter answered.',
    icon: '🐣',
    condition: (state) => {
      const birthChapter = CHAPTERS.find((ch) => ch.id === 'birth');
      if (!birthChapter) return false;
      return birthChapter.questions
        .filter((q) => q.required)
        .every((q) => `${birthChapter.id}_${q.id}` in state.answers);
    },
  },
  {
    id: 'five-answers',
    title: 'Getting Started',
    description: 'Answer 5 questions.',
    icon: '📝',
    condition: (state) => answerCount(state) >= 5,
  },
  {
    id: 'ten-answers',
    title: 'Chronicler',
    description: 'Answer 10 questions.',
    icon: '📖',
    condition: (state) => answerCount(state) >= 10,
  },
  {
    id: 'twenty-answers',
    title: 'Seasoned Storyteller',
    description: 'Answer 20 questions.',
    icon: '🎙️',
    condition: (state) => answerCount(state) >= 20,
  },
  {
    id: 'fifty-answers',
    title: 'Master Chronicler',
    description: 'Answer 50 questions.',
    icon: '🏆',
    condition: (state) => answerCount(state) >= 50,
  },
  {
    id: 'all-chapters-started',
    title: 'World Explorer',
    description: 'Start every chapter — at least one answer in each.',
    icon: '🗺️',
    condition: (state) => {
      const chapterIds = allChapterIds();
      const started = answeredChapterIds(state);
      return chapterIds.every((id) => started.has(id));
    },
  },
  {
    id: 'xp-100',
    title: 'Level Up',
    description: 'Earn 100 XP.',
    icon: '⬆️',
    condition: (state) => state.xp >= 100,
  },
  {
    id: 'xp-500',
    title: 'Power Player',
    description: 'Earn 500 XP.',
    icon: '⚡',
    condition: (state) => state.xp >= 500,
  },
  {
    id: 'xp-1000',
    title: 'Elite',
    description: 'Earn 1000 XP.',
    icon: '👑',
    condition: (state) => state.xp >= 1000,
  },
  {
    id: 'side-quest-5',
    title: 'Completionist',
    description: 'Answer 5 side quest (non-required) questions.',
    icon: '🧩',
    condition: (state) => sideQuestAnswerCount(state) >= 5,
  },
  {
    id: 'photo-attached',
    title: 'Snapshot',
    description: 'Attach a photo to any answer.',
    icon: '📸',
    condition: (state) =>
      Object.values(state.answers).some((a) => Boolean(a.photoUrl)),
  },
  {
    id: 'journal-written',
    title: 'The Scribe',
    description: 'Write a journal entry on any answer.',
    icon: '🖊️',
    condition: (state) =>
      Object.values(state.answers).some((a) => Boolean(a.journalEntry)),
  },
  {
    id: 'follow-up-answered',
    title: 'Going Deeper',
    description: 'Answer an AI follow-up question.',
    icon: '🔍',
    condition: (state) =>
      Object.values(state.answers).some((a) => Boolean(a.followUpAnswer)),
  },
  {
    id: 'all-complete',
    title: 'Legend',
    description: 'Answer every question in every chapter.',
    icon: '🌟',
    condition: (state) => {
      const keys = allQuestionKeys();
      return keys.every((key) => key in state.answers);
    },
  },
];
