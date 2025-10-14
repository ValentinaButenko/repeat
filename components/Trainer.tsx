"use client";
import { useEffect, useState } from 'react';
import type { Card, ReviewRating, UUID } from '../db/types';
import { db } from '../db';
import { getDueCards, review } from '../lib/fsrs';
import { StudyEventsRepo } from '../repo/studyEvents';
import Link from 'next/link';
import { UserSettingsRepo } from '../repo/userSettings';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
 

interface Props {
  scope: { setId?: UUID } | { all: true };
  forceAll?: boolean; // when true, start session with all cards in scope, not just due
}

type Phase = 'show' | 'reveal' | 'done';

export default function Trainer({ scope, forceAll = false }: Props) {
  const [cards, setCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('show');
  const [successGif, setSuccessGif] = useState<string>('');
  const total = cards.length;
  const progress = total === 0 ? 0 : phase === 'done' ? 100 : (index / total) * 100;

  // List of available success GIFs
  const successGifs = [
    '/success-gifs/celebration1.gif',
    '/success-gifs/celebration2.gif',
    '/success-gifs/celebration3.gif',
    '/success-gifs/celebration4.gif',
    '/success-gifs/celebration5.gif',
    '/success-gifs/celebration6.gif',
  ];

  useEffect(() => {
    async function load() {
      const all = scopeHasAll(scope)
        ? await db.cards.toArray()
        : await db.cards.where('setId').equals((scope as { setId: UUID }).setId).toArray();
      const initial = forceAll ? all : getDueCards(all);
      setCards(initial);
      setIndex(0);
      setPhase('show');
      // remember last studied set
      if (!scopeHasAll(scope)) {
        await UserSettingsRepo.save({ lastStudiedSetId: (scope as { setId: UUID }).setId });
      }
    }
    load();
  }, [scope, forceAll]);

  const current = cards[index];

  function onReveal() {
    setPhase('reveal');
  }

  async function onRate(r: ReviewRating) {
    try {
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
        // Select random GIF when completing session
        const randomGif = successGifs[Math.floor(Math.random() * successGifs.length)];
        setSuccessGif(randomGif);
        setPhase('done');
      } else {
        setIndex(nextIndex);
        setPhase('show');
      }
    } catch (err) {
      // Surface errors to help diagnose issues where rating appears to do nothing
      console.error('Failed to apply rating', err);
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (phase === 'show' && (e.code === 'Space' || e.key === ' ')) {
        e.preventDefault();
        onReveal();
        return;
      }
      if (phase === 'reveal') {
        const key = e.key?.toLowerCase();
        const code = e.code;
        if (key === 'q' || code === 'KeyQ') { e.preventDefault(); onRate('again'); }
        if (key === 'w' || code === 'KeyW') { e.preventDefault(); onRate('hard'); }
        if (key === 'e' || code === 'KeyE') { e.preventDefault(); onRate('good'); }
        if (key === 'r' || code === 'KeyR') { e.preventDefault(); onRate('easy'); }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, current]);

  function onRestart() {
    setIndex(0);
    setPhase('show');
  }

  async function restartAll() {
    const all = scopeHasAll(scope)
      ? await db.cards.toArray()
      : await db.cards.where('setId').equals((scope as { setId: UUID }).setId).toArray();
    setCards(all);
    setIndex(0);
    setPhase('show');
  }

  // removed Train next set action per new UX

  if (!current && phase !== 'done') {
    return <div className="text-sm text-gray-600">No cards due. Add new cards or study new cards anyway.</div>;
  }

  const showCompletion = phase === 'done';

  return (
    <div className="flex flex-col gap-10">
      {!showCompletion && (
        <>
          {/* Card */}
          <button
            onClick={() => phase === 'show' ? onReveal() : undefined}
            className="mx-auto w-[560px] h-[500px] rounded-[12px] p-10 flex flex-col items-center justify-center gap-8"
            style={{ background: 'rgba(255,255,255,0.3)' }}
          >
            {/* Word / Translation */}
            <div className="flex flex-col items-center justify-center gap-8 w-full">
              <div 
                className="text-[#1C1D17] text-center leading-tight w-full"
                style={{ 
                  fontSize: '48px', 
                  fontFamily: 'var(--font-bitter)', 
                  fontWeight: 500 
                }}
              >
                {current.front}
              </div>
              {/* Separator */}
              <div className="w-1/2 h-px" style={{ background: '#FFFFFF' }} />
              {/* Info labels or translation */}
              {phase === 'show' ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="text-[16px] font-medium text-[#1C1D17] font-[var(--font-bitter)]">Click to reveal</div>
                  <div className="text-[16px] font-medium text-[#8D8E8B] font-[var(--font-bitter)]">Space</div>
                </div>
              ) : (
                <div 
                  className="text-[#5B5B55] text-center leading-tight w-full"
                  style={{ 
                    fontSize: '24px', 
                    fontFamily: 'var(--font-bitter)', 
                    fontWeight: 400 
                  }}
                >
                  {current.back}
                </div>
              )}
            </div>
          </button>

          {/* Rating buttons */}
          {phase === 'reveal' && (
            <div className="flex items-center justify-center gap-6">
              <button onClick={() => onRate('again')} className="btn-primary" style={{ background: '#EE683F', width: '120px' }}>
                <span>Again</span>
                <span style={{ color: 'rgba(246,244,240,0.6)' }}>Q</span>
              </button>
              <button onClick={() => onRate('hard')} className="btn-primary" style={{ background: '#F59B14', width: '120px' }}>
                <span>Hard</span>
                <span style={{ color: 'rgba(246,244,240,0.6)' }}>W</span>
              </button>
              <button onClick={() => onRate('good')} className="btn-primary" style={{ background: '#289500', width: '120px' }}>
                <span>Good</span>
                <span style={{ color: 'rgba(246,244,240,0.6)' }}>E</span>
              </button>
              <button onClick={() => onRate('easy')} className="btn-primary" style={{ background: '#008995', width: '120px' }}>
                <span>Easy</span>
                <span style={{ color: 'rgba(246,244,240,0.6)' }}>R</span>
              </button>
            </div>
          )}

          {/* Progress and navigation (fixed at bottom with 80px margin) */}
          <div className="fixed bottom-[80px] left-[360px] right-[360px] flex flex-col gap-3 px-6 mt-8">
            <div className="flex items-center justify-between w-full">
              <button
                className="btn-secondary"
                onClick={() => {
                  const prev = Math.max(0, index - 1);
                  setIndex(prev);
                  setPhase('show');
                }}
              >
                <CaretLeft size={20} color="#1C1D17" />
                <span>Previous</span>
              </button>
              <div className="text-[16px] font-medium font-[var(--font-bitter)] text-[#1C1D17]">
                {Math.min(index + 1, total)} / {total}
              </div>
              <button
                className="btn-secondary"
                onClick={() => {
                  const next = Math.min(total - 1, index + 1);
                  setIndex(next);
                  setPhase('show');
                }}
              >
                <span>Next</span>
                <CaretRight size={20} color="#1C1D17" />
              </button>
            </div>
            <div className="w-full h-1" style={{ background: '#FFFFFF' }}>
              <div 
                className="h-full transition-all duration-500 ease-out" 
                style={{ width: `${progress}%`, background: '#1C1D17' }} 
              />
            </div>
          </div>
        </>
      )}

      {showCompletion && (
        <div className="flex flex-col items-center gap-6 mt-4">
          {successGif ? (
            <img
              src={successGif}
              alt="Success animation"
              className="w-[520px] h-auto rounded-[8px]"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div 
              className="w-[120px] h-[120px] flex items-center justify-center rounded-full"
              style={{ backgroundColor: '#289500' }}
            >
              <svg 
                width="60" 
                height="60" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="20,6 9,17 4,12" />
              </svg>
            </div>
          )}
          <div
            className="text-center text-[#1C1D17] font-[var(--font-bitter)] font-medium"
            style={{ fontSize: 28, fontFamily: 'var(--font-bitter), serif' }}
          >
            {`Woow... you’ve studied ${cards.length} cards!`}
          </div>
          <div className="flex items-center justify-center gap-6 mt-6">
            <button
              className="btn-primary"
              onClick={restartAll}
            >
              Repeat again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function scopeHasAll(scope: Props['scope']): scope is { all: true } {
  return 'all' in scope && scope.all === true;
}


