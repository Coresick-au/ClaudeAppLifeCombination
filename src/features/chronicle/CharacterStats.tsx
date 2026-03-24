import { useMemo, memo } from 'react';
import type { CharacterClass } from '@/types/chronicle.types';

interface CharacterStatsProps {
  xp: number;
  totalXp: number;
  answeredCount: number;
  totalQuestions: number;
  achievementCount: number;
}

const CLASS_THRESHOLDS: { minXp: number; label: CharacterClass }[] = [
  { minXp: 0, label: 'Blank Page' },
  { minXp: 50, label: 'Novice' },
  { minXp: 200, label: 'Journeyman' },
  { minXp: 500, label: 'Veteran' },
  { minXp: 1000, label: 'Elder' },
  { minXp: 2000, label: 'Legend' },
];

function getCharacterClass(xp: number): CharacterClass {
  let current: CharacterClass = 'Blank Page';
  for (const threshold of CLASS_THRESHOLDS) {
    if (xp >= threshold.minXp) {
      current = threshold.label;
    }
  }
  return current;
}

function getNextClassThreshold(xp: number): { label: CharacterClass; xpNeeded: number } | null {
  for (const threshold of CLASS_THRESHOLDS) {
    if (xp < threshold.minXp) {
      return { label: threshold.label, xpNeeded: threshold.minXp - xp };
    }
  }
  return null;
}

export const CharacterStats = memo(function CharacterStats({
  xp,
  totalXp,
  answeredCount,
  totalQuestions,
  achievementCount,
}: CharacterStatsProps) {
  const characterClass = useMemo(() => getCharacterClass(xp), [xp]);
  const nextClass = useMemo(() => getNextClassThreshold(xp), [xp]);
  const progressPct = useMemo(
    () => Math.min(100, Math.round((xp / Math.max(totalXp, 1)) * 100)),
    [xp, totalXp],
  );

  return (
    <div className="bg-[var(--color-surface-card)] border border-[var(--color-surface-card-border)] rounded-xl p-4">
      {/* Class & XP */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-rpg text-[0.55rem] text-text-secondary uppercase tracking-wider">
            Class
          </p>
          <p className="font-display font-bold text-lg text-accent">
            {characterClass}
          </p>
        </div>
        <div className="text-right">
          <p className="font-rpg text-[0.55rem] text-text-secondary uppercase tracking-wider">
            XP
          </p>
          <p className="font-display font-bold text-lg text-text-primary">
            {xp.toLocaleString('en-AU')}
          </p>
        </div>
      </div>

      {/* XP Bar */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full h-4 overflow-hidden mb-2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-hover transition-all duration-700"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {nextClass && (
        <p className="text-xs text-text-secondary mb-3">
          {nextClass.xpNeeded} XP to {nextClass.label}
        </p>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[var(--color-border)]">
        <div className="text-center">
          <p className="font-display font-bold text-xl text-text-primary">
            {answeredCount}
          </p>
          <p className="text-[0.65rem] text-text-secondary uppercase">
            Quests
          </p>
        </div>
        <div className="text-center">
          <p className="font-display font-bold text-xl text-text-primary">
            {totalQuestions - answeredCount}
          </p>
          <p className="text-[0.65rem] text-text-secondary uppercase">
            Remaining
          </p>
        </div>
        <div className="text-center">
          <p className="font-display font-bold text-xl text-text-primary">
            {achievementCount}
          </p>
          <p className="text-[0.65rem] text-text-secondary uppercase">
            Badges
          </p>
        </div>
      </div>
    </div>
  );
});
