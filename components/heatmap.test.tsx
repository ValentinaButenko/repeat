import { describe, it, expect } from 'vitest';
import { computeStreak } from './Heatmap';
import { addDays, toISODate } from '../lib/date';

describe('Heatmap streak', () => {
  it('computes consecutive days correctly', () => {
    const today = new Date();
    const events: Record<string, number> = {};
    events[toISODate(today)] = 1;
    events[toISODate(addDays(today, -1))] = 2;
    events[toISODate(addDays(today, -2))] = 0;
    expect(computeStreak(events, toISODate(today))).toBe(2);
  });
});


