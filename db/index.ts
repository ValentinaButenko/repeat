import Dexie, { type Table } from 'dexie';
import type { Card, CardSet, StudyEvent, UserSettings } from './types';

export class AppDatabase extends Dexie {
  userSettings!: Table<UserSettings, string>;
  sets!: Table<CardSet, string>;
  cards!: Table<Card, string>;
  studyEvents!: Table<StudyEvent, string>;

  constructor() {
    super('language-memo-db');
    this.version(1).stores({
      userSettings: 'id',
      sets: 'id, name, updatedAt',
      cards: 'id, setId, due, updatedAt, front',
      studyEvents: 'id, date',
    });
  }
}

export const db = new AppDatabase();

export function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined';
  } catch {
    return false;
  }
}


