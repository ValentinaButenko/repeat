import { describe, it, expect } from 'vitest';
import { getDueCards, initCard, review } from './fsrs';
import type { Card } from '../db/types';

function makeCard(): Card {
  const now = new Date().toISOString();
  return {
    id: 'c1',
    setId: 's1',
    front: 'hola',
    back: 'hello',
    stability: 0.4,
    difficulty: 0.3,
    due: now.slice(0, 10),
    reviewCount: 0,
    lapseCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}

describe('FSRS', () => {
  it('getDueCards returns cards due today', () => {
    const c = makeCard();
    const due = getDueCards([c]);
    expect(due).toHaveLength(1);
  });

  it('review updates interval and counters', () => {
    const c = makeCard();
    const r = review(c, 'good', new Date());
    expect(r.reviewCount).toBe(1);
    expect(r.due >= c.due).toBeTruthy();
  });

  it('again increases lapseCount', () => {
    const c = makeCard();
    const r = review(c, 'again', new Date());
    expect(r.lapseCount).toBe(1);
  });
});


