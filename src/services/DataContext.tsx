import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { LifeOSData, CustomEventData, Connection, LifeOSSettings } from '@/types/data.types';
import type { ChronicleState } from '@/types/chronicle.types';
import type { JournalEntry, Thought, LetterToFuture, Reflection } from '@/types/journal.types';
import type { Property, SalaryRecord, SuperFund, FinancialSnapshot } from '@/types/wealth.types';
import type { UserProfile } from '@/types/shared.types';
import {
  createEmptyDataset,
  saveToFile,
  loadFromFile,
} from './local-data.service';

const AUTOSAVE_KEY = 'life-os-autosave';

interface DataContextValue {
  /** Whether data has been loaded (New or Load) */
  isLoaded: boolean;
  /** Whether changes exist since last file save */
  hasUnsavedChanges: boolean;

  data: LifeOSData;

  // --- Lifecycle ---
  startNew: () => void;
  loadExisting: () => Promise<void>;
  save: () => void;

  // --- Chronicle ---
  getChronicle: () => ChronicleState;
  setChronicle: (state: ChronicleState) => void;

  // --- Journal ---
  getJournalEntries: () => JournalEntry[];
  setJournalEntries: (entries: JournalEntry[]) => void;
  getThoughts: () => Thought[];
  setThoughts: (thoughts: Thought[]) => void;
  getCustomEvents: () => CustomEventData[];
  setCustomEvents: (events: CustomEventData[]) => void;

  // --- Wealth ---
  getProperties: () => Property[];
  setProperties: (properties: Property[]) => void;
  getSalaryHistory: () => SalaryRecord[];
  setSalaryHistory: (records: SalaryRecord[]) => void;
  getSuperFunds: () => SuperFund[];
  setSuperFunds: (funds: SuperFund[]) => void;
  getSnapshots: () => FinancialSnapshot[];
  setSnapshots: (snapshots: FinancialSnapshot[]) => void;

  // --- Profile & Settings ---
  getProfile: () => UserProfile;
  setProfile: (profile: UserProfile) => void;
  getSettings: () => LifeOSSettings;
  setSettings: (settings: LifeOSSettings) => void;

  // --- Reflections ---
  getReflections: () => Reflection[];
  setReflections: (reflections: Reflection[]) => void;

  // --- Letters & Connections ---
  getLetters: () => LetterToFuture[];
  setLetters: (letters: LetterToFuture[]) => void;
  getConnections: () => Connection[];
  setConnections: (connections: Connection[]) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData must be used within a DataProvider');
  }
  return ctx;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<LifeOSData>(createEmptyDataset);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Try to restore from localStorage autosave on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTOSAVE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as LifeOSData;
        if (parsed.version) {
          setData(parsed);
          setIsLoaded(true);
          setHasUnsavedChanges(true);
        }
      }
    } catch {
      // Corrupted autosave, ignore
    }
  }, []);

  // Autosave to localStorage on every data change (draft protection)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
    }
  }, [data, isLoaded]);

  // Warn before closing tab if unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  // Helper: update data and mark unsaved
  const update = useCallback((updater: (prev: LifeOSData) => LifeOSData) => {
    setData(updater);
    setHasUnsavedChanges(true);
  }, []);

  // --- Lifecycle ---

  const startNew = useCallback(() => {
    const fresh = createEmptyDataset();
    setData(fresh);
    setIsLoaded(true);
    setHasUnsavedChanges(false);
    localStorage.removeItem(AUTOSAVE_KEY);
  }, []);

  const loadExisting = useCallback(async () => {
    const loaded = await loadFromFile();
    setData(loaded);
    setIsLoaded(true);
    setHasUnsavedChanges(false);
  }, []);

  const save = useCallback(() => {
    saveToFile(data);
    setHasUnsavedChanges(false);
  }, [data]);

  // --- Chronicle ---

  const getChronicle = useCallback(() => data.chronicle, [data.chronicle]);
  const setChronicle = useCallback(
    (state: ChronicleState) => update((prev) => ({ ...prev, chronicle: state })),
    [update],
  );

  // --- Journal ---

  const getJournalEntries = useCallback(() => data.journal.entries, [data.journal.entries]);
  const setJournalEntries = useCallback(
    (entries: JournalEntry[]) =>
      update((prev) => ({ ...prev, journal: { ...prev.journal, entries } })),
    [update],
  );

  const getThoughts = useCallback(() => data.journal.thoughts, [data.journal.thoughts]);
  const setThoughts = useCallback(
    (thoughts: Thought[]) =>
      update((prev) => ({ ...prev, journal: { ...prev.journal, thoughts } })),
    [update],
  );

  const getCustomEvents = useCallback(
    () => data.journal.customEvents,
    [data.journal.customEvents],
  );
  const setCustomEvents = useCallback(
    (events: CustomEventData[]) =>
      update((prev) => ({ ...prev, journal: { ...prev.journal, customEvents: events } })),
    [update],
  );

  // --- Wealth ---

  const getProperties = useCallback(() => data.wealth.properties, [data.wealth.properties]);
  const setProperties = useCallback(
    (properties: Property[]) =>
      update((prev) => ({ ...prev, wealth: { ...prev.wealth, properties } })),
    [update],
  );

  const getSalaryHistory = useCallback(
    () => data.wealth.salaryHistory,
    [data.wealth.salaryHistory],
  );
  const setSalaryHistory = useCallback(
    (records: SalaryRecord[]) =>
      update((prev) => ({ ...prev, wealth: { ...prev.wealth, salaryHistory: records } })),
    [update],
  );

  const getSuperFunds = useCallback(() => data.wealth.superFunds, [data.wealth.superFunds]);
  const setSuperFunds = useCallback(
    (funds: SuperFund[]) =>
      update((prev) => ({ ...prev, wealth: { ...prev.wealth, superFunds: funds } })),
    [update],
  );

  const getSnapshots = useCallback(() => data.wealth.snapshots, [data.wealth.snapshots]);
  const setSnapshots = useCallback(
    (snapshots: FinancialSnapshot[]) =>
      update((prev) => ({ ...prev, wealth: { ...prev.wealth, snapshots } })),
    [update],
  );

  // --- Profile & Settings ---

  const getProfile = useCallback(() => data.profile, [data.profile]);
  const setProfile = useCallback(
    (profile: UserProfile) => update((prev) => ({ ...prev, profile })),
    [update],
  );

  const getSettings = useCallback(() => data.settings, [data.settings]);
  const setSettings = useCallback(
    (settings: LifeOSSettings) => update((prev) => ({ ...prev, settings })),
    [update],
  );

  // --- Reflections ---

  const getReflections = useCallback(() => data.reflections, [data.reflections]);
  const setReflections = useCallback(
    (reflections: Reflection[]) => update((prev) => ({ ...prev, reflections })),
    [update],
  );

  // --- Letters & Connections ---

  const getLetters = useCallback(() => data.letters, [data.letters]);
  const setLetters = useCallback(
    (letters: LetterToFuture[]) => update((prev) => ({ ...prev, letters })),
    [update],
  );

  const getConnections = useCallback(() => data.connections, [data.connections]);
  const setConnections = useCallback(
    (connections: Connection[]) => update((prev) => ({ ...prev, connections })),
    [update],
  );

  const value: DataContextValue = {
    isLoaded,
    hasUnsavedChanges,
    data,
    startNew,
    loadExisting,
    save,
    getChronicle,
    setChronicle,
    getJournalEntries,
    setJournalEntries,
    getThoughts,
    setThoughts,
    getCustomEvents,
    setCustomEvents,
    getProperties,
    setProperties,
    getSalaryHistory,
    setSalaryHistory,
    getSuperFunds,
    setSuperFunds,
    getSnapshots,
    setSnapshots,
    getProfile,
    setProfile,
    getSettings,
    setSettings,
    getReflections,
    setReflections,
    getLetters,
    setLetters,
    getConnections,
    setConnections,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
