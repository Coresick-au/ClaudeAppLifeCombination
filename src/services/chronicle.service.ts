import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { ChronicleState, ChronicleAnswer } from '@/types/chronicle.types';

function chronicleRef(uid: string) {
  return doc(db, 'users', uid, 'chronicle', 'state');
}

export async function getChronicleState(
  uid: string,
): Promise<ChronicleState | null> {
  const snap = await getDoc(chronicleRef(uid));
  return snap.exists() ? (snap.data() as ChronicleState) : null;
}

export async function initChronicleState(uid: string): Promise<void> {
  await setDoc(chronicleRef(uid), {
    currentChapter: 0,
    currentQuestion: 0,
    xp: 0,
    answers: {},
    achievements: [],
    customChapters: [],
    customEvents: [],
    startedAt: serverTimestamp(),
    lastPlayedAt: serverTimestamp(),
  });
}

export async function saveAnswer(
  uid: string,
  answer: ChronicleAnswer,
): Promise<void> {
  const key = `${answer.chapterId}_${answer.questionId}`;
  await updateDoc(chronicleRef(uid), {
    [`answers.${key}`]: answer,
    lastPlayedAt: serverTimestamp(),
  });
}

export async function updateProgress(
  uid: string,
  updates: Partial<ChronicleState>,
): Promise<void> {
  await updateDoc(chronicleRef(uid), {
    ...updates,
    lastPlayedAt: serverTimestamp(),
  });
}
