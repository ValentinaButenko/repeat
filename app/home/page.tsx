"use client";
import Link from 'next/link';
import Heatmap from '../../components/Heatmap';
import { db } from '../../db';
import { useEffect, useState } from 'react';
import type { CardSet } from '../../db/types';
import { SetRepo } from '../../repo/sets';

export default function HomePage() {
  const [sets, setSets] = useState<CardSet[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    let mounted = true;
    SetRepo.list().then((s) => mounted && setSets(s));
    const interval = setInterval(() => {
      SetRepo.list().then((s) => mounted && setSets(s));
    }, 500);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let canceled = false;
    async function loadCounts() {
      const entries = await Promise.all(
        sets.map(async (s) => {
          const c = await db.cards.where('setId').equals(s.id).count();
          return [s.id, c] as const;
        })
      );
      if (!canceled) {
        const map: Record<string, number> = {};
        for (const [id, c] of entries) map[id] = c;
        setCounts(map);
      }
    }
    if (sets.length) loadCounts();
    return () => {
      canceled = true;
    };
  }, [sets]);
  return (
    <div className="w-full px-[200px] pt-[120px] flex flex-col gap-6">
      <div>
        <h1>Repeat</h1>
        <p className="subtitle mt-2">Let's repeat some words today.</p>
      </div>

      <div className="rounded-xl" style={{ background: 'rgba(255,255,255,0.3)' }}>
        <div className="p-6 flex items-start justify-between gap-6">
          <div className="w-1/2">
            <div className="text-[#1C1D17]" style={{ fontFamily: 'var(--font-bitter)', fontWeight: 500, fontSize: 14 }}>
              “ What you do every day matters more than what you do once in a while ”
            </div>
            <div className="mt-2 text-[#1C1D17] italic" style={{ fontFamily: 'var(--font-bitter)', fontSize: 12 }}>
              - Gretchen Rubin
            </div>
            <div className="mt-4">
              <Link href="/study/all" className="btn-primary">
                <span>Study</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="flex-1 overflow-hidden ml-6">
            <div className="flex items-start justify-end">
              <div className="scale-110 origin-top-right">
                <Heatmap columns={20} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10">
        <div className="flex items-center justify-between mb-2">
          <h2 style={{ fontFamily: 'var(--font-bitter)', fontWeight: 700, fontSize: 24, color: '#1C1D17' }}>My library</h2>
          <div className="flex items-center gap-2">
            <Link href="/home/new-card" className="btn-secondary">
              <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"/>
              </svg>
              <span>Add card</span>
            </Link>
            <Link href="/home/new-set" className="btn-secondary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <rect x="2" y="7" width="14" height="10" rx="2" strokeWidth="1.8" />
                <rect x="6" y="9" width="14" height="10" rx="2" strokeWidth="1.8" />
                <line x1="18" y1="3" x2="18" y2="7" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="16" y1="5" x2="20" y2="5" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span>Add set</span>
            </Link>
          </div>
        </div>
        {sets.length === 0 ? (
          <div className="mt-6 text-sm text-gray-600">No sets yet. Create one to get started.</div>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sets.map((s) => (
              <Link
                key={s.id}
                href={`/sets/${s.id}`}
                className="rounded-xl p-4 transition-all bg-white/30 hover:bg-white/45 active:translate-y-px"
              >
                <div style={{ fontFamily: 'var(--font-bitter)', fontWeight: 600, fontSize: 18, color: '#1C1D17' }}>
                  {s.name}
                </div>
                <div className="mt-3" style={{ fontFamily: 'var(--font-bitter)', fontWeight: 400, fontSize: 14, color: '#5B5B55' }}>
                  {(() => {
                    const c = counts[s.id] ?? 0;
                    if (c === 0) return 'No cards';
                    if (c === 1) return '1 card';
                    return `${c} cards`;
                  })()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


