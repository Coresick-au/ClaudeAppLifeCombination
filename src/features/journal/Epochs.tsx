import { useState, useEffect, useMemo, memo } from 'react';
import type { EventCategory } from '../../types/shared.types';
import { EVENT_CATEGORY_COLOURS } from '../../types/shared.types';
import type { ChronicleAnswer } from '../../types/chronicle.types';

// --- Types ---
interface EpochEvent {
  id: string;
  date: string;
  category: EventCategory;
  title: string;
}

interface Epoch {
  id: string;
  startYear: number;
  endYear: number;
  label: string;
  dominantCategory: EventCategory;
  eventCount: number;
  categories: Map<EventCategory, number>;
}

const CATEGORY_LABELS: Record<EventCategory, string> = {
  career: 'Career',
  family: 'Family',
  home: 'Home',
  education: 'Education',
  travel: 'Travel',
  health: 'Health',
  milestone: 'Milestone',
  relationships: 'Relationships',
  thoughts: 'Reflective',
};

// --- Data loading ---
function loadAllEvents(): EpochEvent[] {
  const events: EpochEvent[] = [];

  try {
    const journalRaw = localStorage.getItem('life-os-journal');
    if (journalRaw) {
      const entries = JSON.parse(journalRaw) as Array<{
        id: string; title: string; category: EventCategory; date: string;
      }>;
      for (const e of entries) {
        events.push({ id: `j-${e.id}`, date: e.date, category: e.category, title: e.title });
      }
    }
  } catch { /* ignore */ }

  try {
    const thoughtsRaw = localStorage.getItem('life-os-thoughts');
    if (thoughtsRaw) {
      const thoughts = JSON.parse(thoughtsRaw) as Array<{
        id: string; type: string; createdAt: string;
      }>;
      for (const t of thoughts) {
        events.push({
          id: `t-${t.id}`,
          date: t.createdAt,
          category: 'thoughts',
          title: `${t.type.charAt(0).toUpperCase()}${t.type.slice(1)}`,
        });
      }
    }
  } catch { /* ignore */ }

  try {
    const customRaw = localStorage.getItem('life-os-custom-events');
    if (customRaw) {
      const customs = JSON.parse(customRaw) as Array<{
        id: string; title: string; category: EventCategory; date: string;
      }>;
      for (const c of customs) {
        events.push({ id: `c-${c.id}`, date: c.date, category: c.category, title: c.title });
      }
    }
  } catch { /* ignore */ }

  try {
    const chronicleRaw = localStorage.getItem('life-os-chronicle');
    if (chronicleRaw) {
      const chronicle = JSON.parse(chronicleRaw) as { answers: Record<string, ChronicleAnswer> };
      if (chronicle.answers) {
        for (const [key, answer] of Object.entries(chronicle.answers)) {
          if (!answer.value) continue;
          events.push({
            id: `ch-${key}`,
            date: answer.answeredAt,
            category: 'milestone',
            title: answer.questionId.replace(/-/g, ' '),
          });
        }
      }
    }
  } catch { /* ignore */ }

  return events;
}

/**
 * Build epochs by grouping events into year buckets then merging
 * consecutive years into contiguous epochs.
 */
function buildEpochs(events: EpochEvent[]): Epoch[] {
  if (events.length === 0) return [];

  // Group events by year
  const byYear = new Map<number, EpochEvent[]>();
  for (const evt of events) {
    const year = new Date(evt.date).getFullYear();
    const existing = byYear.get(year);
    if (existing) {
      existing.push(evt);
    } else {
      byYear.set(year, [evt]);
    }
  }

  // Sort years
  const sortedYears = Array.from(byYear.keys()).sort((a, b) => a - b);
  if (sortedYears.length === 0) return [];

  const firstYear = sortedYears[0] as number;

  // Merge consecutive years into epoch ranges
  const ranges: Array<{ startYear: number; endYear: number; events: EpochEvent[] }> = [];
  let currentRange: { startYear: number; endYear: number; events: EpochEvent[] } = {
    startYear: firstYear,
    endYear: firstYear,
    events: [...(byYear.get(firstYear) ?? [])],
  };

  for (let i = 1; i < sortedYears.length; i++) {
    const year = sortedYears[i] as number;
    // Merge if consecutive (gap of 1 year or less)
    if (year - currentRange.endYear <= 1) {
      currentRange.endYear = year;
      currentRange.events.push(...(byYear.get(year) ?? []));
    } else {
      ranges.push(currentRange);
      currentRange = {
        startYear: year,
        endYear: year,
        events: [...(byYear.get(year) ?? [])],
      };
    }
  }
  ranges.push(currentRange);

  // Convert ranges to epochs with dominant categories
  return ranges.map((range) => {
    const categories = new Map<EventCategory, number>();
    for (const evt of range.events) {
      categories.set(evt.category, (categories.get(evt.category) ?? 0) + 1);
    }

    // Find dominant category
    let dominantCategory: EventCategory = 'milestone';
    let maxCount = 0;
    for (const [cat, count] of categories.entries()) {
      if (count > maxCount) {
        maxCount = count;
        dominantCategory = cat;
      }
    }

    const label =
      CATEGORY_LABELS[dominantCategory] && maxCount > 1
        ? `${CATEGORY_LABELS[dominantCategory]} Era`
        : range.startYear === range.endYear
          ? `Year ${range.startYear}`
          : `${range.startYear}\u2013${range.endYear}`;

    return {
      id: `epoch-${range.startYear}-${range.endYear}`,
      startYear: range.startYear,
      endYear: range.endYear,
      label,
      dominantCategory,
      eventCount: range.events.length,
      categories,
    };
  });
}

// --- Skeleton ---
function EpochsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((n) => (
        <div key={`skel-${n}`} className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)]">
          <div className="skeleton h-5 w-40 mb-3" />
          <div className="skeleton h-4 w-28 mb-3" />
          <div className="flex gap-2">
            <div className="skeleton h-3 w-16" />
            <div className="skeleton h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Epoch Card ---
interface EpochCardProps {
  epoch: Epoch;
}

const EpochCard = memo(function EpochCard({ epoch }: EpochCardProps) {
  const dominantColour = EVENT_CATEGORY_COLOURS[epoch.dominantCategory] ?? '#8b5cf6';
  const yearSpan = epoch.endYear - epoch.startYear + 1;

  const categoryBreakdown = useMemo(() => {
    return Array.from(epoch.categories.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [epoch.categories]);

  return (
    <div
      className="rounded-xl p-5 bg-[var(--color-surface-card)] border-l-4 border border-[var(--color-border)] transition-colors hover:border-[var(--color-accent)]/30"
      style={{ borderLeftColor: dominantColour }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-display font-bold text-lg text-text-primary">
          {epoch.label}
        </h3>
        <span className="shrink-0 text-xs font-body text-text-secondary bg-[var(--color-surface)] px-2 py-1 rounded-full">
          {epoch.eventCount} event{epoch.eventCount !== 1 ? 's' : ''}
        </span>
      </div>

      <p className="text-text-secondary font-body text-sm mb-3">
        {epoch.startYear === epoch.endYear
          ? String(epoch.startYear)
          : `${epoch.startYear}\u2013${epoch.endYear}`}
        {yearSpan > 1 && (
          <span className="ml-1">({yearSpan} years)</span>
        )}
      </p>

      {/* Category breakdown bar */}
      <div className="flex gap-0.5 h-2 rounded-full overflow-hidden mb-3">
        {categoryBreakdown.map(([cat, count]) => (
          <div
            key={`${epoch.id}-${cat}`}
            className="h-full transition-all"
            style={{
              backgroundColor: EVENT_CATEGORY_COLOURS[cat] ?? '#8b5cf6',
              width: `${(count / epoch.eventCount) * 100}%`,
              minWidth: '4px',
            }}
          />
        ))}
      </div>

      {/* Category labels */}
      <div className="flex flex-wrap gap-2">
        {categoryBreakdown.map(([cat, count]) => (
          <span
            key={`${epoch.id}-label-${cat}`}
            className="text-xs font-body flex items-center gap-1"
          >
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: EVENT_CATEGORY_COLOURS[cat] ?? '#8b5cf6' }}
            />
            <span className="capitalize text-text-secondary">
              {cat} ({count})
            </span>
          </span>
        ))}
      </div>
    </div>
  );
});

// --- Main Component ---
export function Epochs() {
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<EpochEvent[]>([]);

  useEffect(() => {
    setEvents(loadAllEvents());
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const epochs = useMemo(() => buildEpochs(events), [events]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="skeleton h-8 w-32 mb-2" />
        <div className="skeleton h-4 w-64 mb-6" />
        <EpochsSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-display font-bold text-text-primary mb-2">Epochs</h2>
      <p className="text-text-secondary font-body text-sm mb-6">
        Auto-detected chapters of your life, shaped by the events you have recorded.
        The dominant colour shows what defined each period.
      </p>

      {epochs.length === 0 ? (
        <div className="text-center py-16 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)]">
          <p className="text-text-secondary font-body text-lg mb-2">
            No epochs detected yet
          </p>
          <p className="text-text-secondary font-body text-sm">
            Record events across different years and the pattern of your life will begin
            to take shape here — clusters of activity becoming distinct chapters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {epochs.map((epoch) => (
            <EpochCard key={epoch.id} epoch={epoch} />
          ))}
        </div>
      )}
    </div>
  );
}
