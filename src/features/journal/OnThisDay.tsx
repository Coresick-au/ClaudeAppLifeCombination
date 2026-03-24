import { useMemo, memo } from 'react';
import type { EventCategory } from '../../types/shared.types';
import { EVENT_CATEGORY_COLOURS } from '../../types/shared.types';
import { useData } from '@/services/DataContext';

// --- Types ---
interface OnThisDayEvent {
  id: string;
  title: string;
  content: string;
  date: string;
  category: EventCategory;
  source: string;
}

interface YearGroup {
  year: number;
  yearsAgo: number;
  events: OnThisDayEvent[];
}

function formatDateAU(isoDate: string): string {
  const d = new Date(isoDate);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// --- Skeleton ---
function OnThisDaySkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((n) => (
        <div key={`skel-${n}`}>
          <div className="skeleton h-6 w-48 mb-3" />
          <div className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)]">
            <div className="skeleton h-4 w-32 mb-3" />
            <div className="skeleton h-4 w-full mb-2" />
            <div className="skeleton h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Event Card ---
interface EventCardProps {
  event: OnThisDayEvent;
}

const EventCard = memo(function EventCard({ event }: EventCardProps) {
  const categoryColour = EVENT_CATEGORY_COLOURS[event.category] ?? '#8b5cf6';

  return (
    <div className="rounded-xl p-4 bg-[var(--color-surface-card)] border border-[var(--color-border)] transition-colors hover:border-[var(--color-accent)]/30">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: categoryColour }}
        />
        <h4 className="font-display font-semibold text-sm text-text-primary">
          {event.title}
        </h4>
        <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-body">
          {event.source}
        </span>
      </div>
      <p className="text-text-secondary font-body text-sm leading-relaxed mb-2">
        {event.content}
      </p>
      <div className="flex items-center gap-2 text-xs text-text-secondary font-body">
        <span>{formatDateAU(event.date)}</span>
        <span className="capitalize" style={{ color: categoryColour }}>
          {event.category}
        </span>
      </div>
    </div>
  );
});

// --- Main Component ---
export function OnThisDay() {
  const { getJournalEntries, getThoughts, getCustomEvents, getChronicle, isLoaded } = useData();

  const today = useMemo(() => new Date(), []);
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();
  const currentYear = today.getFullYear();

  const todayFormatted = useMemo(() => {
    return today.toLocaleDateString('en-AU', { day: 'numeric', month: 'long' });
  }, [today]);

  const events = useMemo<OnThisDayEvent[]>(() => {
    if (!isLoaded) return [];

    function matchesDate(isoDate: string): boolean {
      const d = new Date(isoDate);
      return d.getMonth() === todayMonth && d.getDate() === todayDay && d.getFullYear() !== currentYear;
    }

    const result: OnThisDayEvent[] = [];

    const journalEntries = getJournalEntries();
    for (const e of journalEntries) {
      if (matchesDate(e.date)) {
        result.push({
          id: `journal-${e.id}`,
          title: e.title,
          content: e.content.length > 200 ? e.content.slice(0, 200) + '\u2026' : e.content,
          date: e.date,
          category: e.category,
          source: 'Journal',
        });
      }
    }

    const thoughts = getThoughts();
    for (const t of thoughts) {
      if (matchesDate(t.createdAt)) {
        result.push({
          id: `thought-${t.id}`,
          title: `${t.type.charAt(0).toUpperCase()}${t.type.slice(1)}`,
          content: t.content.length > 200 ? t.content.slice(0, 200) + '\u2026' : t.content,
          date: t.createdAt,
          category: 'thoughts',
          source: 'Thought',
        });
      }
    }

    const customEvents = getCustomEvents();
    for (const c of customEvents) {
      if (matchesDate(c.date)) {
        result.push({
          id: `custom-${c.id}`,
          title: c.title,
          content: c.description.length > 200 ? c.description.slice(0, 200) + '\u2026' : c.description,
          date: c.date,
          category: c.category,
          source: 'Event',
        });
      }
    }

    const chronicle = getChronicle();
    if (chronicle.answers) {
      for (const [key, answer] of Object.entries(chronicle.answers)) {
        if (!answer.value) continue;
        if (matchesDate(answer.answeredAt)) {
          result.push({
            id: `chronicle-${key}`,
            title: `Chronicle: ${answer.questionId.replace(/-/g, ' ')}`,
            content: answer.value.length > 200 ? answer.value.slice(0, 200) + '\u2026' : answer.value,
            date: answer.answeredAt,
            category: 'milestone',
            source: 'Chronicle',
          });
        }
      }
    }

    return result;
  }, [isLoaded, getJournalEntries, getThoughts, getCustomEvents, getChronicle, todayMonth, todayDay, currentYear]);

  // Group events by year, sorted newest first
  const yearGroups = useMemo<YearGroup[]>(() => {
    const groups = new Map<number, OnThisDayEvent[]>();
    for (const evt of events) {
      const year = new Date(evt.date).getFullYear();
      const existing = groups.get(year);
      if (existing) {
        existing.push(evt);
      } else {
        groups.set(year, [evt]);
      }
    }
    return Array.from(groups.entries())
      .map(([year, evts]) => ({
        year,
        yearsAgo: currentYear - year,
        events: evts,
      }))
      .sort((a, b) => b.year - a.year);
  }, [events, currentYear]);

  if (!isLoaded) {
    return (
      <div className="p-6">
        <div className="skeleton h-8 w-48 mb-2" />
        <div className="skeleton h-4 w-64 mb-6" />
        <OnThisDaySkeleton />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-display font-bold text-text-primary mb-2">On This Day</h2>
      <p className="text-text-secondary font-body text-sm mb-6">
        Revisiting {todayFormatted} through the years.
      </p>

      {yearGroups.length === 0 ? (
        <div className="text-center py-16 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)]">
          <p className="text-text-secondary font-body text-lg mb-2">
            Nothing recorded on this day in previous years
          </p>
          <p className="text-text-secondary font-body text-sm">
            As you keep journalling and recording events, past entries from {todayFormatted} will
            surface here — a chance to feel the weight of time passing.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {yearGroups.map((group) => (
            <div key={`year-${group.year}`}>
              <h3 className="font-display font-bold text-lg text-accent mb-3">
                {group.yearsAgo} year{group.yearsAgo !== 1 ? 's' : ''} ago today
                <span className="text-text-secondary font-body text-sm font-normal ml-2">
                  ({group.year})
                </span>
              </h3>
              <div className="space-y-3">
                {group.events.map((evt) => (
                  <EventCard key={evt.id} event={evt} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
