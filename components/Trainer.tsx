"use client";
import { useEffect, useState } from 'react';
import type { Card, ReviewRating, UUID } from '../db/types';
import { db } from '../db';
import { getDueCards, review } from '../lib/fsrs';
import { StudyEventsRepo } from '../repo/studyEvents';

interface Props {
  scope: { setId?: UUID } | { all: true };
}

type Phase = 'show' | 'reveal' | 'done';

export default function Trainer({ scope }: Props) {
  const [cards, setCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('show');

  useEffect(() => {
    async function load() {
      const all = scopeHasAll(scope) ? await db.cards.toArray() : await db.cards.where('setId').equals((scope as { setId: UUID }).setId).toArray();
      const due = getDueCards(all);
      setCards(due);
      setIndex(0);
      setPhase('show');
    }
    load();
  }, [scope]);

  const current = cards[index];

  function onReveal() {
    setPhase('reveal');
  }

  async function onRate(r: ReviewRating) {
    if (!current) return;
    const updated = review(current, r, new Date());
    await db.cards.put(updated);
    await StudyEventsRepo.incrementToday(1);
    if (typeof window !== 'undefined') {
      const todayKey = new Date();
      window.dispatchEvent(new CustomEvent('study:progress', { detail: { date: todayKey } }));
    }
    const nextIndex = index + 1;
    if (nextIndex >= cards.length) {
      setPhase('done');
    } else {
      setIndex(nextIndex);
      setPhase('show');
    }
  }

  if (!current && phase !== 'done') {
    return <div className="text-sm text-gray-600">No cards due. Add new cards or study new cards anyway.</div>;
  }

  if (phase === 'done') {
    return <div className="text-sm">Session complete.</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-lg font-semibold">{current.front}</div>
      {phase === 'reveal' && <div className="text-gray-700">{current.back}</div>}
      {phase === 'show' ? (
        <button className="rounded-md bg-gray-800 text-white px-3 py-2 text-sm w-fit" onClick={onReveal}>Show answer</button>
      ) : (
        <div className="flex gap-2">
          <button className="rounded-md bg-red-600 text-white px-3 py-2 text-sm" onClick={() => onRate('again')}>Again (1)</button>
          <button className="rounded-md bg-orange-600 text-white px-3 py-2 text-sm" onClick={() => onRate('hard')}>Hard (2)</button>
          <button className="rounded-md bg-green-600 text-white px-3 py-2 text-sm" onClick={() => onRate('good')}>Good (3)</button>
          <button className="rounded-md bg-blue-600 text-white px-3 py-2 text-sm" onClick={() => onRate('easy')}>Easy (4)</button>
        </div>
      )}
      <div className="text-xs text-gray-500">{index + 1} / {cards.length}</div>
    </div>
  );
}

function scopeHasAll(scope: Props['scope']): scope is { all: true } {
  return 'all' in scope && scope.all === true;
}


