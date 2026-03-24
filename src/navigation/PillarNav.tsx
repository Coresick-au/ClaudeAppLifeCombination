import { memo, useCallback } from 'react';
import type { Pillar } from '@/types/shared.types';
import { PILLARS } from './pillarConfig';

interface PillarNavProps {
  activePillar: Pillar;
  onPillarChange: (pillar: Pillar) => void;
}

export const PillarNav = memo(function PillarNav({
  activePillar,
  onPillarChange,
}: PillarNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-nav-bg)] border-t border-[var(--color-border)]">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {PILLARS.map((pillar) => (
          <PillarButton
            key={pillar.id}
            id={pillar.id}
            label={pillar.label}
            icon={pillar.icon}
            isActive={activePillar === pillar.id}
            onClick={onPillarChange}
          />
        ))}
      </div>
    </nav>
  );
});

interface PillarButtonProps {
  id: Pillar;
  label: string;
  icon: string;
  isActive: boolean;
  onClick: (pillar: Pillar) => void;
}

const PillarButton = memo(function PillarButton({
  id,
  label,
  icon,
  isActive,
  onClick,
}: PillarButtonProps) {
  const handleClick = useCallback(() => onClick(id), [onClick, id]);

  return (
    <button
      onClick={handleClick}
      className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-[var(--color-nav-active)] text-accent'
          : 'text-text-secondary hover:text-text-primary'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
});
