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
  return (
    <div className="max-w-3xl mx-auto p-6 flex flex-col gap-4">
      <Breadcrumbs />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{set.name}</h1>
        <div className="flex gap-2">
          <Link href={`/study/${setId}`} className="rounded-md bg-blue-600 text-white px-3 py-2 text-sm">Study set</Link>
          <Link href={`/sets/${setId}/new-card`} className="rounded-md border px-3 py-2 text-sm">Add card</Link>
          <button className="rounded-md border px-3 py-2 text-sm" disabled>Generate cards</button>
        </div>
      </div>
      <input placeholder="Search" className="rounded-md border border-gray-300 px-3 py-2 text-sm" />
      <ul className="divide-y">
        {cards.map((c) => (
          <li key={c.id}>
            <Link
              href={`/sets/${setId}/edit-card/${c.id}`}
              className="flex items-center justify-between py-2 px-2 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div>
                <div className="font-medium">{c.front}</div>
                <div className="text-gray-600 text-sm">{c.back}</div>
              </div>
              <span className="text-blue-600 text-sm">Edit</span>
            </Link>
          </li>
        ))}
        {cards.length === 0 && <li className="py-6 text-sm text-gray-600">No cards yet.</li>}
      </ul>
    </div>
  );
}


