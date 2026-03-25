import React, { useState, useMemo, useCallback } from 'react';
import { useData } from '@/services/DataContext';
import {
  TALENT_CATEGORIES,
  TALENT_CATEGORY_INFO,
  TALENT_LEVEL_LABELS,
} from '@/types/rpg.types';
import type { Talent, TalentCategory, TalentLevel } from '@/types/rpg.types';
import { createTalent, updateTalent } from '@/services/rpg.service';

const TALENT_XP: Record<TalentLevel, number> = {
  1: 20,
  2: 50,
  3: 100,
  4: 180,
  5: 300,
};

const LEVEL_OPTIONS: TalentLevel[] = [1, 2, 3, 4, 5];

type FilterCategory = 'all' | TalentCategory;

interface TalentFormData {
  name: string;
  category: TalentCategory;
  level: TalentLevel;
  description: string;
  dateAcquired: string;
}

const emptyForm: TalentFormData = {
  name: '',
  category: 'skill',
  level: 1,
  description: '',
  dateAcquired: new Date().toISOString().split('T')[0] ?? '',
};

function formatDateAU(dateStr: string): string {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function renderLevelSegments(level: TalentLevel): string {
  return '■'.repeat(level) + '□'.repeat(5 - level);
}

const inputClasses =
  'bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg px-3 py-2 text-text-primary font-body text-sm focus:outline-none focus:border-[var(--color-accent)] w-full';

interface TalentCardProps {
  talent: Talent;
  onEdit: (talent: Talent) => void;
  onDelete: (id: string) => void;
}

const TalentCard = React.memo(function TalentCard({
  talent,
  onEdit,
  onDelete,
}: TalentCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleDelete = useCallback(() => {
    if (confirmingDelete) {
      onDelete(talent.id);
      setConfirmingDelete(false);
    } else {
      setConfirmingDelete(true);
    }
  }, [confirmingDelete, onDelete, talent.id]);

  const handleCancelDelete = useCallback(() => {
    setConfirmingDelete(false);
  }, []);

  const handleEdit = useCallback(() => {
    onEdit(talent);
  }, [onEdit, talent]);

  const categoryInfo = TALENT_CATEGORY_INFO[talent.category];

  return (
    <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg shrink-0" aria-label={categoryInfo.label}>
            {categoryInfo.icon}
          </span>
          <h4 className="font-display text-text-primary text-base font-semibold truncate">
            {talent.name}
          </h4>
        </div>
        <span className="shrink-0 text-xs font-rpg bg-[var(--color-accent)]/15 text-[var(--color-accent)] px-2 py-0.5 rounded-full whitespace-nowrap">
          Lv.{talent.level} {TALENT_LEVEL_LABELS[talent.level]}
        </span>
      </div>

      <div className="flex items-center gap-1.5 font-rpg text-sm text-[var(--color-accent)]" title={`Level ${talent.level} of 5`}>
        <span className="tracking-widest">{renderLevelSegments(talent.level)}</span>
      </div>

      {talent.description && (
        <p className="text-text-secondary font-body text-sm leading-relaxed">
          {talent.description}
        </p>
      )}

      <div className="text-text-secondary font-body text-xs mt-auto">
        Acquired {formatDateAU(talent.dateAcquired)}
      </div>

      <div className="flex items-center gap-2 mt-1 pt-2 border-t border-[var(--color-border)]">
        <button
          onClick={handleEdit}
          className="text-xs font-body text-[var(--color-accent)] hover:underline"
        >
          Edit
        </button>
        {confirmingDelete ? (
          <>
            <span className="text-xs font-body text-red-400">Delete this talent?</span>
            <button
              onClick={handleDelete}
              className="text-xs font-body text-red-400 font-semibold hover:underline"
            >
              Confirm
            </button>
            <button
              onClick={handleCancelDelete}
              className="text-xs font-body text-text-secondary hover:underline"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={handleDelete}
            className="text-xs font-body text-red-400 hover:underline"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
});

function TalentTreeSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-[var(--color-surface-card)] rounded-lg" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-24 bg-[var(--color-surface-card)] rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-40 bg-[var(--color-surface-card)] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function TalentTree() {
  const { getRPG, setRPG, isLoaded } = useData();
  const [filter, setFilter] = useState<FilterCategory>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTalent, setEditingTalent] = useState<Talent | null>(null);
  const [formData, setFormData] = useState<TalentFormData>(emptyForm);

  const rpg = getRPG();
  const talents: Talent[] = rpg?.talents ?? [];

  const totalXP = useMemo(
    () => talents.reduce((sum, t) => sum + TALENT_XP[t.level], 0),
    [talents],
  );

  const filteredTalents = useMemo(
    () => (filter === 'all' ? talents : talents.filter((t) => t.category === filter)),
    [talents, filter],
  );

  const groupedTalents = useMemo(() => {
    const groups: Record<TalentCategory, Talent[]> = {
      skill: [],
      certificate: [],
      interest: [],
    };
    for (const talent of filteredTalents) {
      groups[talent.category].push(talent);
    }
    return groups;
  }, [filteredTalents]);

  const filterCounts = useMemo(() => {
    const counts: Record<FilterCategory, number> = { all: talents.length, skill: 0, certificate: 0, interest: 0 };
    for (const t of talents) {
      counts[t.category]++;
    }
    return counts;
  }, [talents]);

  const handleFilterChange = useCallback((cat: FilterCategory) => {
    setFilter(cat);
  }, []);

  const handleOpenAdd = useCallback(() => {
    setEditingTalent(null);
    setFormData(emptyForm);
    setShowForm(true);
  }, []);

  const handleOpenEdit = useCallback((talent: Talent) => {
    setEditingTalent(talent);
    setFormData({
      name: talent.name,
      category: talent.category,
      level: talent.level,
      description: talent.description,
      dateAcquired: talent.dateAcquired,
    });
    setShowForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setEditingTalent(null);
    setFormData(emptyForm);
  }, []);

  const handleFormChange = useCallback(
    (field: keyof TalentFormData, value: string | TalentCategory | TalentLevel) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!rpg) return;

      if (editingTalent) {
        const updated = updateTalent(editingTalent, {
          name: formData.name,
          category: formData.category,
          level: formData.level,
          description: formData.description,
          dateAcquired: formData.dateAcquired,
        });
        setRPG({
          ...rpg,
          talents: rpg.talents.map((t) => (t.id === updated.id ? updated : t)),
        });
      } else {
        const newTalent = createTalent({
          name: formData.name,
          category: formData.category,
          level: formData.level,
          description: formData.description,
          dateAcquired: formData.dateAcquired,
        });
        setRPG({
          ...rpg,
          talents: [...(rpg.talents ?? []), newTalent],
        });
      }

      handleCloseForm();
    },
    [rpg, editingTalent, formData, setRPG, handleCloseForm],
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (!rpg) return;
      setRPG({
        ...rpg,
        talents: rpg.talents.filter((t) => t.id !== id),
      });
    },
    [rpg, setRPG],
  );

  if (!isLoaded) {
    return <TalentTreeSkeleton />;
  }

  const filterChips: { key: FilterCategory; label: string }[] = [
    { key: 'all', label: 'All' },
    ...TALENT_CATEGORIES.map((cat) => ({
      key: cat as FilterCategory,
      label: `${TALENT_CATEGORY_INFO[cat].icon} ${TALENT_CATEGORY_INFO[cat].label}s`,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-text-primary text-2xl font-bold">Talent Tree</h2>
          <p className="text-text-secondary font-body text-sm mt-1">
            {talents.length} talent{talents.length !== 1 ? 's' : ''} &middot;{' '}
            {totalXP.toLocaleString('en-AU')} XP
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-[var(--color-accent)] text-white font-body text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          + Add Talent
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {filterChips.map((chip) => (
          <button
            key={chip.key}
            onClick={() => handleFilterChange(chip.key)}
            className={`font-body text-sm px-3 py-1.5 rounded-full border transition-colors ${
              filter === chip.key
                ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                : 'bg-[var(--color-surface-card)] text-text-secondary border-[var(--color-border)] hover:border-[var(--color-accent)]'
            }`}
          >
            {chip.label} ({filterCounts[chip.key]})
          </button>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-5">
          <h3 className="font-display text-text-primary text-lg font-semibold mb-4">
            {editingTalent ? 'Edit Talent' : 'Add New Talent'}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-text-secondary font-body text-xs font-semibold uppercase tracking-wide">
                Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                placeholder="e.g. TypeScript, First Aid Certificate"
                className={inputClasses}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-text-secondary font-body text-xs font-semibold uppercase tracking-wide">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleFormChange('category', e.target.value as TalentCategory)}
                className={inputClasses}
              >
                {TALENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {TALENT_CATEGORY_INFO[cat].icon} {TALENT_CATEGORY_INFO[cat].label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-text-secondary font-body text-xs font-semibold uppercase tracking-wide">
                Level
              </label>
              <select
                value={formData.level}
                onChange={(e) => handleFormChange('level', Number(e.target.value) as TalentLevel)}
                className={inputClasses}
              >
                {LEVEL_OPTIONS.map((lv) => (
                  <option key={lv} value={lv}>
                    Lv.{lv} — {TALENT_LEVEL_LABELS[lv]} ({TALENT_XP[lv]} XP)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-text-secondary font-body text-xs font-semibold uppercase tracking-wide">
                Date Acquired
              </label>
              <input
                type="date"
                required
                value={formData.dateAcquired}
                onChange={(e) => handleFormChange('dateAcquired', e.target.value)}
                className={inputClasses}
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-text-secondary font-body text-xs font-semibold uppercase tracking-wide">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="What does this talent involve? How did you develop it?"
                rows={3}
                className={inputClasses}
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="bg-[var(--color-accent)] text-white font-body text-sm font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                {editingTalent ? 'Save Changes' : 'Add Talent'}
              </button>
              <button
                type="button"
                onClick={handleCloseForm}
                className="text-text-secondary font-body text-sm hover:underline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Empty State */}
      {talents.length === 0 && !showForm && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-8 text-center">
          <p className="text-text-secondary font-body text-sm leading-relaxed max-w-md mx-auto">
            No talents recorded yet. Skills, certificates, interests — every ability you've built
            deserves a spot on the tree.
          </p>
        </div>
      )}

      {/* Grouped Talent Cards */}
      {filteredTalents.length > 0 && (
        <div className="space-y-8">
          {(Object.keys(groupedTalents) as TalentCategory[]).map((category) => {
            const group = groupedTalents[category];
            if (group.length === 0) return null;
            const info = TALENT_CATEGORY_INFO[category];
            return (
              <section key={category}>
                <h3 className="font-display text-text-primary text-lg font-semibold mb-3 flex items-center gap-2">
                  <span>{info.icon}</span>
                  {info.label}s
                  <span className="text-text-secondary font-body text-sm font-normal">
                    ({group.length})
                  </span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.map((talent) => (
                    <TalentCard
                      key={talent.id}
                      talent={talent}
                      onEdit={handleOpenEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Filtered empty state */}
      {filteredTalents.length === 0 && talents.length > 0 && (
        <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-8 text-center">
          <p className="text-text-secondary font-body text-sm">
            No talents in this category yet.
          </p>
        </div>
      )}
    </div>
  );
}
