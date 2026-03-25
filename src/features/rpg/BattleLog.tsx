import React, { useState, useMemo, useCallback } from 'react';
import { useData } from '@/services/DataContext';
import {
  BATTLE_CATEGORIES,
  BATTLE_CATEGORY_INFO,
  BATTLE_OUTCOMES,
} from '@/types/rpg.types';
import type {
  Battle,
  BattleCategory,
  BattleOutcome,
  BattleDifficulty,
} from '@/types/rpg.types';
import { createBattle, updateBattle } from '@/services/rpg.service';

const INPUT_CLASS =
  'bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg px-3 py-2 text-text-primary font-body text-sm focus:outline-none focus:border-[var(--color-accent)] w-full';

const BUTTON_CLASS =
  'px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-body hover:bg-[var(--color-accent-hover)] transition-colors';

const OUTCOME_COLOURS: Record<BattleOutcome, string> = {
  victory: 'bg-green-600/20 text-green-400 border-green-600/40',
  defeat: 'bg-red-600/20 text-red-400 border-red-600/40',
  draw: 'bg-amber-600/20 text-amber-400 border-amber-600/40',
  ongoing: 'bg-blue-600/20 text-blue-400 border-blue-600/40',
};

const DIFFICULTY_OPTIONS: BattleDifficulty[] = [1, 2, 3, 4, 5];

function formatDateAU(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function renderDifficulty(level: BattleDifficulty): string {
  return '●'.repeat(level) + '○'.repeat(5 - level);
}

interface BattleFormData {
  title: string;
  description: string;
  category: BattleCategory;
  difficulty: BattleDifficulty;
  outcome: BattleOutcome;
  lessonsLearned: string;
  dateStarted: string;
  dateResolved: string;
}

const EMPTY_FORM: BattleFormData = {
  title: '',
  description: '',
  category: 'personal',
  difficulty: 1,
  outcome: 'ongoing',
  lessonsLearned: '',
  dateStarted: new Date().toISOString().split('T')[0] ?? '',
  dateResolved: '',
};

interface BattleCardProps {
  battle: Battle;
  onEdit: (battle: Battle) => void;
  onDelete: (id: string) => void;
}

const BattleCard = React.memo(function BattleCard({
  battle,
  onEdit,
  onDelete,
}: BattleCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const categoryInfo = BATTLE_CATEGORY_INFO[battle.category];

  const handleEdit = useCallback(() => {
    onEdit(battle);
  }, [battle, onEdit]);

  const handleDeleteClick = useCallback(() => {
    setConfirmDelete(true);
  }, []);

  const handleConfirmYes = useCallback(() => {
    onDelete(battle.id);
    setConfirmDelete(false);
  }, [battle.id, onDelete]);

  const handleConfirmNo = useCallback(() => {
    setConfirmDelete(false);
  }, []);

  return (
    <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-text-primary font-display text-lg font-semibold truncate">
            {battle.title}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-1 text-xs font-body px-2 py-0.5 rounded-full bg-[var(--color-surface-card)] border border-[var(--color-border)] text-text-secondary">
              {categoryInfo?.icon && <span>{categoryInfo.icon}</span>}
              {categoryInfo?.label ?? battle.category}
            </span>
            <span
              className={`inline-flex items-center text-xs font-body px-2 py-0.5 rounded-full border ${OUTCOME_COLOURS[battle.outcome]}`}
            >
              {battle.outcome}
            </span>
            <span
              className="text-text-secondary font-rpg text-sm tracking-wider"
              title={`Difficulty ${battle.difficulty}/5`}
            >
              {renderDifficulty(battle.difficulty)}
            </span>
          </div>
        </div>
        <span className="text-text-secondary font-rpg text-sm whitespace-nowrap">
          +{battle.xpEarned} XP
        </span>
      </div>

      {battle.description && (
        <p className="text-text-secondary font-body text-sm line-clamp-2">
          {battle.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-text-secondary font-body">
        <span>
          {formatDateAU(battle.dateStarted)}
          {battle.dateResolved && ` — ${formatDateAU(battle.dateResolved)}`}
        </span>
        <div className="flex items-center gap-2">
          {confirmDelete ? (
            <span className="flex items-center gap-1.5">
              <span className="text-red-400">Remove this battle?</span>
              <button
                type="button"
                onClick={handleConfirmYes}
                className="px-2 py-0.5 rounded bg-red-600/20 text-red-400 hover:bg-red-600/40 transition-colors"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={handleConfirmNo}
                className="px-2 py-0.5 rounded bg-[var(--color-surface-card)] text-text-secondary hover:text-text-primary transition-colors"
              >
                No
              </button>
            </span>
          ) : (
            <>
              <button
                type="button"
                onClick={handleEdit}
                className="px-2 py-1 rounded text-text-secondary hover:text-text-primary hover:bg-[var(--color-input-bg)] transition-colors"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleDeleteClick}
                className="px-2 py-1 rounded text-text-secondary hover:text-red-400 hover:bg-red-600/10 transition-colors"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

function BattleFormSection({
  form,
  onChange,
  onSubmit,
  onCancel,
  isEditing,
}: {
  form: BattleFormData;
  onChange: (field: keyof BattleFormData, value: string | number) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing: boolean;
}) {
  const isOngoing = form.outcome === 'ongoing';

  return (
    <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-4 space-y-4">
      <h3 className="text-text-primary font-display text-lg font-semibold">
        {isEditing ? 'Edit Battle' : 'Log New Battle'}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-text-secondary font-body text-xs mb-1">
            Title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => onChange('title', e.target.value)}
            className={INPUT_CLASS}
            placeholder="What challenge did you face?"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-text-secondary font-body text-xs mb-1">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => onChange('description', e.target.value)}
            className={`${INPUT_CLASS} min-h-[80px] resize-y`}
            placeholder="Describe the challenge..."
          />
        </div>

        <div>
          <label className="block text-text-secondary font-body text-xs mb-1">
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) => onChange('category', e.target.value)}
            className={INPUT_CLASS}
          >
            {BATTLE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {BATTLE_CATEGORY_INFO[cat]?.label ?? cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-text-secondary font-body text-xs mb-1">
            Difficulty
          </label>
          <select
            value={form.difficulty}
            onChange={(e) =>
              onChange('difficulty', Number(e.target.value) as BattleDifficulty)
            }
            className={INPUT_CLASS}
          >
            {DIFFICULTY_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {renderDifficulty(d)} ({d}/5)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-text-secondary font-body text-xs mb-1">
            Outcome
          </label>
          <select
            value={form.outcome}
            onChange={(e) => onChange('outcome', e.target.value)}
            className={INPUT_CLASS}
          >
            {BATTLE_OUTCOMES.map((outcome) => (
              <option key={outcome} value={outcome}>
                {outcome.charAt(0).toUpperCase() + outcome.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-text-secondary font-body text-xs mb-1">
            Date Started
          </label>
          <input
            type="date"
            value={form.dateStarted}
            onChange={(e) => onChange('dateStarted', e.target.value)}
            className={INPUT_CLASS}
          />
        </div>

        <div>
          <label className="block text-text-secondary font-body text-xs mb-1">
            Date Resolved
          </label>
          <input
            type="date"
            value={form.dateResolved}
            onChange={(e) => onChange('dateResolved', e.target.value)}
            className={INPUT_CLASS}
            disabled={isOngoing}
          />
          {isOngoing && (
            <p className="text-text-secondary font-body text-xs mt-1 italic">
              Disabled while outcome is ongoing
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-text-secondary font-body text-xs mb-1">
            Lessons Learnt
          </label>
          <textarea
            value={form.lessonsLearned}
            onChange={(e) => onChange('lessonsLearned', e.target.value)}
            className={`${INPUT_CLASS} min-h-[60px] resize-y`}
            placeholder="What did you take away from this experience?"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button type="button" onClick={onSubmit} className={BUTTON_CLASS}>
          {isEditing ? 'Save Changes' : 'Log Battle'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-text-secondary text-sm font-body hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function BattleLogSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-[var(--color-surface-card)] rounded-lg" />
      <div className="h-10 w-full bg-[var(--color-surface-card)] rounded-lg" />
      {[1, 2, 3].map((i) => (
        <div
          key={`skeleton-${i}`}
          className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-4 space-y-3"
        >
          <div className="h-5 w-2/3 bg-[var(--color-input-bg)] rounded" />
          <div className="flex gap-2">
            <div className="h-4 w-16 bg-[var(--color-input-bg)] rounded-full" />
            <div className="h-4 w-14 bg-[var(--color-input-bg)] rounded-full" />
          </div>
          <div className="h-4 w-full bg-[var(--color-input-bg)] rounded" />
        </div>
      ))}
    </div>
  );
}

export function BattleLog() {
  const { getRPG, setRPG, isLoaded } = useData();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<BattleCategory | null>(null);
  const [form, setForm] = useState<BattleFormData>({ ...EMPTY_FORM });

  const rpgState = getRPG();
  const battles = rpgState?.battles ?? [];

  const totalXP = useMemo(
    () => battles.reduce((sum, b) => sum + b.xpEarned, 0),
    [battles],
  );

  const sortedBattles = useMemo(() => {
    const filtered = activeFilter
      ? battles.filter((b) => b.category === activeFilter)
      : battles;
    return [...filtered].sort(
      (a, b) =>
        new Date(b.dateStarted).getTime() - new Date(a.dateStarted).getTime(),
    );
  }, [battles, activeFilter]);

  const handleFormChange = useCallback(
    (field: keyof BattleFormData, value: string | number) => {
      setForm((prev) => {
        const next = { ...prev, [field]: value };
        if (field === 'outcome' && value === 'ongoing') {
          next.dateResolved = '';
        }
        return next;
      });
    },
    [],
  );

  const handleAdd = useCallback(() => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((battle: Battle) => {
    setEditingId(battle.id);
    setForm({
      title: battle.title,
      description: battle.description,
      category: battle.category,
      difficulty: battle.difficulty,
      outcome: battle.outcome,
      lessonsLearned: battle.lessonsLearned,
      dateStarted: battle.dateStarted,
      dateResolved: battle.dateResolved,
    });
    setShowForm(true);
  }, []);

  const handleCancel = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
  }, []);

  const handleSubmit = useCallback(() => {
    if (!form.title.trim()) return;
    if (!rpgState) return;

    if (editingId) {
      const existing = battles.find((b) => b.id === editingId);
      if (!existing) return;

      const updated = updateBattle(existing, {
        title: form.title,
        description: form.description,
        category: form.category,
        difficulty: form.difficulty,
        outcome: form.outcome,
        lessonsLearned: form.lessonsLearned,
        dateStarted: form.dateStarted,
        dateResolved: form.outcome === 'ongoing' ? '' : form.dateResolved,
      });

      setRPG({
        ...rpgState,
        battles: battles.map((b) => (b.id === editingId ? updated : b)),
      });
    } else {
      const newBattle = createBattle({
        title: form.title,
        description: form.description,
        category: form.category,
        difficulty: form.difficulty,
        outcome: form.outcome,
        lessonsLearned: form.lessonsLearned,
        dateStarted: form.dateStarted,
        dateResolved: form.outcome === 'ongoing' ? '' : form.dateResolved,
      });

      setRPG({
        ...rpgState,
        battles: [...battles, newBattle],
      });
    }

    setShowForm(false);
    setEditingId(null);
    setForm({ ...EMPTY_FORM });
  }, [form, editingId, rpgState, battles, setRPG]);

  const handleDelete = useCallback(
    (id: string) => {
      if (!rpgState) return;
      setRPG({
        ...rpgState,
        battles: battles.filter((b) => b.id !== id),
      });
    },
    [rpgState, battles, setRPG],
  );

  const handleFilterToggle = useCallback((category: BattleCategory) => {
    setActiveFilter((prev) => (prev === category ? null : category));
  }, []);

  if (!isLoaded) {
    return <BattleLogSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-text-primary font-display text-2xl font-bold">
            Battle Log
          </h2>
          <p className="text-text-secondary font-body text-sm mt-0.5">
            Total Battle XP:{' '}
            <span className="font-rpg text-text-primary">{totalXP} XP</span>
          </p>
        </div>
        {!showForm && (
          <button type="button" onClick={handleAdd} className={BUTTON_CLASS}>
            + Log Battle
          </button>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {BATTLE_CATEGORIES.map((cat) => {
          const info = BATTLE_CATEGORY_INFO[cat];
          const isActive = activeFilter === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleFilterToggle(cat)}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-body border transition-colors ${
                isActive
                  ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                  : 'bg-[var(--color-surface-card)] text-text-secondary border-[var(--color-border)] hover:text-text-primary'
              }`}
            >
              {info?.icon && <span>{info.icon}</span>}
              {info?.label ?? cat}
            </button>
          );
        })}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <BattleFormSection
          form={form}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isEditing={editingId !== null}
        />
      )}

      {/* Battle List */}
      {sortedBattles.length === 0 ? (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-8 text-center">
          <p className="text-text-secondary font-body text-sm">
            {activeFilter
              ? 'No battles in this category yet.'
              : 'No battles logged yet. Life throws challenges — start recording how you faced them.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedBattles.map((battle) => (
            <BattleCard
              key={battle.id}
              battle={battle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
