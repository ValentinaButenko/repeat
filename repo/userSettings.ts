import { db } from '../db';
import type { UserSettings } from '../db/types';
import { localISODate } from '../lib/date';

export const UserSettingsRepo = {
  async get(): Promise<UserSettings | undefined> {
    return db.userSettings.get('singleton');
  },

  async save(partial: Partial<UserSettings>): Promise<UserSettings> {
    const existing = await db.userSettings.get('singleton');
    const now = new Date().toISOString();
    const base: UserSettings = existing ?? {
      id: 'singleton',
      learningLanguage: 'Spanish',
      nativeLanguage: 'English',
      translationApiBaseUrl: process.env.NEXT_PUBLIC_TRANSLATE_BASE_URL,
      createdAt: now,
      updatedAt: now,
    };
    const next: UserSettings = {
      ...base,
      ...partial,
      updatedAt: now,
    };
    await db.userSettings.put(next);
    return next;
  },
};


