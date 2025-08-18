"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Modal from '../../../../../../components/Modal';
import SetPicker from '../../../../../../components/SetPicker';
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

  async function changeSet(targetSetId: string) {
    if (!card) return;
    try {
      await CardRepo.move(card.id, targetSetId);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cards:changed', { detail: { setId: card.setId } }));
        window.dispatchEvent(new CustomEvent('cards:changed', { detail: { setId: targetSetId } }));
      }
    } catch {
      setError('Duplicate exists in target set.');
    }
  }

  return (
    <Modal title="Edit card">
      {!card ? (
        <div className="p-4 text-sm">Loading…</div>
      ) : (
        <div className="flex flex-col gap-6" style={{ fontFamily: 'var(--font-bitter)' }}>
          <div className="flex gap-6">
            <input className="input flex-1" value={front} onChange={(e) => setFront(e.target.value)} />
            <div className="w-[280px]">
              <SetPicker value={card.setId} onChange={changeSet} />
            </div>
          </div>
          <textarea className="input" style={{ height: 300, padding: 20 }} value={back} onChange={(e) => setBack(e.target.value)} />
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex items-center justify-between mt-2">
            <button onClick={remove} className="btn-primary" style={{ background: '#EE683F', width: 120 }}>Delete</button>
            <div className="flex items-center gap-4">
              <button onClick={() => history.back()} className="btn-secondary">Cancel</button>
              <button onClick={save} className="btn-primary" style={{ width: 120 }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}


