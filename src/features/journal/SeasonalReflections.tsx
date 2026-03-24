import { useState, useMemo, useCallback, memo } from 'react';
import type { Reflection } from '@/types/journal.types';
import { useData } from '@/services/DataContext';

const QUARTER_LABELS: Record<number, string> = {
  1: 'Q1 (Jan\u2013Mar)',
  2: 'Q2 (Apr\u2013Jun)',
  3: 'Q3 (Jul\u2013Sep)',
  4: 'Q4 (Oct\u2013Dec)',
};

function getCurrentQuarter(): 1 | 2 | 3 | 4 {
  const month = new Date().getMonth(); // 0-11
  if (month < 3) return 1;
  if (month < 6) return 2;
  if (month < 9) return 3;
  return 4;
}

function formatDateAU(isoDate: string): string {
  const d = new Date(isoDate);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// --- Skeleton ---
function ReflectionsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)]">
        <div className="skeleton h-6 w-48 mb-4" />
        {[1, 2, 3, 4].map((n) => (
          <div key={`skel-prompt-${n}`} className="mb-4">
            <div className="skeleton h-4 w-64 mb-2" />
            <div className="skeleton h-20 w-full rounded-lg" />
          </div>
        ))}
        <div className="skeleton h-10 w-32 rounded-lg" />
      </div>
      <div className="skeleton h-6 w-40 mt-8 mb-4" />
      {[1, 2].map((n) => (
        <div key={`skel-past-${n}`} className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)]">
          <div className="skeleton h-5 w-32 mb-3" />
          <div className="skeleton h-4 w-full mb-2" />
          <div className="skeleton h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

// --- Past Reflection Card ---
interface PastReflectionCardProps {
  reflection: Reflection;
  onDelete: (id: string) => void;
}

const PastReflectionCard = memo(function PastReflectionCard({
  reflection,
  onDelete,
}: PastReflectionCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleDeleteClick = useCallback(() => setConfirmingDelete(true), []);
  const handleConfirmDelete = useCallback(() => {
    onDelete(reflection.id);
    setConfirmingDelete(false);
  }, [onDelete, reflection.id]);
  const handleCancelDelete = useCallback(() => setConfirmingDelete(false), []);

  const sections = useMemo(
    () => [
      { label: 'What went well', value: reflection.wentWell },
      { label: 'What was challenging', value: reflection.challenging },
      { label: 'Grateful for', value: reflection.grateful },
      { label: 'Focus going forward', value: reflection.focus },
    ],
    [reflection],
  );

  return (
    <div className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)] transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h4 className="font-display font-semibold text-text-primary">
            {QUARTER_LABELS[reflection.quarter]} {reflection.year}
          </h4>
          <p className="text-xs text-text-secondary font-body mt-0.5">
            Saved {formatDateAU(reflection.updatedAt)}
          </p>
        </div>

        {!confirmingDelete ? (
          <button
            onClick={handleDeleteClick}
            className="text-text-secondary hover:text-red-400 transition-colors text-sm px-2 py-1 rounded shrink-0"
            aria-label="Delete reflection"
          >
            Delete
          </button>
        ) : (
          <span className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleConfirmDelete}
              className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={handleCancelDelete}
              className="text-xs px-2 py-1 text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
          </span>
        )}
      </div>

      <div className="space-y-3">
        {sections.map((section) =>
          section.value.trim() ? (
            <div key={`${reflection.id}-${section.label}`}>
              <p className="text-xs font-body text-accent font-medium mb-0.5">
                {section.label}
              </p>
              <p className="text-text-secondary font-body text-sm leading-relaxed whitespace-pre-wrap">
                {section.value}
              </p>
            </div>
          ) : null,
        )}
      </div>
    </div>
  );
});

// --- Main Component ---
export function SeasonalReflections() {
  const { getReflections, setReflections: setReflectionsInContext, isLoaded } = useData();

  // Current reflection form state
  const [wentWell, setWentWell] = useState('');
  const [challenging, setChallenging] = useState('');
  const [grateful, setGrateful] = useState('');
  const [focus, setFocus] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [hasPreFilled, setHasPreFilled] = useState(false);

  const currentQuarter = useMemo(() => getCurrentQuarter(), []);
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  const reflections = isLoaded ? getReflections() : [];

  // Pre-fill if a reflection for the current quarter already exists
  if (isLoaded && !hasPreFilled) {
    const existing = reflections.find(
      (r) => r.quarter === currentQuarter && r.year === currentYear,
    );
    if (existing) {
      setWentWell(existing.wentWell);
      setChallenging(existing.challenging);
      setGrateful(existing.grateful);
      setFocus(existing.focus);
    }
    setHasPreFilled(true);
  }

  // Past reflections (excluding current quarter), newest first
  const pastReflections = useMemo(
    () =>
      reflections
        .filter((r) => !(r.quarter === currentQuarter && r.year === currentYear))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [reflections, currentQuarter, currentYear],
  );

  const handleSave = useCallback(() => {
    const now = new Date().toISOString();
    const existingIdx = reflections.findIndex(
      (r) => r.quarter === currentQuarter && r.year === currentYear,
    );

    let updated: Reflection[];
    if (existingIdx >= 0) {
      const existing = reflections[existingIdx] as Reflection;
      updated = [...reflections];
      updated[existingIdx] = {
        id: existing.id,
        quarter: existing.quarter,
        year: existing.year,
        createdAt: existing.createdAt,
        wentWell,
        challenging,
        grateful,
        focus,
        updatedAt: now,
      };
    } else {
      const newReflection: Reflection = {
        id: crypto.randomUUID(),
        quarter: currentQuarter,
        year: currentYear,
        wentWell,
        challenging,
        grateful,
        focus,
        createdAt: now,
        updatedAt: now,
      };
      updated = [...reflections, newReflection];
    }

    setReflectionsInContext(updated);
    setSaveMessage('Reflection saved');

    const timer = setTimeout(() => setSaveMessage(''), 2000);
    return () => clearTimeout(timer);
  }, [reflections, currentQuarter, currentYear, wentWell, challenging, grateful, focus, setReflectionsInContext]);

  const handleDelete = useCallback(
    (id: string) => {
      const updated = reflections.filter((r) => r.id !== id);
      setReflectionsInContext(updated);
    },
    [reflections, setReflectionsInContext],
  );

  const textareaClasses =
    'w-full rounded-lg px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] text-text-primary font-body text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 min-h-[80px] resize-y';

  if (!isLoaded) {
    return (
      <div className="p-6">
        <div className="skeleton h-8 w-56 mb-2" />
        <div className="skeleton h-4 w-80 mb-6" />
        <ReflectionsSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-display font-bold text-text-primary mb-2">
        Seasonal Reflections
      </h2>
      <p className="text-text-secondary font-body text-sm mb-6">
        Pause at the turn of each quarter. Look back at what shaped the last few months,
        and set your heading for the ones ahead.
      </p>

      {/* Current quarter form */}
      <div className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)] mb-8">
        <h3 className="font-display font-bold text-lg text-text-primary mb-1">
          {QUARTER_LABELS[currentQuarter]} {currentYear}
        </h3>
        <p className="text-text-secondary font-body text-xs mb-5">
          Your reflection for the current quarter. You can update this anytime before the quarter ends.
        </p>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-body text-accent font-medium mb-1.5">
              What went well this quarter?
            </label>
            <textarea
              value={wentWell}
              onChange={(e) => setWentWell(e.target.value)}
              className={textareaClasses}
              placeholder="Wins, progress, pleasant surprises — the things that left a warm residue."
            />
          </div>

          <div>
            <label className="block text-sm font-body text-accent font-medium mb-1.5">
              What was challenging?
            </label>
            <textarea
              value={challenging}
              onChange={(e) => setChallenging(e.target.value)}
              className={textareaClasses}
              placeholder="Friction, setbacks, things that felt like walking uphill into a Brisbane headwind."
            />
          </div>

          <div>
            <label className="block text-sm font-body text-accent font-medium mb-1.5">
              What are you grateful for?
            </label>
            <textarea
              value={grateful}
              onChange={(e) => setGrateful(e.target.value)}
              className={textareaClasses}
              placeholder="People, moments, small things — what felt solid and grounding."
            />
          </div>

          <div>
            <label className="block text-sm font-body text-accent font-medium mb-1.5">
              What do you want to focus on next?
            </label>
            <textarea
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              className={textareaClasses}
              placeholder="One or two things to carry forward — direction, not a to-do list."
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white font-body text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Save Reflection
            </button>
            {saveMessage && (
              <span className="text-sm text-accent font-body">{saveMessage}</span>
            )}
          </div>
        </div>
      </div>

      {/* Past reflections */}
      {pastReflections.length > 0 && (
        <div>
          <h3 className="font-display font-bold text-lg text-text-primary mb-4">
            Past Reflections
          </h3>
          <div className="space-y-4">
            {pastReflections.map((reflection) => (
              <PastReflectionCard
                key={reflection.id}
                reflection={reflection}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
