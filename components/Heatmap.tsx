"use client";
import { useEffect, useMemo, useState } from 'react';
import { StudyEventsRepo } from '../repo/studyEvents';
import { addDays, toISODate, localISODate } from '../lib/date';

const COLOR_EMPTY = '#FFFFFF';
const COLOR_TODAY = '#D6D3CC';
const COLOR_SCALE = [
  'rgba(238, 104, 63, 0.45)',
  'rgba(238, 104, 63, 0.65)',
  'rgba(238, 104, 63, 0.85)',
  'rgb(238, 104, 63)'
];

export function computeStreak(events: Record<string, number>, today: string = localISODate()): number {
  let streak = 0;
  let d = new Date(today);
  while (true) {
    const key = toISODate(d);
    if ((events[key] ?? 0) > 0) {
      streak++;
      d = addDays(d, -1);
    } else break;
  }
  return streak;
}

export default function Heatmap({ columns = 53, cell = 12 }: { columns?: number; cell?: number } = {}) {
  const [events, setEvents] = useState<Record<string, number>>({});

  useEffect(() => {
    const end = new Date();
    const span = columns * 7 - 1;
    const start = addDays(end, -span);
    StudyEventsRepo.getRange(toISODate(start), toISODate(end)).then(setEvents);
    function onProgress() {
      // refresh only the last two days quickly
      StudyEventsRepo.getRange(toISODate(addDays(end, -1)), toISODate(end)).then((partial) => {
        setEvents((prev) => ({ ...prev, ...partial }));
      });
    }
    window.addEventListener('study:progress', onProgress);
    return () => window.removeEventListener('study:progress', onProgress);
  }, [columns]);

  const cells = useMemo(() => {
    const today = new Date();
    const days: { date: string; count: number }[] = [];
    const totalDays = columns * 7 - 1;
    for (let i = totalDays; i >= 0; i--) {
      const d = addDays(today, -i);
      const key = toISODate(d);
      days.push({ date: key, count: events[key] ?? 0 });
    }
    return days;
  }, [events, columns]);

  const streak = computeStreak(events);

  function colorForCell(count: number, isToday: boolean): string {
    if (count <= 0) return isToday ? COLOR_TODAY : COLOR_EMPTY;
    if (count === 1) return COLOR_SCALE[0];
    if (count <= 3) return COLOR_SCALE[1];
    if (count <= 6) return COLOR_SCALE[2];
    return COLOR_SCALE[3];
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-end items-center" style={{ fontFamily: 'var(--font-bitter)', fontWeight: 700, fontSize: 16, color: '#1C1D17' }}>
        <span>{streak}</span>
      </div>
      <div
        aria-label="Study activity heatmap"
        className={`grid gap-1`}
        style={{ gridTemplateColumns: `repeat(${columns}, ${cell}px)`, gridAutoRows: `${cell}px`, direction: 'rtl' }}
      >
        {cells.map((cell) => (
          <div
            key={cell.date}
            title={`${cell.date}: ${cell.count}`}
            className={`rounded-sm`}
            style={{ width: `${cellSizePx(cell)}`, height: `${cellSizePx(cell)}`, backgroundColor: colorForCell(cell.count, cell.date === toISODate(new Date())) }}
          />)
        )}
      </div>
    </div>
  );
}

function cellSizePx(_cell: { date: string; count: number }): string {
  return '12px';
}


