import { db } from '../db';
import type { CardSet, UUID } from '../db/types';

function uuid(): UUID {
  return crypto.randomUUID();
}

export const SetRepo = {
  async list(): Promise<CardSet[]> {
    return db.sets.orderBy('updatedAt').reverse().toArray();
  },
  async create(name: string): Promise<CardSet> {
    const now = new Date().toISOString();
    const set: CardSet = { id: uuid(), name, createdAt: now, updatedAt: now };
    await db.sets.add(set);
    return set;
  },
  async rename(id: UUID, name: string): Promise<void> {
    const now = new Date().toISOString();
    await db.sets.update(id, { name, updatedAt: now });
  },
  async remove(id: UUID): Promise<void> {
    await db.transaction('rw', db.cards, db.sets, async () => {
      await db.cards.where('setId').equals(id).delete();
      await db.sets.delete(id);
    });
  },
};


