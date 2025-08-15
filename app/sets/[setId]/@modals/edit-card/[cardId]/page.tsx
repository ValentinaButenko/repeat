"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Modal from '../../../../../../components/Modal';
import type { Card } from '../../../../../../db/types';
import { db } from '../../../../../../db';
import { CardRepo } from '../../../../../../repo/cards';
import { normalizeFront } from '../../../../../../repo/normalize';

export default function EditCardModal() {
  const router = useRouter();
  const params = useParams<{ setId: string; cardId: string }>();
  const [card, setCard] = useState<Card | null>(null);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    db.cards.get(params.cardId).then((c) => {
      if (!c) return;
      setCard(c);
      setFront(c.front);
      setBack(c.back);
    });
  }, [params.cardId]);

  async function save() {
    if (!card) return;
    const nf = normalizeFront(front);
    if (front !== card.front && (await CardRepo.existsInSet(card.setId, nf))) {
      setError('Duplicate front exists in this set.');
      return;
    }
    await CardRepo.update(card.id, { front, back });
    router.back();
  }

  async function remove() {
    if (!card) return;
    await CardRepo.remove(card.id);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cards:changed', { detail: { setId: card.setId } }));
    }
    router.back();
  }

  async function move(targetSetId: string) {
    if (!card) return;
    try {
      await CardRepo.move(card.id, targetSetId);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cards:changed', { detail: { setId: card.setId } }));
        window.dispatchEvent(new CustomEvent('cards:changed', { detail: { setId: targetSetId } }));
      }
      router.back();
    } catch {
      setError('Duplicate exists in target set.');
    }
  }

  return (
    <Modal title="Edit card">
      {!card ? (
        <div className="p-4 text-sm">Loading…</div>
      ) : (
        <div className="flex flex-col gap-3">
          <input className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={front} onChange={(e) => setFront(e.target.value)} />
          <textarea className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={back} onChange={(e) => setBack(e.target.value)} rows={3} />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex gap-2 justify-between">
            <button onClick={remove} className="rounded-md bg-red-600 text-white px-3 py-2 text-sm">Delete</button>
            <div className="flex gap-2">
              <button onClick={() => move(prompt('Target set ID?') || card.setId)} className="rounded-md border px-3 py-2 text-sm">Move</button>
              <button onClick={() => history.back()} className="rounded-md border px-3 py-2 text-sm">Cancel</button>
              <button onClick={save} className="rounded-md bg-blue-600 text-white px-3 py-2 text-sm">Save</button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}


