import { db } from '../db';
import type { Card, UUID } from '../db/types';
import { normalizeFront } from './normalize';

function uuid(): UUID {
  return crypto.randomUUID();
}

export const CardRepo = {
  async listBySet(setId: UUID): Promise<Card[]> {
    return db.cards.where('setId').equals(setId).sortBy('updatedAt');
  },
  async create(data: { setId: UUID; front: string; back: string; note?: string }): Promise<Card> {
    const now = new Date().toISOString();
    const card: Card = {
      id: uuid(),
      setId: data.setId,
      front: data.front,
      back: data.back,
      note: data.note,
      stability: 0.4,
      difficulty: 0.3,
      due: new Date().toISOString().slice(0, 10),
      reviewCount: 0,
      lapseCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    await db.cards.add(card);
    await db.sets.update(card.setId, { updatedAt: now });
    return card;
  },
  async update(id: UUID, patch: Partial<Card>): Promise<void> {
    const now = new Date().toISOString();
    await db.cards.update(id, { ...patch, updatedAt: now });
  },
  async remove(id: UUID): Promise<void> {
    await db.cards.delete(id);
  },
  async existsInSet(setId: UUID, normalizedFront: string): Promise<boolean> {
    const cards = await db.cards.where('setId').equals(setId).toArray();
    return cards.some((c) => normalizeFront(c.front) === normalizedFront);
  },
  async move(id: UUID, targetSetId: UUID): Promise<void> {
    const card = await db.cards.get(id);
    if (!card) return;
    const nf = normalizeFront(card.front);
    if (await this.existsInSet(targetSetId, nf)) {
      throw new Error('DUPLICATE_FRONT_IN_SET');
    }
    const now = new Date().toISOString();
    await db.cards.update(id, { setId: targetSetId, updatedAt: now });
  },
};

export async function safeCreateCard(setId: UUID, front: string, back: string, note?: string) {
  const nf = normalizeFront(front);
  if (await CardRepo.existsInSet(setId, nf)) {
    throw new Error('DUPLICATE_FRONT_IN_SET');
  }
  return CardRepo.create({ setId, front, back, note });
}


