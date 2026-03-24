import { useState, useCallback, useEffect, useMemo, memo } from 'react';
import type { EventCategory } from '../../types/shared.types';
import { EVENT_CATEGORY_COLOURS } from '../../types/shared.types';

interface CustomEventLocal {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string; // ISO string for localStorage
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

function todayISO(): string {
  return new Date().toISOString().split('T')[0] ?? '';
}

function loadEvents(): CustomEventLocal[] {
  try {
    const raw = localStorage.getItem('life-os-custom-events');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEvents(events: CustomEventLocal[]): void {
  localStorage.setItem('life-os-custom-events', JSON.stringify(events));
}

// --- Skeleton ---
function EventsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((n) => (
        <div key={`skel-${n}`} className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)]">
          <div className="skeleton h-5 w-48 mb-3" />
          <div className="skeleton h-3 w-32 mb-3" />
          <div className="skeleton h-4 w-full mb-2" />
          <div className="skeleton h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

// --- Event Card ---
interface EventCardProps {
  event: CustomEventLocal;
  onDelete: (id: string) => void;
}

const EventCard = memo(function EventCard({ event, onDelete }: EventCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleDeleteClick = useCallback(() => setConfirmingDelete(true), []);
  const handleConfirmDelete = useCallback(() => {
    onDelete(event.id);
    setConfirmingDelete(false);
  }, [onDelete, event.id]);
  const handleCancelDelete = useCallback(() => setConfirmingDelete(false), []);

  return (
    <div className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)] transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-display font-semibold text-lg text-text-primary">{event.title}</h3>
        <div className="shrink-0">
          {!confirmingDelete ? (
            <button
              onClick={handleDeleteClick}
              className="text-text-secondary hover:text-red-400 transition-colors text-sm px-2 py-1 rounded"
              aria-label="Delete event"
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
        <span>{formatDateAU(event.date)}</span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: EVENT_CATEGORY_COLOURS[event.category] }}
          />
          <span className="capitalize">{event.category}</span>
        </span>
      </div>

      {event.description && (
        <p className="text-text-secondary font-body text-sm leading-relaxed">
          {event.description}
        </p>
      )}
    </div>
  );
});

// --- Add Event Form ---
interface AddFormProps {
  onSave: (data: Omit<CustomEventLocal, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function AddEventForm({ onSave, onCancel }: AddFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('milestone');
  const [date, setDate] = useState(todayISO());

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;
      onSave({
        title: title.trim(),
        description: description.trim(),
        category,
        date,
      });
    },
    [title, description, category, date, onSave]
  );

  const inputClasses =
    'w-full rounded-lg px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] text-text-primary font-body text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50';

  return (
    <form onSubmit={handleSubmit} className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-4">
      <h3 className="font-display font-semibold text-lg text-text-primary">New Event</h3>

      <div>
        <label className="block text-sm font-body text-text-secondary mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClasses}
          placeholder="Event title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-body text-text-secondary mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClasses} min-h-[80px] resize-y`}
          placeholder="What happened?"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white font-body text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Save Event
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

// --- Main CustomEvents Component ---
export function CustomEvents() {
  const [events, setEvents] = useState<CustomEventLocal[]>(() => loadEvents());
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [events]
  );

  const handleSave = useCallback(
    (data: Omit<CustomEventLocal, 'id' | 'createdAt'>) => {
      const newEvent: CustomEventLocal = {
        ...data,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      const updated = [...events, newEvent];
      setEvents(updated);
      saveEvents(updated);
      setShowForm(false);
    },
    [events]
  );

  const handleDelete = useCallback(
    (id: string) => {
      const updated = events.filter((e) => e.id !== id);
      setEvents(updated);
      saveEvents(updated);
    },
    [events]
  );

  const handleOpenForm = useCallback(() => setShowForm(true), []);
  const handleCloseForm = useCallback(() => setShowForm(false), []);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="skeleton h-8 w-40" />
          <div className="skeleton h-10 w-28 rounded-lg" />
        </div>
        <EventsSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold text-text-primary">Custom Events</h2>
        {!showForm && (
          <button
            onClick={handleOpenForm}
            className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white font-body text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Add Event
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <AddEventForm onSave={handleSave} onCancel={handleCloseForm} />
        </div>
      )}

      {sortedEvents.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <p className="text-text-secondary font-body text-lg mb-2">No custom events yet</p>
          <p className="text-text-secondary font-body text-sm">
            Record the moments that matter — big or small.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedEvents.map((event) => (
            <EventCard key={event.id} event={event} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
