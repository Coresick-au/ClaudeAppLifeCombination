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
    id: 'fifteen-answers',
    title: 'Finding Your Voice',
    description: 'Answer 15 questions.',
    icon: '📝',
    condition: (state) => answerCount(state) >= 15,
  },
  {
    id: 'thirty-answers',
    title: 'Seasoned Storyteller',
    description: 'Answer 30 questions.',
    icon: '🎙️',
    condition: (state) => answerCount(state) >= 30,
  },
  {
    id: 'fifty-answers',
    title: 'Master Chronicler',
    description: 'Answer 50 questions.',
    icon: '🏆',
    condition: (state) => answerCount(state) >= 50,
  },
  {
    id: 'seventy-five-answers',
    title: 'Living Archive',
    description: 'Answer 75 questions.',
    icon: '📚',
    condition: (state) => answerCount(state) >= 75,
  },
  {
    id: 'hundred-answers',
    title: 'Complete Record',
    description: 'Answer 100 questions.',
    icon: '🏛️',
    condition: (state) => answerCount(state) >= 100,
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
    id: 'xp-250',
    title: 'Power Surge',
    description: 'Earn 250 XP.',
    icon: '⚡',
    condition: (state) => state.xp >= 250,
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
    id: 'xp-2000',
    title: 'Transcendent',
    description: 'Earn 2000 XP.',
    icon: '💫',
    condition: (state) => state.xp >= 2000,
  },
  {
    id: 'side-quest-10',
    title: 'Completionist',
    description: 'Answer 10 side quest (non-required) questions.',
    icon: '🧩',
    condition: (state) => sideQuestAnswerCount(state) >= 10,
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
