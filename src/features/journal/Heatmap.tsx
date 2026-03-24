import { useState, useMemo, useCallback } from 'react';
import { useData } from '@/services/DataContext';

const LIFESPAN_YEARS = 90;
const WEEKS_PER_YEAR = 52;

// --- Types ---
interface HeatmapEvent {
  id: string;
  date: string;
}

interface HoveredCell {
  year: number;
  week: number;
  eventCount: number;
  lifeYear: number;
}

/**
 * Given a birth date and an event date, compute which life-year (0-based)
 * and which week (0-based, 0-51) the event falls into.
 */
function getLifeWeek(birthDate: Date, eventDate: Date): { lifeYear: number; week: number } | null {
  const diffMs = eventDate.getTime() - birthDate.getTime();
  if (diffMs < 0) return null;

  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const lifeYear = Math.floor(totalDays / 365.25);
  const dayInYear = totalDays - Math.floor(lifeYear * 365.25);
  const week = Math.min(Math.floor(dayInYear / 7), WEEKS_PER_YEAR - 1);

  if (lifeYear >= LIFESPAN_YEARS) return null;
  return { lifeYear, week };
}

function getCurrentLifeWeek(birthDate: Date): { lifeYear: number; week: number } | null {
  return getLifeWeek(birthDate, new Date());
}

// --- Colour intensity ---
function getDensityColour(count: number, accentColour: string): string {
  if (count === 0) return 'var(--color-border)';
  if (count === 1) return `${accentColour}66`; // 40% opacity
  if (count <= 3) return `${accentColour}aa`; // 67% opacity
  return accentColour; // full
}

// --- Skeleton ---
function HeatmapSkeleton() {
  return (
    <div className="space-y-3">
      <div className="skeleton h-6 w-48 mb-4" />
      {[1, 2, 3, 4, 5].map((n) => (
        <div key={`skel-${n}`} className="flex gap-0.5">
          <div className="skeleton h-3 w-8 mr-2" />
          {Array.from({ length: 20 }, (_, i) => (
            <div key={`skel-cell-${n}-${i}`} className="skeleton w-3 h-3 rounded-sm" />
          ))}
        </div>
      ))}
    </div>
  );
}

// --- Main Component ---
export function Heatmap() {
  const { getJournalEntries, getThoughts, getCustomEvents, getChronicle, isLoaded } = useData();
  const [hovered, setHovered] = useState<HoveredCell | null>(null);

  const chronicle = isLoaded ? getChronicle() : null;

  const birthDate = useMemo(() => {
    if (!chronicle?.answers) return null;
    const birthAnswer = chronicle.answers['birth_birth-date'];
    return birthAnswer?.value ?? null;
  }, [chronicle]);

  const events = useMemo<HeatmapEvent[]>(() => {
    if (!isLoaded) return [];

    const result: HeatmapEvent[] = [];

    const journalEntries = getJournalEntries();
    for (const e of journalEntries) {
      result.push({ id: `j-${e.id}`, date: e.date });
    }

    const thoughts = getThoughts();
    for (const t of thoughts) {
      result.push({ id: `t-${t.id}`, date: t.createdAt });
    }

    const customEvents = getCustomEvents();
    for (const c of customEvents) {
      result.push({ id: `c-${c.id}`, date: c.date });
    }

    if (chronicle?.answers) {
      for (const [key, answer] of Object.entries(chronicle.answers)) {
        if (!answer.value || key === 'birth_birth-date') continue;
        result.push({ id: `ch-${key}`, date: answer.answeredAt });
      }
    }

    return result;
  }, [isLoaded, getJournalEntries, getThoughts, getCustomEvents, chronicle]);

  const birthDateObj = useMemo(() => {
    if (!birthDate) return null;
    return new Date(birthDate);
  }, [birthDate]);

  // Build density map: key = "lifeYear-week" -> count
  const densityMap = useMemo(() => {
    if (!birthDateObj) return new Map<string, number>();
    const map = new Map<string, number>();
    for (const evt of events) {
      const pos = getLifeWeek(birthDateObj, new Date(evt.date));
      if (!pos) continue;
      const key = `${pos.lifeYear}-${pos.week}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [birthDateObj, events]);

  const currentWeek = useMemo(() => {
    if (!birthDateObj) return null;
    return getCurrentLifeWeek(birthDateObj);
  }, [birthDateObj]);

  const accentColour = useMemo(() => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--color-accent').trim() || '#f59e0b';
  }, []);

  const handleCellEnter = useCallback(
    (lifeYear: number, week: number) => {
      const key = `${lifeYear}-${week}`;
      setHovered({
        year: (birthDateObj?.getFullYear() ?? 0) + lifeYear,
        week: week + 1,
        eventCount: densityMap.get(key) ?? 0,
        lifeYear,
      });
    },
    [birthDateObj, densityMap],
  );

  const handleCellLeave = useCallback(() => setHovered(null), []);

  if (!isLoaded) {
    return (
      <div className="p-6">
        <div className="skeleton h-8 w-40 mb-6" />
        <HeatmapSkeleton />
      </div>
    );
  }

  if (!birthDate || !birthDateObj) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-display font-bold text-text-primary mb-4">Life in Weeks</h2>
        <div className="text-center py-16 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)]">
          <p className="text-text-secondary font-body text-lg mb-2">
            Birth date needed to map your weeks
          </p>
          <p className="text-text-secondary font-body text-sm">
            Complete Chapter 1 of the Chronicle to set your birth date. Each row will represent
            one year of your life, each tiny square one week.
          </p>
        </div>
      </div>
    );
  }

  const birthYearNum = birthDateObj.getFullYear();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-display font-bold text-text-primary mb-2">Life in Weeks</h2>
      <p className="text-text-secondary font-body text-sm mb-2">
        Each row is one year of a {LIFESPAN_YEARS}-year life. Each square is a single week.
        Brighter squares hold more recorded events.
      </p>

      {hovered && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border)] inline-block">
          <span className="text-text-primary font-body text-sm">
            Age {hovered.lifeYear} &middot; Week {hovered.week} &middot; Year {hovered.year}
            {hovered.eventCount > 0 && (
              <span className="text-accent ml-2">
                {hovered.eventCount} event{hovered.eventCount !== 1 ? 's' : ''}
              </span>
            )}
          </span>
        </div>
      )}

      <div className="overflow-x-auto pb-4">
        <div
          className="inline-grid gap-px"
          style={{
            gridTemplateColumns: `2.5rem repeat(${WEEKS_PER_YEAR}, minmax(0, 1fr))`,
          }}
        >
          {/* Header row - week numbers */}
          <div /> {/* empty corner */}
          {Array.from({ length: WEEKS_PER_YEAR }, (_, w) => (
            <div
              key={`wh-${w}`}
              className="text-center text-text-secondary font-body"
              style={{ fontSize: '6px', lineHeight: '10px' }}
            >
              {(w + 1) % 4 === 0 ? w + 1 : ''}
            </div>
          ))}

          {/* Grid rows */}
          {Array.from({ length: LIFESPAN_YEARS }, (_, lifeYear) => {
            const rowYear = birthYearNum + lifeYear;
            const isFutureRow = rowYear > new Date().getFullYear();
            return (
              <div key={`row-${lifeYear}`} className="contents">
                {/* Year label */}
                <div
                  className="text-text-secondary font-body text-right pr-1.5 self-center"
                  style={{ fontSize: '8px', lineHeight: '10px' }}
                >
                  {lifeYear % 5 === 0 ? rowYear : ''}
                </div>

                {/* Week cells */}
                {Array.from({ length: WEEKS_PER_YEAR }, (_, week) => {
                  const key = `${lifeYear}-${week}`;
                  const count = densityMap.get(key) ?? 0;
                  const isCurrent =
                    currentWeek?.lifeYear === lifeYear && currentWeek?.week === week;

                  return (
                    <div
                      key={`cell-${lifeYear}-${week}`}
                      className="rounded-[1px] transition-colors"
                      style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: isFutureRow
                          ? 'var(--color-surface)'
                          : getDensityColour(count, accentColour),
                        border: isCurrent ? '1.5px solid var(--color-accent)' : 'none',
                        opacity: isFutureRow ? 0.3 : 1,
                      }}
                      onMouseEnter={() => handleCellEnter(lifeYear, week)}
                      onMouseLeave={handleCellLeave}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-4 text-xs text-text-secondary font-body">
        <span>Less</span>
        <div className="flex gap-1">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: 'var(--color-border)' }}
          />
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: `${accentColour}66` }}
          />
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: `${accentColour}aa` }}
          />
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: accentColour }}
          />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
