import type { LifeOSData } from '@/types/data.types';

const CURRENT_VERSION = 1;
const FILE_EXTENSION = '.lifeos.json';

/**
 * Creates an empty LifeOSData object with sensible defaults.
 */
export function createEmptyDataset(): LifeOSData {
  const now = new Date().toISOString();
  return {
    version: CURRENT_VERSION,
    lastSaved: now,

    profile: {
      displayName: '',
      email: '',
      theme: 'hearthstone',
      soundEnabled: true,
      createdAt: now,
    },

    settings: {
      theme: 'hearthstone',
      soundEnabled: true,
    },

    chronicle: {
      currentChapter: 0,
      currentQuestion: 0,
      xp: 0,
      answers: {},
      achievements: [],
      customChapters: [],
      customEvents: [],
      startedAt: now,
      lastPlayedAt: now,
    },

    journal: {
      entries: [],
      thoughts: [],
      customEvents: [],
    },

    wealth: {
      properties: [],
      salaryHistory: [],
      superFunds: [],
      snapshots: [],
    },

    reflections: [],
    connections: [],
    letters: [],
  };
}

/**
 * Serialises the data to JSON and triggers a browser file download.
 */
export function saveToFile(data: LifeOSData): void {
  const exportData: LifeOSData = {
    ...data,
    lastSaved: new Date().toISOString(),
  };

  const json = JSON.stringify(exportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const name = data.profile.displayName
    ? data.profile.displayName.toLowerCase().replace(/\s+/g, '-')
    : 'life-os';
  const dateStamp = new Date().toISOString().split('T')[0];

  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}-${dateStamp}${FILE_EXTENSION}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Opens a file picker, reads the selected JSON file, validates its structure,
 * and returns the parsed LifeOSData.
 */
export function loadFromFile(): Promise<LifeOSData> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.lifeos.json';

    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string) as LifeOSData;
          const validated = validateData(parsed);
          resolve(validated);
        } catch (err) {
          reject(
            new Error(
              `Failed to parse file: ${err instanceof Error ? err.message : 'Invalid JSON'}`,
            ),
          );
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });

    input.click();
  });
}

/**
 * Basic structural validation — ensures required top-level keys exist.
 * Fills in missing sections with defaults so older files still load.
 */
function validateData(data: unknown): LifeOSData {
  if (!data || typeof data !== 'object') {
    throw new Error('File does not contain valid Life OS data');
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.version !== 'number') {
    throw new Error('Missing or invalid version field');
  }

  // Merge with defaults to fill any missing sections
  const defaults = createEmptyDataset();
  return {
    ...defaults,
    ...obj,
    profile: { ...defaults.profile, ...(obj.profile as Record<string, unknown>) },
    settings: { ...defaults.settings, ...(obj.settings as Record<string, unknown>) },
    chronicle: { ...defaults.chronicle, ...(obj.chronicle as Record<string, unknown>) },
    journal: { ...defaults.journal, ...(obj.journal as Record<string, unknown>) },
    wealth: { ...defaults.wealth, ...(obj.wealth as Record<string, unknown>) },
  } as LifeOSData;
}
