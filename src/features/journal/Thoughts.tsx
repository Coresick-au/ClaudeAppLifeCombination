import { useState, useCallback, useEffect, useMemo, memo } from 'react';
import type { ThoughtType } from '../../types/journal.types';

interface ThoughtLocal {
  id: string;
  type: ThoughtType;
  content: string;
  createdAt: string; // ISO string for localStorage
}

const THOUGHT_TYPES: { value: ThoughtType; label: string; colour: string }[] = [
  { value: 'thought', label: 'Thought', colour: '#8b5cf6' },
  { value: 'pondering', label: 'Pondering', colour: '#6366f1' },
  { value: 'note', label: 'Note', colour: '#06b6d4' },
  { value: 'question', label: 'Question', colour: '#f59e0b' },
  { value: 'idea', label: 'Idea', colour: '#10b981' },
];

function getTypeConfig(type: ThoughtType) {
  return THOUGHT_TYPES.find((t) => t.value === type) ?? { value: type, label: type, colour: '#8b5cf6' };
}

function relativeTimestamp(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffSeconds = Math.floor((now - then) / 1000);

  if (diffSeconds < 60) return 'just now';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
}

function loadThoughts(): ThoughtLocal[] {
  try {
    const raw = localStorage.getItem('life-os-thoughts');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveThoughts(thoughts: ThoughtLocal[]): void {
  localStorage.setItem('life-os-thoughts', JSON.stringify(thoughts));
}

// --- Skeleton ---
function ThoughtsSkeleton() {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
      {[1, 2, 3, 4, 5].map((n) => (
        <div
          key={`skel-${n}`}
          className="break-inside-avoid rounded-xl p-4 bg-[var(--color-surface-card)] border border-[var(--color-border)]"
        >
          <div className="skeleton h-5 w-20 mb-3 rounded-full" />
          <div className="skeleton h-4 w-full mb-2" />
          <div className="skeleton h-4 w-3/4 mb-3" />
          <div className="skeleton h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

// --- Thought Card ---
interface ThoughtCardProps {
  thought: ThoughtLocal;
  onDelete: (id: string) => void;
}

const ThoughtCard = memo(function ThoughtCard({ thought, onDelete }: ThoughtCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const typeConfig = useMemo(() => getTypeConfig(thought.type), [thought.type]);
  const timeAgo = useMemo(() => relativeTimestamp(thought.createdAt), [thought.createdAt]);

  const handleDeleteClick = useCallback(() => setConfirmingDelete(true), []);
  const handleConfirmDelete = useCallback(() => {
    onDelete(thought.id);
    setConfirmingDelete(false);
  }, [onDelete, thought.id]);
  const handleCancelDelete = useCallback(() => setConfirmingDelete(false), []);

  return (
    <div className="break-inside-avoid rounded-xl p-4 bg-[var(--color-surface-card)] border border-[var(--color-border)] transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span
          className="text-xs font-body font-medium px-2.5 py-0.5 rounded-full text-white"
          style={{ backgroundColor: typeConfig.colour }}
        >
          {typeConfig.label}
        </span>

        {!confirmingDelete ? (
          <button
            onClick={handleDeleteClick}
            className="text-text-secondary hover:text-red-400 transition-colors text-xs shrink-0"
            aria-label="Delete thought"
          >
            ✕
          </button>
        ) : (
          <span className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleConfirmDelete}
              className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={handleCancelDelete}
              className="text-xs px-1 py-0.5 text-text-secondary hover:text-text-primary transition-colors"
            >
              Keep
            </button>
          </span>
        )}
      </div>

      <p className="text-text-primary font-body text-sm leading-relaxed mb-3 whitespace-pre-wrap">
        {thought.content}
      </p>

      <p className="text-text-secondary text-xs font-body">{timeAgo}</p>
    </div>
  );
});

// --- Main Thoughts Component ---
export function Thoughts() {
  const [thoughts, setThoughts] = useState<ThoughtLocal[]>(() => loadThoughts());
  const [inputValue, setInputValue] = useState('');
  const [selectedType, setSelectedType] = useState<ThoughtType>('thought');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const sortedThoughts = useMemo(
    () => [...thoughts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [thoughts]
  );

  const handleAdd = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputValue.trim()) return;

      const newThought: ThoughtLocal = {
        id: crypto.randomUUID(),
        type: selectedType,
        content: inputValue.trim(),
        createdAt: new Date().toISOString(),
      };
      const updated = [...thoughts, newThought];
      setThoughts(updated);
      saveThoughts(updated);
      setInputValue('');
    },
    [inputValue, selectedType, thoughts]
  );

  const handleDelete = useCallback(
    (id: string) => {
      const updated = thoughts.filter((t) => t.id !== id);
      setThoughts(updated);
      saveThoughts(updated);
    },
    [thoughts]
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="skeleton h-8 w-40 mb-6" />
        <div className="skeleton h-12 w-full mb-4 rounded-lg" />
        <div className="skeleton h-8 w-64 mb-6" />
        <ThoughtsSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-display font-bold text-text-primary mb-6">Thoughts</h2>

      {/* Quick capture form */}
      <form onSubmit={handleAdd} className="mb-6">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Capture a thought…"
            className="flex-1 rounded-lg px-4 py-3 bg-[var(--color-surface-card)] border border-[var(--color-border)] text-text-primary font-body text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
          />
          <button
            type="submit"
            className="px-4 py-3 rounded-lg bg-[var(--color-accent)] text-white font-body text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
          >
            Add
          </button>
        </div>

        {/* Type selector */}
        <div className="flex flex-wrap gap-2">
          {THOUGHT_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setSelectedType(t.value)}
              className={`text-xs font-body font-medium px-3 py-1.5 rounded-full transition-all ${
                selectedType === t.value
                  ? 'text-white shadow-sm'
                  : 'text-text-secondary bg-[var(--color-surface)] border border-[var(--color-border)] hover:text-text-primary'
              }`}
              style={
                selectedType === t.value
                  ? { backgroundColor: t.colour }
                  : undefined
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </form>

      {/* Masonry grid */}
      {sortedThoughts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-secondary font-body text-lg mb-2">No thoughts captured yet</p>
          <p className="text-text-secondary font-body text-sm">
            Jot down whatever crosses your mind — no pressure, no structure.
          </p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {sortedThoughts.map((thought) => (
            <ThoughtCard key={thought.id} thought={thought} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
