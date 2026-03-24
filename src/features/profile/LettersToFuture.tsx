import { useState, useCallback, useEffect, useMemo, memo } from 'react';
import { useData } from '@/services/DataContext';
import type { LetterToFuture } from '@/types/journal.types';

function formatDateAU(isoDate: string): string {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function isUnlockable(unlockDate: string): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const unlock = new Date(unlockDate);
  unlock.setHours(0, 0, 0, 0);
  return now >= unlock;
}

function LettersSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((n) => (
        <div
          key={`letter-skel-${n}`}
          className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)]"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="skeleton h-4 w-40" />
            <div className="skeleton h-5 w-20 rounded-full" />
          </div>
          <div className="skeleton h-3 w-full mb-2" />
          <div className="skeleton h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}

interface LetterCardProps {
  letter: LetterToFuture;
  onDelete: (id: string) => void;
}

const LetterCard = memo(function LetterCard({ letter, onDelete }: LetterCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleDeleteClick = useCallback(() => {
    setConfirmingDelete(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    onDelete(letter.id);
    setConfirmingDelete(false);
  }, [onDelete, letter.id]);

  const handleCancelDelete = useCallback(() => {
    setConfirmingDelete(false);
  }, []);

  const isSealed = !letter.isUnlocked;

  return (
    <div
      className={`rounded-xl p-5 bg-[var(--color-surface-card)] border-2 transition-colors ${
        isSealed
          ? 'border-[var(--color-border)] opacity-80'
          : 'border-[var(--color-accent)]'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-secondary font-body">
              Written: {formatDateAU(letter.createdAt)}
            </span>
            <span
              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-body font-medium ${
                isSealed
                  ? 'bg-[var(--color-surface-alt)] text-text-secondary'
                  : 'bg-[var(--color-accent)] text-white'
              }`}
            >
              {isSealed ? 'Sealed' : 'Unlocked'}
            </span>
          </div>
          <p className="text-xs text-text-secondary font-body mt-1">
            {isSealed
              ? `Unlocks: ${formatDateAU(letter.unlockDate)}`
              : `Unlocked on: ${formatDateAU(letter.unlockDate)}`}
          </p>
        </div>

        <div>
          {confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary font-body">Delete?</span>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-2 py-1 rounded text-xs bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={handleCancelDelete}
                className="px-2 py-1 rounded text-xs bg-[var(--color-surface-alt)] text-text-secondary hover:text-text-primary transition-colors"
              >
                No
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleDeleteClick}
              className="text-text-secondary hover:text-red-500 transition-colors text-sm"
              aria-label="Delete letter"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {isSealed ? (
        <div className="rounded-lg p-4 bg-[var(--color-surface-alt)] border border-[var(--color-border)]">
          <p className="text-sm text-text-secondary font-body italic text-center">
            This letter is sealed. Its contents will be revealed when the unlock date arrives.
          </p>
        </div>
      ) : (
        <div className="mt-2">
          <p className="text-sm text-text-primary font-body leading-relaxed whitespace-pre-wrap">
            {letter.content}
          </p>
        </div>
      )}
    </div>
  );
});

export function LettersToFuture() {
  const { isLoaded, getLetters, setLetters } = useData();
  const letters = getLetters();
  const [showForm, setShowForm] = useState(false);
  const [formContent, setFormContent] = useState('');
  const [formUnlockDate, setFormUnlockDate] = useState('');

  // Auto-unlock any letters that have reached their date
  useEffect(() => {
    if (!isLoaded) return;
    let changed = false;
    const updated = letters.map((letter) => {
      if (!letter.isUnlocked && isUnlockable(letter.unlockDate)) {
        changed = true;
        return { ...letter, isUnlocked: true };
      }
      return letter;
    });
    if (changed) {
      setLetters(updated);
    }
  }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const sortedLetters = useMemo(
    () => [...letters].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [letters],
  );

  const resetForm = useCallback(() => {
    setFormContent('');
    setFormUnlockDate('');
    setShowForm(false);
  }, []);

  const handleAddLetter = useCallback(() => {
    if (!formContent.trim() || !formUnlockDate) return;

    const newLetter: LetterToFuture = {
      id: crypto.randomUUID(),
      content: formContent.trim(),
      unlockDate: formUnlockDate,
      createdAt: new Date().toISOString(),
      isUnlocked: isUnlockable(formUnlockDate),
    };

    const updated = [newLetter, ...letters];
    setLetters(updated);
    resetForm();
  }, [formContent, formUnlockDate, letters, setLetters, resetForm]);

  const handleDelete = useCallback((id: string) => {
    const updated = letters.filter((l) => l.id !== id);
    setLetters(updated);
  }, [letters, setLetters]);

  // Minimum date for the date picker: tomorrow
  const minDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }, []);

  if (!isLoaded) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-display font-bold text-text-primary mb-6">
          Letters to the Future
        </h2>
        <LettersSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold text-text-primary">
          Letters to the Future
        </h2>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-body hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            Write New Letter
          </button>
        )}
      </div>

      {/* Write Letter Form */}
      {showForm && (
        <div className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-accent)] mb-6 space-y-4">
          <h3 className="text-lg font-display font-semibold text-text-primary">
            Write to Your Future Self
          </h3>
          <p className="text-sm text-text-secondary font-body">
            Think about the weight of the pen in your hand, the texture of today pressed into words.
            What does right now feel like — the temperature of the room, the hum of your thoughts,
            the rhythm of this particular Tuesday or Sunday? Seal it for the future.
          </p>

          <div>
            <label className="block text-xs text-text-secondary font-body uppercase tracking-wider mb-1">
              Your Letter
            </label>
            <textarea
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="Dear future me — here is what today feels like..."
              rows={8}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary font-body text-sm focus:outline-none focus:border-[var(--color-accent)] resize-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs text-text-secondary font-body uppercase tracking-wider mb-1">
              Unlock Date
            </label>
            <input
              type="date"
              value={formUnlockDate}
              min={minDate}
              onChange={(e) => setFormUnlockDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary font-body text-sm focus:outline-none focus:border-[var(--color-accent)]"
            />
            <p className="text-xs text-text-secondary font-body mt-1">
              The letter will stay sealed until this date passes.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleAddLetter}
              disabled={!formContent.trim() || !formUnlockDate}
              className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-body hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Seal Letter
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-lg bg-[var(--color-surface-alt)] text-text-secondary text-sm font-body hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Letters List */}
      {sortedLetters.length === 0 ? (
        <div className="rounded-xl p-8 bg-[var(--color-surface-card)] border border-[var(--color-border)] text-center">
          <p className="text-text-secondary font-body text-lg mb-3">
            No letters written yet
          </p>
          <p className="text-text-secondary font-body text-sm max-w-md mx-auto leading-relaxed">
            Capture the texture of today — the warmth of your coffee mug, the sound of
            traffic outside, the specific ache or contentment sitting in your chest right now.
            Seal it for a future version of yourself to open and feel again.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedLetters.map((letter) => (
            <LetterCard
              key={letter.id}
              letter={letter}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
