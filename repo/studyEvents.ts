import { db } from '../db';
import type { StudyEvent, UUID } from '../db/types';
import { toISODate } from '../lib/date';

function uuid(): UUID {
  return crypto.randomUUID();
}

export const StudyEventsRepo = {
  async incrementToday(by: number = 1): Promise<void> {
    const date = toISODate(new Date());
    const existing = await db.studyEvents.where('date').equals(date).first();
    if (existing) {
      await db.studyEvents.update(existing.id, { count: existing.count + by });
    } else {
      const ev: StudyEvent = { id: uuid(), date, count: by };
      await db.studyEvents.add(ev);
    }
  },
  async getRange(start: string, end: string): Promise<Record<string, number>> {
    const rows = await db.studyEvents
      .where('date')
      .between(start, end, true, true)
      .toArray();
    const map: Record<string, number> = {};
    for (const r of rows) map[r.date] = r.count;
    return map;
  },
};


