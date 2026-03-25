import { useState, useMemo, useCallback } from 'react';
import { useData } from '@/services/DataContext';
import { computeLifeXP } from '@/services/rpg.service';
import { CharacterDesigner } from './CharacterDesigner';
import { BattleLog } from './BattleLog';
import { TalentTree } from './TalentTree';

type RPGTab = 'overview' | 'character' | 'battles' | 'talents';

function DashboardSkeleton() {
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="skeleton h-8 w-48 mb-2" />
      <div className="skeleton h-4 w-64 mb-6" />
      <div className="rounded-xl p-6 bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-4">
        <div className="skeleton h-6 w-32" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-full" />
      </div>
    </div>
  );
}

export function RPGDashboard() {
  const { isLoaded, getRPG, getChronicle } = useData();
  const [activeTab, setActiveTab] = useState<RPGTab>('overview');

  const rpg = getRPG();
  const chronicle = getChronicle();

  const xpBreakdown = useMemo(
    () => computeLifeXP(rpg, chronicle.xp),
    [rpg, chronicle.xp],
  );

  const maxSegment = useMemo(
    () =>
      Math.max(
        xpBreakdown.ageXP,
        xpBreakdown.chronicleXP,
        xpBreakdown.battleXP,
        xpBreakdown.talentXP,
        xpBreakdown.archetypeBonus,
        1,
      ),
    [xpBreakdown],
  );

  const handleTabChange = useCallback((tab: RPGTab) => {
    setActiveTab(tab);
  }, []);

  if (!isLoaded) return <DashboardSkeleton />;

  const tabs: { id: RPGTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'character', label: 'Character' },
    { id: 'battles', label: 'Battles' },
    { id: 'talents', label: 'Talents' },
  ];

  if (activeTab === 'character') {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="px-4 pt-4">
          <TabBar tabs={tabs} active={activeTab} onChange={handleTabChange} />
        </div>
        <CharacterDesigner />
      </div>
    );
  }
  if (activeTab === 'battles') {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="px-4 pt-4">
          <TabBar tabs={tabs} active={activeTab} onChange={handleTabChange} />
        </div>
        <BattleLog />
      </div>
    );
  }
  if (activeTab === 'talents') {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="px-4 pt-4">
          <TabBar tabs={tabs} active={activeTab} onChange={handleTabChange} />
        </div>
        <TalentTree />
      </div>
    );
  }

  // Overview tab
  const characterName = rpg.character.name || 'Unnamed Hero';
  const characterTitle = rpg.character.title
    ? ` — ${rpg.character.title}`
    : '';

  return (
    <div className="p-4 max-w-3xl mx-auto pb-8">
      {/* Tab navigation */}
      <TabBar tabs={tabs} active={activeTab} onChange={handleTabChange} />

      {/* Character header */}
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-text-primary">
          {characterName}
          <span className="text-text-secondary font-normal text-lg">
            {characterTitle}
          </span>
        </h2>
        {rpg.character.archetype && (
          <p className="font-rpg text-xs text-accent mt-1">
            {rpg.character.archetype.toUpperCase()}
          </p>
        )}
        {rpg.character.motto && (
          <p className="text-sm text-text-secondary italic mt-1 font-body">
            &ldquo;{rpg.character.motto}&rdquo;
          </p>
        )}
      </div>

      {/* Life progress bar */}
      <div className="bg-[var(--color-surface-card)] border border-[var(--color-surface-card-border)] rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-rpg text-[0.55rem] text-text-secondary uppercase tracking-wider">
              Life Progress
            </p>
            <p className="font-display font-bold text-lg text-text-primary">
              {xpBreakdown.lifeProgress}% of expected {rpg.expectedLifespan} years
            </p>
          </div>
          <div className="text-right">
            <p className="font-rpg text-[0.55rem] text-text-secondary uppercase tracking-wider">
              Level {xpBreakdown.level}
            </p>
            <p className="font-display font-bold text-lg text-accent">
              {xpBreakdown.levelLabel}
            </p>
          </div>
        </div>

        {/* Main XP bar */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full h-5 overflow-hidden mb-2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-accent-hover transition-all duration-700"
            style={{
              width: `${
                xpBreakdown.nextLevelXP
                  ? Math.min(
                      100,
                      Math.round(
                        (xpBreakdown.totalXP / xpBreakdown.nextLevelXP) * 100,
                      ),
                    )
                  : 100
              }%`,
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm font-body text-text-primary font-semibold">
            {xpBreakdown.totalXP.toLocaleString('en-AU')} XP
          </p>
          {xpBreakdown.nextLevelXP && (
            <p className="text-xs text-text-secondary font-body">
              {(xpBreakdown.nextLevelXP - xpBreakdown.totalXP).toLocaleString(
                'en-AU',
              )}{' '}
              XP to next level
            </p>
          )}
        </div>
      </div>

      {/* XP Breakdown */}
      <div className="bg-[var(--color-surface-card)] border border-[var(--color-surface-card-border)] rounded-xl p-5 mb-6">
        <h3 className="font-display font-semibold text-text-primary mb-4">
          XP Breakdown
        </h3>
        <div className="space-y-3">
          <XPRow
            label="Years Lived"
            value={xpBreakdown.ageXP}
            max={maxSegment}
            colour="var(--color-accent)"
          />
          <XPRow
            label="Chronicle"
            value={xpBreakdown.chronicleXP}
            max={maxSegment}
            colour="#3b82f6"
          />
          <XPRow
            label="Battles"
            value={xpBreakdown.battleXP}
            max={maxSegment}
            colour="#ef4444"
          />
          <XPRow
            label="Talents"
            value={xpBreakdown.talentXP}
            max={maxSegment}
            colour="#10b981"
          />
          {xpBreakdown.archetypeBonus > 0 && (
            <XPRow
              label="Archetype"
              value={xpBreakdown.archetypeBonus}
              max={maxSegment}
              colour="#a855f7"
            />
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setActiveTab('character')}
          className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-4 text-center hover:border-[var(--color-accent)] transition-colors"
        >
          <p className="font-display font-bold text-xl text-text-primary">
            {rpg.character.traits.length}
          </p>
          <p className="text-[0.65rem] text-text-secondary uppercase font-body">
            Traits
          </p>
        </button>
        <button
          onClick={() => setActiveTab('battles')}
          className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-4 text-center hover:border-[var(--color-accent)] transition-colors"
        >
          <p className="font-display font-bold text-xl text-text-primary">
            {rpg.battles.length}
          </p>
          <p className="text-[0.65rem] text-text-secondary uppercase font-body">
            Battles
          </p>
        </button>
        <button
          onClick={() => setActiveTab('talents')}
          className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-4 text-center hover:border-[var(--color-accent)] transition-colors"
        >
          <p className="font-display font-bold text-xl text-text-primary">
            {rpg.talents.length}
          </p>
          <p className="text-[0.65rem] text-text-secondary uppercase font-body">
            Talents
          </p>
        </button>
      </div>
    </div>
  );
}

// --- Sub-components ---

function XPRow({
  label,
  value,
  max,
  colour,
}: {
  label: string;
  value: number;
  max: number;
  colour: string;
}) {
  const pct = max > 0 ? Math.max(2, (value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-text-secondary font-body w-20 text-right shrink-0">
        {label}
      </span>
      <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full h-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: colour }}
        />
      </div>
      <span className="text-xs text-text-primary font-body w-16 tabular-nums text-right">
        {value.toLocaleString('en-AU')}
      </span>
    </div>
  );
}

function TabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: RPGTab; label: string }[];
  active: RPGTab;
  onChange: (tab: RPGTab) => void;
}) {
  return (
    <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2 rounded-lg text-sm font-body whitespace-nowrap transition-colors ${
            active === tab.id
              ? 'bg-[var(--color-accent)] text-white font-medium'
              : 'text-text-secondary hover:text-text-primary hover:bg-[var(--color-surface-alt)]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
