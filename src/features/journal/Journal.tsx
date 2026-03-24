import { useState, useCallback, useEffect, useMemo, memo } from 'react';
import type { EventCategory } from '../../types/shared.types';
import { EVENT_CATEGORY_COLOURS } from '../../types/shared.types';

interface JournalEntryLocal {
  id: string;
  title: string;
  content: string;
  category: EventCategory;
  date: string; // ISO string for localStorage
  tags: string[];
  importance: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
}

const CATEGORIES: EventCategory[] = [
  'career', 'family', 'home', 'education', 'travel',
  'health', 'milestone', 'relationships', 'thoughts',
];

function formatDateAU(isoDate: string): string {
  const d = new Date(isoDate);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function loadEntries(): JournalEntryLocal[] {
  try {
    const raw = localStorage.getItem('life-os-journal');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: JournalEntryLocal[]): void {
  localStorage.setItem('life-os-journal', JSON.stringify(entries));
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0] ?? '';
}

// --- Skeleton loader ---
function JournalSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((n) => (
        <div key={`skel-${n}`} className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)]">
          <div className="skeleton h-5 w-48 mb-3" />
          <div className="skeleton h-3 w-32 mb-3" />
          <div className="skeleton h-4 w-full mb-2" />
          <div className="skeleton h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

// --- Entry Card ---
interface EntryCardProps {
  entry: JournalEntryLocal;
  onDelete: (id: string) => void;
}

const EntryCard = memo(function EntryCard({ entry, onDelete }: EntryCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleDeleteClick = useCallback(() => {
    setConfirmingDelete(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    onDelete(entry.id);
    setConfirmingDelete(false);
  }, [onDelete, entry.id]);

  const handleCancelDelete = useCallback(() => {
    setConfirmingDelete(false);
  }, []);

  const importanceStars = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={`star-${entry.id}-${i}`}
        className={i < entry.importance ? 'text-[var(--color-accent)]' : 'text-text-secondary opacity-30'}
      >
        ★
      </span>
    ));
  }, [entry.importance, entry.id]);

  const truncatedContent = useMemo(() => {
    return entry.content.length > 180
      ? entry.content.slice(0, 180) + '…'
      : entry.content;
  }, [entry.content]);

  return (
    <div className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)] transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-display font-semibold text-lg text-text-primary">{entry.title}</h3>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm">{importanceStars}</span>
          {!confirmingDelete ? (
            <button
              onClick={handleDeleteClick}
              className="text-text-secondary hover:text-red-400 transition-colors text-sm px-2 py-1 rounded"
              aria-label="Delete entry"
            >
              Delete
            </button>
          ) : (
            <span className="flex items-center gap-1">
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
      </div>

      <div className="flex items-center gap-3 mb-3 text-sm text-text-secondary">
        <span>{formatDateAU(entry.date)}</span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: EVENT_CATEGORY_COLOURS[entry.category] }}
          />
          <span className="capitalize">{entry.category}</span>
        </span>
      </div>

      <p className="text-text-secondary font-body text-sm leading-relaxed mb-3">
        {truncatedContent}
      </p>

      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <span
              key={`${entry.id}-tag-${tag}`}
              className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
});

// --- Add Entry Form ---
interface AddFormProps {
  onSave: (entry: Omit<JournalEntryLocal, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function AddEntryForm({ onSave, onCancel }: AddFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<EventCategory>('career');
  const [date, setDate] = useState(todayISO());
  const [importance, setImportance] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [tagsInput, setTagsInput] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim() || !content.trim()) return;
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      onSave({ title: title.trim(), content: content.trim(), category, date, importance, tags });
    },
    [title, content, category, date, importance, tagsInput, onSave]
  );

  const inputClasses =
    'w-full rounded-lg px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] text-text-primary font-body text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50';

  return (
    <form onSubmit={handleSubmit} className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-4">
      <h3 className="font-display font-semibold text-lg text-text-primary">New Journal Entry</h3>

      <div>
        <label className="block text-sm font-body text-text-secondary mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClasses}
          placeholder="Entry title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-body text-text-secondary mb-1">Content</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`${inputClasses} min-h-[120px] resize-y`}
          placeholder="Write your journal entry…"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-body text-text-secondary mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as EventCategory)}
            className={inputClasses}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-body text-text-secondary mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClasses}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-body text-text-secondary mb-1">Importance</label>
          <div className="flex items-center gap-1 mt-1">
            {([1, 2, 3, 4, 5] as const).map((n) => (
              <button
                key={`imp-${n}`}
                type="button"
                onClick={() => setImportance(n)}
                className={`text-xl transition-colors ${
                  n <= importance ? 'text-[var(--color-accent)]' : 'text-text-secondary opacity-30'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-body text-text-secondary mb-1">Tags (comma-separated)</label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className={inputClasses}
          placeholder="e.g. reflection, growth, career"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white font-body text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Save Entry
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-text-secondary font-body text-sm hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// --- Main Journal Component ---
export function Journal() {
  const [entries, setEntries] = useState<JournalEntryLocal[]>(() => loadEntries());
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [entries]
  );

  const handleSave = useCallback(
    (data: Omit<JournalEntryLocal, 'id' | 'createdAt'>) => {
      const newEntry: JournalEntryLocal = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      const updated = [...entries, newEntry];
      setEntries(updated);
      saveEntries(updated);
      setShowForm(false);
    },
    [entries]
  );

  const handleDelete = useCallback(
    (id: string) => {
      const updated = entries.filter((e) => e.id !== id);
      setEntries(updated);
      saveEntries(updated);
    },
    [entries]
  );

  const handleOpenForm = useCallback(() => setShowForm(true), []);
  const handleCloseForm = useCallback(() => setShowForm(false), []);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="skeleton h-8 w-32" />
          <div className="skeleton h-10 w-28 rounded-lg" />
        </div>
        <JournalSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold text-text-primary">Journal</h2>
        {!showForm && (
          <button
            onClick={handleOpenForm}
            className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white font-body text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Add Entry
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <AddEntryForm onSave={handleSave} onCancel={handleCloseForm} />
        </div>
      )}

      {sortedEntries.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <p className="text-text-secondary font-body text-lg mb-2">No journal entries yet</p>
          <p className="text-text-secondary font-body text-sm">
            Start capturing your thoughts and experiences.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedEntries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
