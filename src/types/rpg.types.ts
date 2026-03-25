/** RPG module types — character designer, battles, talents, and life XP. */

// --- Character Designer ---

export type Archetype =
  | 'Explorer'
  | 'Builder'
  | 'Scholar'
  | 'Guardian'
  | 'Creator'
  | 'Diplomat';

export const ARCHETYPES: readonly Archetype[] = [
  'Explorer',
  'Builder',
  'Scholar',
  'Guardian',
  'Creator',
  'Diplomat',
] as const;

export const ARCHETYPE_INFO: Record<Archetype, { tagline: string; bonus: string }> = {
  Explorer: {
    tagline: 'Restless feet, open maps, unfinished bucket lists.',
    bonus: '+10% XP from travel and new experiences',
  },
  Builder: {
    tagline: 'Flat-pack furniture assembled without swearing (mostly).',
    bonus: '+10% XP from career and property milestones',
  },
  Scholar: {
    tagline: 'Library cards worn thin, browser tabs in triple digits.',
    bonus: '+10% XP from certificates and learning',
  },
  Guardian: {
    tagline: 'First to arrive, last to leave, always carrying extra snacks.',
    bonus: '+10% XP from relationship and health battles',
  },
  Creator: {
    tagline: 'Notebooks full of half-finished ideas and one great one.',
    bonus: '+10% XP from creative skills and interests',
  },
  Diplomat: {
    tagline: 'Can defuse an argument at a family barbecue before the snags burn.',
    bonus: '+10% XP from connection-building and mentoring',
  },
};

export interface CharacterTrait {
  id: string;
  name: string;
}

export const AVAILABLE_TRAITS: readonly CharacterTrait[] = [
  { id: 'resilient', name: 'Resilient' },
  { id: 'curious', name: 'Curious' },
  { id: 'determined', name: 'Determined' },
  { id: 'empathetic', name: 'Empathetic' },
  { id: 'analytical', name: 'Analytical' },
  { id: 'creative', name: 'Creative' },
  { id: 'patient', name: 'Patient' },
  { id: 'adaptable', name: 'Adaptable' },
  { id: 'loyal', name: 'Loyal' },
  { id: 'ambitious', name: 'Ambitious' },
  { id: 'humorous', name: 'Humorous' },
  { id: 'pragmatic', name: 'Pragmatic' },
] as const;

export interface CharacterProfile {
  name: string;
  title: string;
  archetype: Archetype | '';
  birthDate: string;
  motto: string;
  traits: string[];
  createdAt: string;
  updatedAt: string;
}

// --- Battle System ---

export type BattleCategory =
  | 'health'
  | 'career'
  | 'relationship'
  | 'financial'
  | 'personal'
  | 'mental';

export const BATTLE_CATEGORIES: readonly BattleCategory[] = [
  'health',
  'career',
  'relationship',
  'financial',
  'personal',
  'mental',
] as const;

export const BATTLE_CATEGORY_INFO: Record<BattleCategory, { label: string; icon: string }> = {
  health: { label: 'Health', icon: '❤️' },
  career: { label: 'Career', icon: '💼' },
  relationship: { label: 'Relationship', icon: '🤝' },
  financial: { label: 'Financial', icon: '💰' },
  personal: { label: 'Personal Growth', icon: '🌱' },
  mental: { label: 'Mental Health', icon: '🧠' },
};

export type BattleOutcome = 'victory' | 'defeat' | 'draw' | 'ongoing';

export const BATTLE_OUTCOMES: readonly BattleOutcome[] = [
  'victory',
  'defeat',
  'draw',
  'ongoing',
] as const;

export type BattleDifficulty = 1 | 2 | 3 | 4 | 5;

export interface Battle {
  id: string;
  title: string;
  description: string;
  category: BattleCategory;
  difficulty: BattleDifficulty;
  outcome: BattleOutcome;
  lessonsLearned: string;
  dateStarted: string;
  dateResolved: string;
  xpEarned: number;
  createdAt: string;
  updatedAt: string;
}

// --- Talent System ---

export type TalentCategory = 'skill' | 'certificate' | 'interest';

export const TALENT_CATEGORIES: readonly TalentCategory[] = [
  'skill',
  'certificate',
  'interest',
] as const;

export const TALENT_CATEGORY_INFO: Record<TalentCategory, { label: string; icon: string }> = {
  skill: { label: 'Skill', icon: '🔧' },
  certificate: { label: 'Certificate', icon: '📜' },
  interest: { label: 'Interest', icon: '✨' },
};

export type TalentLevel = 1 | 2 | 3 | 4 | 5;

export const TALENT_LEVEL_LABELS: Record<TalentLevel, string> = {
  1: 'Novice',
  2: 'Apprentice',
  3: 'Competent',
  4: 'Proficient',
  5: 'Master',
};

export interface Talent {
  id: string;
  name: string;
  category: TalentCategory;
  level: TalentLevel;
  description: string;
  dateAcquired: string;
  createdAt: string;
  updatedAt: string;
}

// --- RPG State (top-level in LifeOSData) ---

export interface RPGState {
  character: CharacterProfile;
  battles: Battle[];
  talents: Talent[];
  /** Expected lifespan in years (default 80) — used for life XP bar */
  expectedLifespan: number;
}
