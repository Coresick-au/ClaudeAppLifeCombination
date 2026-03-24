import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Property, SalaryRecord, SuperFund } from '@/types/wealth.types';

function propertiesRef(uid: string) {
  return collection(db, 'users', uid, 'properties');
}

function salaryRef(uid: string) {
  return collection(db, 'users', uid, 'salary');
}

function superRef(uid: string) {
  return collection(db, 'users', uid, 'super');
}

export async function getProperties(uid: string): Promise<Property[]> {
  const snap = await getDocs(propertiesRef(uid));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Property);
}

export async function saveProperty(
  uid: string,
  property: Property,
): Promise<void> {
  await setDoc(doc(propertiesRef(uid), property.id), property);
}

export async function deleteProperty(
  uid: string,
  propertyId: string,
): Promise<void> {
  await deleteDoc(doc(propertiesRef(uid), propertyId));
}

export async function getSalaryHistory(uid: string): Promise<SalaryRecord[]> {
  const q = query(salaryRef(uid), orderBy('financialYear', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SalaryRecord);
}

export async function saveSalaryRecord(
  uid: string,
  record: SalaryRecord,
): Promise<void> {
  await setDoc(doc(salaryRef(uid), record.id), record);
}

export async function getSuperFunds(uid: string): Promise<SuperFund[]> {
  const snap = await getDocs(superRef(uid));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SuperFund);
}

export async function saveSuperFund(
  uid: string,
  fund: SuperFund,
): Promise<void> {
  await setDoc(doc(superRef(uid), fund.id), fund);
}
