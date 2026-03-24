import { useState, useMemo, useCallback, memo } from 'react';
import type { EventCategory } from '../../types/shared.types';
import { EVENT_CATEGORY_COLOURS } from '../../types/shared.types';
import { useData } from '@/services/DataContext';

// --- Unified event type ---
interface TimelineEvent {
  id: string;
  title: string;
  content: string;
  date: string;
  category: EventCategory;
  source: 'journal' | 'chronicle' | 'thought' | 'custom-event';
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

function getYearFromISO(iso: string): number {
  return new Date(iso).getFullYear();
}

const SOURCE_LABELS: Record<TimelineEvent['source'], string> = {
  journal: 'Journal',
  chronicle: 'Chronicle',
  thought: 'Thought',
  'custom-event': 'Event',
};

// --- Skeleton ---
function TimelineSkeleton() {
  return (
    <div className="relative pl-8">
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-[var(--color-border)]" />
      {[1, 2, 3, 4].map((n) => (
        <div key={`skel-${n}`} className="relative mb-8 ml-6">
          <div className="absolute -left-9 top-2 w-4 h-4 rounded-full skeleton" />
          <div className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)]">
            <div className="skeleton h-3 w-24 mb-3" />
            <div className="skeleton h-5 w-48 mb-3" />
            <div className="skeleton h-4 w-full mb-2" />
            <div className="skeleton h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Timeline Card ---
interface TimelineCardProps {
  event: TimelineEvent;
  side: 'left' | 'right';
}

const TimelineCard = memo(function TimelineCard({ event, side }: TimelineCardProps) {
  const categoryColour = EVENT_CATEGORY_COLOURS[event.category] ?? '#8b5cf6';

  return (
    <div
      className={`relative mb-8 w-full md:w-[calc(50%-2rem)] ${
        side === 'left' ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'
      }`}
    >
      {/* Connector dot - desktop */}
      <div
        className="hidden md:block absolute top-4 w-3.5 h-3.5 rounded-full border-2 border-[var(--color-surface)]"
        style={{
          backgroundColor: categoryColour,
          [side === 'left' ? 'right' : 'left']: '-1.75rem',
        }}
      />
      {/* Mobile dot */}
      <div
        className="md:hidden absolute -left-[1.65rem] top-4 w-3 h-3 rounded-full border-2 border-[var(--color-surface)]"
        style={{ backgroundColor: categoryColour }}
      />

      <div className="rounded-xl p-4 bg-[var(--color-surface-card)] border border-[var(--color-border)] transition-colors hover:border-[var(--color-accent)]/30">
        <div className="flex items-center gap-2 mb-2 text-xs text-text-secondary font-body">
          <span>{formatDateAU(event.date)}</span>
          <span className="px-1.5 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
            {SOURCE_LABELS[event.source]}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: categoryColour }}
          />
          <h3 className="font-display font-semibold text-text-primary text-sm leading-snug">
            {event.title}
          </h3>
        </div>

        <p className="text-text-secondary font-body text-sm leading-relaxed">
          {event.content}
        </p>

        <div className="mt-2">
          <span
            className="text-xs capitalize font-body"
            style={{ color: categoryColour }}
          >
            {event.category}
          </span>
        </div>
      </div>
    </div>
  );
});

// --- Main Component ---
export function Timeline() {
  const { getJournalEntries, getThoughts, getCustomEvents, getChronicle, isLoaded } = useData();
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | 'all'>('all');
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all');

  const allEvents = useMemo<TimelineEvent[]>(() => {
    if (!isLoaded) return [];

    const events: TimelineEvent[] = [];

    const journalEntries = getJournalEntries();
    for (const e of journalEntries) {
      events.push({
        id: `journal-${e.id}`,
        title: e.title,
        content: e.content.length > 160 ? e.content.slice(0, 160) + '\u2026' : e.content,
        date: e.date,
        category: e.category,
        source: 'journal',
      });
    }

    const thoughts = getThoughts();
    for (const t of thoughts) {
      events.push({
        id: `thought-${t.id}`,
        title: `${t.type.charAt(0).toUpperCase()}${t.type.slice(1)}`,
        content: t.content.length > 160 ? t.content.slice(0, 160) + '\u2026' : t.content,
        date: t.createdAt,
        category: 'thoughts',
        source: 'thought',
      });
    }

    const customEvents = getCustomEvents();
    for (const c of customEvents) {
      events.push({
        id: `custom-${c.id}`,
        title: c.title,
        content: c.description.length > 160 ? c.description.slice(0, 160) + '\u2026' : c.description,
        date: c.date,
        category: c.category,
        source: 'custom-event',
      });
    }

    const chronicle = getChronicle();
    if (chronicle.answers) {
      for (const [key, answer] of Object.entries(chronicle.answers)) {
        if (!answer.value) continue;
        events.push({
          id: `chronicle-${key}`,
          title: `Chronicle: ${answer.questionId.replace(/-/g, ' ')}`,
          content: answer.value.length > 160 ? answer.value.slice(0, 160) + '\u2026' : answer.value,
          date: answer.answeredAt,
          category: 'milestone',
          source: 'chronicle',
        });
      }
    }

    return events;
  }, [isLoaded, getJournalEntries, getThoughts, getCustomEvents, getChronicle]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    for (const e of allEvents) {
      years.add(getYearFromISO(e.date));
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [allEvents]);

  const filteredEvents = useMemo(() => {
    let events = allEvents;
    if (categoryFilter !== 'all') {
      events = events.filter((e) => e.category === categoryFilter);
    }
    if (yearFilter !== 'all') {
      events = events.filter((e) => getYearFromISO(e.date) === yearFilter);
    }
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allEvents, categoryFilter, yearFilter]);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value as EventCategory | 'all');
  }, []);

  const handleYearChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setYearFilter(val === 'all' ? 'all' : Number(val));
  }, []);

  const selectClasses =
    'rounded-lg px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] text-text-primary font-body text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50';

  if (!isLoaded) {
    return (
      <div className="p-6">
        <div className="skeleton h-8 w-40 mb-6" />
        <div className="flex gap-3 mb-6">
          <div className="skeleton h-10 w-36 rounded-lg" />
          <div className="skeleton h-10 w-28 rounded-lg" />
        </div>
        <TimelineSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-display font-bold text-text-primary mb-2">Timeline</h2>
      <p className="text-text-secondary font-body text-sm mb-6">
        Every recorded moment, laid out in the order it happened.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <select
          value={categoryFilter}
          onChange={handleCategoryChange}
          className={selectClasses}
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={yearFilter}
          onChange={handleYearChange}
          className={selectClasses}
        >
          <option value="all">All years</option>
          {availableYears.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <span className="self-center text-text-secondary font-body text-sm">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
        </span>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-secondary font-body text-lg mb-2">No events yet</p>
          <p className="text-text-secondary font-body text-sm">
            Start recording moments in your Journal, Chronicle, or Custom Events to see them here.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Central line - desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-[var(--color-border)]" />
          {/* Left line - mobile */}
          <div className="md:hidden absolute left-3 top-0 bottom-0 w-0.5 bg-[var(--color-border)]" />

          <div className="md:pl-0 pl-8">
            {filteredEvents.map((event, idx) => (
              <TimelineCard
                key={event.id}
                event={event}
                side={idx % 2 === 0 ? 'left' : 'right'}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
