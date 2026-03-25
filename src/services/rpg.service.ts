/**
 * RPG service — pure helper functions for RPG state, XP calculations, and levelling.
 * All persistence goes through DataContext.
 */
import type {
  RPGState,
  Battle,
  Talent,
  BattleDifficulty,
  Archetype,
  TalentCategory,
} from '@/types/rpg.types';

// --- Life XP System ---

/**
 * XP earned simply from years lived.
 * Each year = 100 base XP. Fractions counted proportionally.
 */
export function calculateAgeXP(birthDate: string): number {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return 0;
  const now = new Date();
  const ageMs = now.getTime() - birth.getTime();
  if (ageMs <= 0) return 0;
  const ageYears = ageMs / (365.25 * 24 * 60 * 60 * 1000);
  return Math.floor(ageYears * 100);
}

/**
 * Total XP from resolved battles. Only resolved battles count.
 */
export function calculateBattleXP(battles: Battle[]): number {
  return battles
    .filter((b) => b.outcome !== 'ongoing')
    .reduce((sum, b) => sum + b.xpEarned, 0);
}

/**
 * Total XP from talents. Each talent awards XP based on level.
 * Level 1=20, 2=50, 3=100, 4=180, 5=300
 */
const TALENT_XP_BY_LEVEL: Record<number, number> = {
  1: 20,
  2: 50,
  3: 100,
  4: 180,
  5: 300,
};

export function calculateTalentXP(talents: Talent[]): number {
  return talents.reduce((sum, t) => sum + (TALENT_XP_BY_LEVEL[t.level] ?? 0), 0);
}

/**
 * XP earned from a battle based on difficulty and outcome.
 */
export function calculateBattleReward(difficulty: BattleDifficulty, outcome: Battle['outcome']): number {
  const baseXP: Record<BattleDifficulty, number> = {
    1: 25,
    2: 50,
    3: 100,
    4: 200,
    5: 400,
  };
  const outcomeMultiplier: Record<string, number> = {
    victory: 1.0,
    draw: 0.6,
    defeat: 0.3,
    ongoing: 0,
  };
  return Math.round(baseXP[difficulty] * (outcomeMultiplier[outcome] ?? 0));
}

/**
 * Archetype bonus multiplier (10% extra for matching categories).
 */
const ARCHETYPE_BONUS_MAP: Record<Archetype, { battleCategories: string[]; talentCategories: TalentCategory[] }> = {
  Explorer: { battleCategories: ['personal'], talentCategories: ['interest'] },
  Builder: { battleCategories: ['career', 'financial'], talentCategories: ['skill'] },
  Scholar: { battleCategories: ['mental'], talentCategories: ['certificate'] },
  Guardian: { battleCategories: ['relationship', 'health'], talentCategories: ['skill'] },
  Creator: { battleCategories: ['personal'], talentCategories: ['interest', 'skill'] },
  Diplomat: { battleCategories: ['relationship'], talentCategories: ['skill'] },
};

export function calculateArchetypeBonus(archetype: Archetype | '', battles: Battle[], talents: Talent[]): number {
  if (!archetype) return 0;
  const map = ARCHETYPE_BONUS_MAP[archetype];
  if (!map) return 0;

  const battleBonus = battles
    .filter((b) => b.outcome !== 'ongoing' && map.battleCategories.includes(b.category))
    .reduce((sum, b) => sum + Math.round(b.xpEarned * 0.1), 0);

  const talentBonus = talents
    .filter((t) => map.talentCategories.includes(t.category))
    .reduce((sum, t) => sum + Math.round((TALENT_XP_BY_LEVEL[t.level] ?? 0) * 0.1), 0);

  return battleBonus + talentBonus;
}

export interface LifeXPBreakdown {
  ageXP: number;
  chronicleXP: number;
  battleXP: number;
  talentXP: number;
  archetypeBonus: number;
  totalXP: number;
  /** 0-100 progress through expected lifespan */
  lifeProgress: number;
  level: number;
  levelLabel: string;
  nextLevelXP: number | null;
}

/**
 * Level thresholds for the unified RPG system.
 * Levels are based on total XP across all sources.
 */
const LEVEL_THRESHOLDS: { minXp: number; label: string }[] = [
  { minXp: 0, label: 'Blank Page' },
  { minXp: 500, label: 'Novice' },
  { minXp: 1500, label: 'Apprentice' },
  { minXp: 3000, label: 'Journeyman' },
  { minXp: 5000, label: 'Veteran' },
  { minXp: 8000, label: 'Elder' },
  { minXp: 12000, label: 'Legend' },
];

export function getLevelFromXP(xp: number): { level: number; label: string } {
  let result = { level: 1, label: 'Blank Page' };
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    const threshold = LEVEL_THRESHOLDS[i];
    if (threshold && xp >= threshold.minXp) {
      result = { level: i + 1, label: threshold.label };
    }
  }
  return result;
}

export function getNextLevelXP(xp: number): number | null {
  for (const threshold of LEVEL_THRESHOLDS) {
    if (xp < threshold.minXp) return threshold.minXp;
  }
  return null;
}

/**
 * Compute the full XP breakdown for the RPG dashboard.
 */
export function computeLifeXP(
  rpg: RPGState,
  chronicleXP: number,
): LifeXPBreakdown {
  const ageXP = calculateAgeXP(rpg.character.birthDate);
  const battleXP = calculateBattleXP(rpg.battles);
  const talentXP = calculateTalentXP(rpg.talents);
  const archetypeBonus = calculateArchetypeBonus(
    rpg.character.archetype,
    rpg.battles,
    rpg.talents,
  );
  const totalXP = ageXP + chronicleXP + battleXP + talentXP + archetypeBonus;
  const { level, label } = getLevelFromXP(totalXP);
  const nextLevelXP = getNextLevelXP(totalXP);

  // Life progress: % of expected lifespan lived
  let lifeProgress = 0;
  if (rpg.character.birthDate) {
    const birth = new Date(rpg.character.birthDate);
    if (!isNaN(birth.getTime())) {
      const ageYears = (Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      lifeProgress = Math.min(100, Math.round((ageYears / rpg.expectedLifespan) * 100));
    }
  }

  return {
    ageXP,
    chronicleXP,
    battleXP,
    talentXP,
    archetypeBonus,
    totalXP,
    lifeProgress,
    level,
    levelLabel: label,
    nextLevelXP,
  };
}

// --- Factory Functions ---

export function createInitialRPGState(): RPGState {
  const now = new Date().toISOString();
  return {
    character: {
      name: '',
      title: '',
      archetype: '',
      birthDate: '',
      motto: '',
      traits: [],
      createdAt: now,
      updatedAt: now,
    },
    battles: [],
    talents: [],
    expectedLifespan: 80,
  };
}

export function createBattle(partial: Omit<Battle, 'id' | 'xpEarned' | 'createdAt' | 'updatedAt'>): Battle {
  const now = new Date().toISOString();
  const xpEarned = calculateBattleReward(partial.difficulty, partial.outcome);
  return {
    ...partial,
    id: crypto.randomUUID(),
    xpEarned,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateBattle(existing: Battle, changes: Partial<Omit<Battle, 'id' | 'createdAt'>>): Battle {
  const updated = { ...existing, ...changes, updatedAt: new Date().toISOString() };
  // Recalculate XP if difficulty or outcome changed
  if (changes.difficulty !== undefined || changes.outcome !== undefined) {
    updated.xpEarned = calculateBattleReward(updated.difficulty, updated.outcome);
  }
  return updated;
}

export function createTalent(partial: Omit<Talent, 'id' | 'createdAt' | 'updatedAt'>): Talent {
  const now = new Date().toISOString();
  return {
    ...partial,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
}

export function updateTalent(existing: Talent, changes: Partial<Omit<Talent, 'id' | 'createdAt'>>): Talent {
  return { ...existing, ...changes, updatedAt: new Date().toISOString() };
}
