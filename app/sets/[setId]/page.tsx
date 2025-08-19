"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { db } from '../../../db';
import type { Card, CardSet } from '../../../db/types';
import Breadcrumbs from '../../../components/Breadcrumbs';

export default function SetDetails() {
  const params = useParams<{ setId: string }>();
  const search = useSearchParams();
  const [set, setSet] = useState<CardSet | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [query, setQuery] = useState('');

  async function load() {
    const id = params.setId;
    const s = await db.sets.get(id);
    const cs = await db.cards.where('setId').equals(id).toArray();
    setSet(s ?? null);
    setCards(cs);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.setId, search.get('ts')]);

  useEffect(() => {
    function onChanged(e: Event) {
      // refresh if change is for this set
      const detail = (e as CustomEvent<{ setId: string }>).detail;
      if (!detail || detail.setId !== params.setId) return;
      load();
    }
    window.addEventListener('cards:changed', onChanged as EventListener);
    return () => window.removeEventListener('cards:changed', onChanged as EventListener);
  }, [params.setId]);

  if (!set) return <div className="p-6">Set not found.</div>;
  const setId = params.setId;
  const filtered = cards.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return c.front.toLowerCase().includes(q) || (c.back ?? '').toLowerCase().includes(q);
  });
  return (
    <div className="mx-auto pt-[80px] max-w-[1280px] flex flex-col gap-6">
      <Breadcrumbs />
      
      {/* Header - always visible */}
      <div className="flex items-center justify-between">
        <h1 className="m-0">{set.name}</h1>
        {cards.length > 0 && (
          <div className="flex items-center gap-4">
            <Link href={`/sets/${setId}/new-card`} className="btn-secondary">
              <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"/>
              </svg>
              <span>Add card</span>
            </Link>
            <button className="btn-secondary" disabled>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M12 3l2 4 4 2-4 2-2 4-2 4-2-4-4-2 4-2 2-4z" strokeWidth="1.8"/>
              </svg>
              <span>Generate cards</span>
            </button>
            <Link href={`/study/${setId}?restart=1`} className="btn-primary">
              <span>Study</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </Link>
          </div>
        )}
      </div>

      {cards.length === 0 ? (
        // Empty state when no cards exist
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-8">
          <h2 
            className="text-[#60615D] text-[38px] m-0"
            style={{ fontFamily: 'var(--font-bitter)', fontWeight: 400 }}
          >
            No cards in this set
          </h2>
          <div className="flex items-center gap-4">
            <Link href={`/sets/${setId}/new-card`} className="btn-secondary">
              <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"/>
              </svg>
              <span>Add card</span>
            </Link>
            <button className="btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M12 3l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4z" strokeWidth="1.8"/>
              </svg>
              <span>Generate cards</span>
            </button>
          </div>
        </div>
      ) : (
        // Normal state when cards exist
        <>

          {/* Search */}
          <div className="relative">
            <input
              className="input pl-12"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8D8E8B]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <circle cx="11" cy="11" r="7" strokeWidth="1.8" />
                <line x1="16.65" y1="16.65" x2="21" y2="21" strokeWidth="1.8" />
              </svg>
            </div>
          </div>

          {/* Cards grid */}
          {filtered.length === 0 ? (
            <div className="mt-6 text-sm text-gray-600">No matching cards.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((c) => (
                <Link
                  key={c.id}
                  href={`/sets/${setId}/edit-card/${c.id}`}
                  className="rounded-xl p-4 transition-all bg-white/30 hover:bg-white/45 active:translate-y-px"
                >
                  <div className="text-[#1C1D17]" style={{ fontFamily: 'var(--font-bitter)', fontWeight: 600, fontSize: 16 }}>
                    {c.front}
                  </div>
                  <div className="mt-2 text-[#5B5B55]" style={{ fontFamily: 'var(--font-bitter)', fontWeight: 400, fontSize: 12 }}>
                    {c.back}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}


