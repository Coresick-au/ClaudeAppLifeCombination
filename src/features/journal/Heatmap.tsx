import { useState, useEffect, useMemo, useCallback } from 'react';
import type { EventCategory } from '../../types/shared.types';
import type { ChronicleAnswer } from '../../types/chronicle.types';

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

// --- Data loading ---
function loadBirthDate(): string | null {
  try {
    const raw = localStorage.getItem('life-os-chronicle');
    if (!raw) return null;
    const chronicle = JSON.parse(raw) as { answers: Record<string, ChronicleAnswer> };
    const birthAnswer = chronicle.answers?.['birth_birth-date'];
    return birthAnswer?.value ?? null;
  } catch {
    return null;
  }
}

function loadAllEventDates(): HeatmapEvent[] {
  const events: HeatmapEvent[] = [];

  try {
    const journalRaw = localStorage.getItem('life-os-journal');
    if (journalRaw) {
      const entries = JSON.parse(journalRaw) as Array<{ id: string; date: string; category: EventCategory }>;
      for (const e of entries) {
        events.push({ id: `j-${e.id}`, date: e.date });
      }
    }
  } catch { /* ignore */ }

  try {
    const thoughtsRaw = localStorage.getItem('life-os-thoughts');
    if (thoughtsRaw) {
      const thoughts = JSON.parse(thoughtsRaw) as Array<{ id: string; createdAt: string }>;
      for (const t of thoughts) {
        events.push({ id: `t-${t.id}`, date: t.createdAt });
      }
    }
  } catch { /* ignore */ }

  try {
    const customRaw = localStorage.getItem('life-os-custom-events');
    if (customRaw) {
      const customs = JSON.parse(customRaw) as Array<{ id: string; date: string }>;
      for (const c of customs) {
        events.push({ id: `c-${c.id}`, date: c.date });
      }
    }
  } catch { /* ignore */ }

  try {
    const chronicleRaw = localStorage.getItem('life-os-chronicle');
    if (chronicleRaw) {
      const chronicle = JSON.parse(chronicleRaw) as { answers: Record<string, ChronicleAnswer> };
      if (chronicle.answers) {
        for (const [key, answer] of Object.entries(chronicle.answers)) {
          if (!answer.value || key === 'birth_birth-date') continue;
          events.push({ id: `ch-${key}`, date: answer.answeredAt });
        }
      }
    }
  } catch { /* ignore */ }

  return events;
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
  const [isLoading, setIsLoading] = useState(true);
  const [birthDate, setBirthDate] = useState<string | null>(null);
  const [events, setEvents] = useState<HeatmapEvent[]>([]);
  const [hovered, setHovered] = useState<HoveredCell | null>(null);

  useEffect(() => {
    setBirthDate(loadBirthDate());
    setEvents(loadAllEventDates());
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

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

  if (isLoading) {
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
