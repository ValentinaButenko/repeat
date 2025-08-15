import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db';
import { CardRepo, safeCreateCard } from './cards';
import { SetRepo } from './sets';

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe('Duplicate guards', () => {
  it('prevents duplicate fronts within the same set', async () => {
    const s = await SetRepo.create('A');
    await safeCreateCard(s.id, ' Hola ', 'hello');
    await expect(safeCreateCard(s.id, 'hola', 'hello')).rejects.toThrow('DUPLICATE_FRONT_IN_SET');
  });

  it('prevents moving into duplicate front in target set', async () => {
    const s1 = await SetRepo.create('A');
    const s2 = await SetRepo.create('B');
    const c1 = await safeCreateCard(s1.id, 'hola', 'hello');
    await safeCreateCard(s2.id, 'hola', 'hello again');
    await expect(CardRepo.move(c1.id, s2.id)).rejects.toThrow('DUPLICATE_FRONT_IN_SET');
  });
});


