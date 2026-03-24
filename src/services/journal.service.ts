import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { JournalEntry, Thought } from '@/types/journal.types';

function entriesRef(uid: string) {
  return collection(db, 'users', uid, 'journal');
}

function thoughtsRef(uid: string) {
  return collection(db, 'users', uid, 'thoughts');
}

export async function getJournalEntries(uid: string): Promise<JournalEntry[]> {
  const q = query(entriesRef(uid), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as JournalEntry);
}

export async function addJournalEntry(
  uid: string,
  entry: Omit<JournalEntry, 'id' | 'createdAt'>,
): Promise<string> {
  const docRef = await addDoc(entriesRef(uid), {
    ...entry,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateJournalEntry(
  uid: string,
  entryId: string,
  updates: Partial<JournalEntry>,
): Promise<void> {
  await updateDoc(doc(entriesRef(uid), entryId), updates);
}

export async function deleteJournalEntry(
  uid: string,
  entryId: string,
): Promise<void> {
  await deleteDoc(doc(entriesRef(uid), entryId));
}

export async function getThoughts(uid: string): Promise<Thought[]> {
  const q = query(thoughtsRef(uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Thought);
}

export async function addThought(
  uid: string,
  thought: Omit<Thought, 'id' | 'createdAt'>,
): Promise<string> {
  const docRef = await addDoc(thoughtsRef(uid), {
    ...thought,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
