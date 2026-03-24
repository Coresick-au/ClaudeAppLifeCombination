import type { ChronicleState } from './chronicle.types';
import type { JournalEntry, Thought, LetterToFuture } from './journal.types';
import type { Property, SalaryRecord, SuperFund, FinancialSnapshot } from './wealth.types';
import type { UserProfile } from './shared.types';
import type { EventCategory } from './shared.types';

export interface CustomEventData {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  createdAt: string;
}

export interface LifeOSSettings {
  theme: 'hearthstone' | 'meadow';
  soundEnabled: boolean;
}

export interface LifeOSData {
  /** Schema version for future migrations */
  version: number;
  /** ISO timestamp of last save */
  lastSaved: string;

  profile: UserProfile;
  settings: LifeOSSettings;

  chronicle: ChronicleState;

  journal: {
    entries: JournalEntry[];
    thoughts: Thought[];
    customEvents: CustomEventData[];
  };

  wealth: {
    properties: Property[];
    salaryHistory: SalaryRecord[];
    superFunds: SuperFund[];
    snapshots: FinancialSnapshot[];
  };

  connections: Record<string, unknown>[];
  letters: LetterToFuture[];
}
