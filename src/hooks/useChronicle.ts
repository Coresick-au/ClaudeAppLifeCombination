import { useState, useCallback, useEffect, useMemo } from 'react';
import type { ChronicleState, ChronicleAnswer } from '@/types/chronicle.types';
import { CHAPTERS, TOTAL_QUESTIONS, TOTAL_XP } from '@/features/chronicle/chapters';
import { ACHIEVEMENTS } from '@/features/chronicle/achievements';

const STORAGE_KEY = 'life-os-chronicle';

function createInitialState(): ChronicleState {
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

function loadState(): ChronicleState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as ChronicleState;
    }
  } catch {
    // Corrupted state, start fresh
  }
  return createInitialState();
}

function persistState(state: ChronicleState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

interface NewAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export function useChronicle() {
  const [state, setState] = useState<ChronicleState>(loadState);
  const [newAchievements, setNewAchievements] = useState<NewAchievement[]>([]);

  // Persist on every state change
  useEffect(() => {
    persistState(state);
  }, [state]);

  const currentChapterDef = useMemo(
    () => CHAPTERS[state.currentChapter],
    [state.currentChapter],
  );

  const currentQuestionDef = useMemo(
    () => currentChapterDef?.questions[state.currentQuestion],
    [currentChapterDef, state.currentQuestion],
  );

  const answeredCount = useMemo(
    () => Object.keys(state.answers).length,
    [state.answers],
  );

  const checkAchievements = useCallback(
    (updatedState: ChronicleState): string[] => {
      const newlyUnlocked: NewAchievement[] = [];
      const updatedAchievements = [...updatedState.achievements];

      for (const achievement of ACHIEVEMENTS) {
        if (
          !updatedAchievements.includes(achievement.id) &&
          achievement.condition(updatedState)
        ) {
          updatedAchievements.push(achievement.id);
          newlyUnlocked.push({
            id: achievement.id,
            title: achievement.title,
            description: achievement.description,
            icon: achievement.icon,
          });
        }
      }

      if (newlyUnlocked.length > 0) {
        setNewAchievements((prev) => [...prev, ...newlyUnlocked]);
      }

      return updatedAchievements;
    },
    [],
  );

  const submitAnswer = useCallback(
    (value: string) => {
      if (!currentChapterDef || !currentQuestionDef) return;

      const key = `${currentChapterDef.id}_${currentQuestionDef.id}`;
      const answer: ChronicleAnswer = {
        chapterId: currentChapterDef.id,
        questionId: currentQuestionDef.id,
        value,
        answeredAt: new Date().toISOString(),
      };

      setState((prev) => {
        const updatedState: ChronicleState = {
          ...prev,
          answers: { ...prev.answers, [key]: answer },
          xp: prev.xp + currentQuestionDef.xp,
          lastPlayedAt: new Date().toISOString(),
        };

        // Advance to next question or chapter
        const chapter = CHAPTERS[prev.currentChapter];
        if (chapter && prev.currentQuestion < chapter.questions.length - 1) {
          updatedState.currentQuestion = prev.currentQuestion + 1;
        } else if (prev.currentChapter < CHAPTERS.length - 1) {
          updatedState.currentChapter = prev.currentChapter + 1;
          updatedState.currentQuestion = 0;
        }

        updatedState.achievements = checkAchievements(updatedState);
        return updatedState;
      });
    },
    [currentChapterDef, currentQuestionDef, checkAchievements],
  );

  const skipQuestion = useCallback(() => {
    setState((prev) => {
      const chapter = CHAPTERS[prev.currentChapter];
      if (!chapter) return prev;

      const updated = { ...prev, lastPlayedAt: new Date().toISOString() };
      if (prev.currentQuestion < chapter.questions.length - 1) {
        updated.currentQuestion = prev.currentQuestion + 1;
      } else if (prev.currentChapter < CHAPTERS.length - 1) {
        updated.currentChapter = prev.currentChapter + 1;
        updated.currentQuestion = 0;
      }
      return updated;
    });
  }, []);

  const rewind = useCallback((chapterIndex: number, questionIndex: number) => {
    setState((prev) => ({
      ...prev,
      currentChapter: chapterIndex,
      currentQuestion: questionIndex,
      lastPlayedAt: new Date().toISOString(),
    }));
  }, []);

  const loadSampleData = useCallback(
    (sampleAnswers: Record<string, { value: string }>) => {
      setState((prev) => {
        const answers: Record<string, ChronicleAnswer> = {};
        let xp = 0;

        for (const [key, { value }] of Object.entries(sampleAnswers)) {
          const [chapterId, ...questionParts] = key.split('_');
          const questionId = questionParts.join('_');
          const chapter = CHAPTERS.find((c) => c.id === chapterId);
          const question = chapter?.questions.find((q) => q.id === questionId);

          if (chapter && question) {
            answers[key] = {
              chapterId: chapter.id,
              questionId: question.id,
              value,
              answeredAt: new Date().toISOString(),
            };
            xp += question.xp;
          }
        }

        const updatedState: ChronicleState = {
          ...prev,
          answers: { ...prev.answers, ...answers },
          xp: prev.xp + xp,
          lastPlayedAt: new Date().toISOString(),
        };
        updatedState.achievements = checkAchievements(updatedState);
        return updatedState;
      });
    },
    [checkAchievements],
  );

  const resetProgress = useCallback(() => {
    setState(createInitialState());
    setNewAchievements([]);
  }, []);

  const dismissAchievement = useCallback(() => {
    setNewAchievements((prev) => prev.slice(1));
  }, []);

  const isComplete = useMemo(() => {
    return answeredCount >= TOTAL_QUESTIONS;
  }, [answeredCount]);

  return {
    state,
    currentChapterDef,
    currentQuestionDef,
    answeredCount,
    totalQuestions: TOTAL_QUESTIONS,
    totalXp: TOTAL_XP,
    chapters: CHAPTERS,
    isComplete,
    newAchievements,
    submitAnswer,
    skipQuestion,
    rewind,
    loadSampleData,
    resetProgress,
    dismissAchievement,
  };
}
