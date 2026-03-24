import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { EventCategory } from '../../types/shared.types';
import { EVENT_CATEGORY_COLOURS } from '../../types/shared.types';
import { getSpiralPoint } from '../../utils/spiral';
import { useData } from '@/services/DataContext';

// --- Types ---
interface SpiralEvent {
  id: string;
  title: string;
  content: string;
  date: string;
  category: EventCategory;
  source: string;
}

interface TooltipData {
  x: number;
  y: number;
  event: SpiralEvent;
}

function formatDateAU(isoDate: string): string {
  const d = new Date(isoDate);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// --- Skeleton ---
function SpiralSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="skeleton w-full max-w-[600px] aspect-square rounded-xl" />
      <div className="flex gap-3">
        <div className="skeleton h-4 w-20" />
        <div className="skeleton h-4 w-20" />
        <div className="skeleton h-4 w-20" />
      </div>
    </div>
  );
}

// --- Main Component ---
export function SpiralTimeline() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { getJournalEntries, getCustomEvents, getChronicle, isLoaded } = useData();
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [canvasSize, setCanvasSize] = useState(600);

  // Track plotted dot positions for hit detection
  const plottedDotsRef = useRef<Array<{ x: number; y: number; event: SpiralEvent }>>([]);

  const chronicle = isLoaded ? getChronicle() : null;

  const birthDate = useMemo(() => {
    if (!chronicle?.answers) return null;
    const birthAnswer = chronicle.answers['birth_birth-date'];
    return birthAnswer?.value ?? null;
  }, [chronicle]);

  const events = useMemo<SpiralEvent[]>(() => {
    if (!isLoaded) return [];

    const result: SpiralEvent[] = [];

    const journalEntries = getJournalEntries();
    for (const e of journalEntries) {
      result.push({
        id: `j-${e.id}`,
        title: e.title,
        content: e.content.length > 120 ? e.content.slice(0, 120) + '\u2026' : e.content,
        date: e.date,
        category: e.category,
        source: 'Journal',
      });
    }

    const customEvents = getCustomEvents();
    for (const c of customEvents) {
      result.push({
        id: `c-${c.id}`,
        title: c.title,
        content: c.description.length > 120 ? c.description.slice(0, 120) + '\u2026' : c.description,
        date: c.date,
        category: c.category,
        source: 'Event',
      });
    }

    if (chronicle?.answers) {
      for (const [key, answer] of Object.entries(chronicle.answers)) {
        if (!answer.value || key === 'birth_birth-date') continue;
        result.push({
          id: `ch-${key}`,
          title: `Chronicle: ${answer.questionId.replace(/-/g, ' ')}`,
          content: answer.value.length > 120 ? answer.value.slice(0, 120) + '\u2026' : answer.value,
          date: answer.answeredAt,
          category: 'milestone',
          source: 'Chronicle',
        });
      }
    }

    return result;
  }, [isLoaded, getJournalEntries, getCustomEvents, chronicle]);

  // Responsive canvas sizing
  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        const w = Math.min(containerRef.current.clientWidth - 32, 700);
        setCanvasSize(Math.max(w, 300));
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const birthYear = useMemo(() => {
    if (!birthDate) return null;
    return new Date(birthDate).getFullYear();
  }, [birthDate]);

  const birthMonth = useMemo(() => {
    if (!birthDate) return 0;
    return new Date(birthDate).getMonth();
  }, [birthDate]);

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const totalYears = useMemo(() => {
    if (!birthYear) return 0;
    return currentYear - birthYear + 1;
  }, [birthYear, currentYear]);

  // Draw spiral
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !birthYear || !isLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    ctx.scale(dpr, dpr);

    const centreX = canvasSize / 2;
    const centreY = canvasSize / 2;
    const spacing = Math.min(canvasSize / (totalYears * 2.5), 18);

    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Draw spiral path
    ctx.beginPath();
    ctx.strokeStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-border').trim() || '#444';
    ctx.lineWidth = 1.5;

    const stepsPerYear = 48;
    for (let yearIdx = 0; yearIdx <= totalYears; yearIdx++) {
      for (let step = 0; step < stepsPerYear; step++) {
        const monthOffset = (step / stepsPerYear) * 12;
        const pt = getSpiralPoint(centreX, centreY, yearIdx, monthOffset, spacing, birthYear);
        if (yearIdx === 0 && step === 0) {
          ctx.moveTo(pt.x, pt.y);
        } else {
          ctx.lineTo(pt.x, pt.y);
        }
      }
    }
    ctx.stroke();

    // Year labels
    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-text-secondary').trim() || '#888';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const labelStep = Math.max(1, Math.floor(totalYears / 15));
    for (let yearIdx = 0; yearIdx <= totalYears; yearIdx += labelStep) {
      const pt = getSpiralPoint(centreX, centreY, yearIdx, 0, spacing, birthYear);
      const labelYear = birthYear + yearIdx;
      ctx.fillText(String(labelYear), pt.x, pt.y - 10);
    }

    // Plot event dots
    const dots: Array<{ x: number; y: number; event: SpiralEvent }> = [];

    for (const evt of events) {
      const eventDate = new Date(evt.date);
      const eventYear = eventDate.getFullYear();
      const eventMonth = eventDate.getMonth();
      const yearIdx = eventYear - birthYear;
      if (yearIdx < 0 || yearIdx > totalYears) continue;

      const monthOffset = eventMonth - (yearIdx === 0 ? birthMonth : 0);
      const pt = getSpiralPoint(centreX, centreY, yearIdx, Math.max(0, monthOffset), spacing, birthYear);
      const colour = EVENT_CATEGORY_COLOURS[evt.category] ?? '#8b5cf6';

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = colour;
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      dots.push({ x: pt.x, y: pt.y, event: evt });
    }

    // Birth marker
    const birthPt = getSpiralPoint(centreX, centreY, 0, 0, spacing, birthYear);
    ctx.beginPath();
    ctx.arc(birthPt.x, birthPt.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-accent').trim() || '#f59e0b';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('B', birthPt.x, birthPt.y);

    plottedDotsRef.current = dots;
  }, [canvasSize, birthYear, birthMonth, totalYears, events, isLoaded]);

  // Handle click/tap on canvas
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvasSize / rect.width;
      const scaleY = canvasSize / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      const hitRadius = 12;
      let closestDot: (typeof plottedDotsRef.current)[number] | null = null;
      let closestDist = Infinity;

      for (const dot of plottedDotsRef.current) {
        const dx = dot.x - clickX;
        const dy = dot.y - clickY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < hitRadius && dist < closestDist) {
          closestDist = dist;
          closestDot = dot;
        }
      }

      if (closestDot) {
        const tooltipX = e.clientX - rect.left;
        const tooltipY = e.clientY - rect.top;
        setTooltip({ x: tooltipX, y: tooltipY, event: closestDot.event });
      } else {
        setTooltip(null);
      }
    },
    [canvasSize],
  );

  const handleDismissTooltip = useCallback(() => setTooltip(null), []);

  if (!isLoaded) {
    return (
      <div className="p-6">
        <div className="skeleton h-8 w-48 mb-6" />
        <SpiralSkeleton />
      </div>
    );
  }

  if (!birthDate) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-display font-bold text-text-primary mb-4">Spiral Timeline</h2>
        <div className="text-center py-16 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)]">
          <p className="text-text-secondary font-body text-lg mb-2">
            Birth date needed to anchor your spiral
          </p>
          <p className="text-text-secondary font-body text-sm">
            Complete Chapter 1 of the Chronicle to set your birth date. The spiral grows outward
            from your first day, one ring per year.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-display font-bold text-text-primary mb-2">Spiral Timeline</h2>
      <p className="text-text-secondary font-body text-sm mb-6">
        Your life uncoiling from the centre — each ring is a year, each dot a recorded moment.
        Tap a dot to feel when it happened.
      </p>

      <div ref={containerRef} className="relative flex justify-center">
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          style={{ width: canvasSize, height: canvasSize, cursor: 'pointer' }}
          className="rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border)]"
          onClick={handleCanvasClick}
        />

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-10 max-w-[260px] rounded-xl p-3 bg-[var(--color-surface-card)] border border-[var(--color-border)] shadow-lg"
            style={{
              left: Math.min(tooltip.x, canvasSize - 270),
              top: tooltip.y + 16,
            }}
          >
            <button
              onClick={handleDismissTooltip}
              className="absolute top-1 right-2 text-text-secondary hover:text-text-primary text-sm"
              aria-label="Close tooltip"
            >
              x
            </button>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: EVENT_CATEGORY_COLOURS[tooltip.event.category] ?? '#8b5cf6' }}
              />
              <span className="text-xs text-text-secondary font-body">
                {formatDateAU(tooltip.event.date)} &middot; {tooltip.event.source}
              </span>
            </div>
            <h4 className="font-display font-semibold text-sm text-text-primary mb-1">
              {tooltip.event.title}
            </h4>
            <p className="text-text-secondary font-body text-xs leading-relaxed">
              {tooltip.event.content}
            </p>
          </div>
        )}
      </div>

      {/* Category legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        {(Object.entries(EVENT_CATEGORY_COLOURS) as Array<[EventCategory, string]>).map(([cat, colour]) => (
          <div key={cat} className="flex items-center gap-1.5 text-xs text-text-secondary font-body">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: colour }}
            />
            <span className="capitalize">{cat}</span>
          </div>
        ))}
      </div>

      <p className="text-center text-text-secondary font-body text-xs mt-4">
        {events.length} event{events.length !== 1 ? 's' : ''} plotted across {totalYears} year{totalYears !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
