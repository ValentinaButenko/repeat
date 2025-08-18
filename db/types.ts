export type UUID = string;
export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export interface UserSettings {
  id: 'singleton';
  learningLanguage: string;
  nativeLanguage: string;
  translationApiBaseUrl?: string;
  lastStudiedSetId?: UUID;
  createdAt: string;
  updatedAt: string;
}

export interface CardSet {
  id: UUID;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  id: UUID;
  setId: UUID;
  front: string;
  back: string;
  note?: string;

  stability: number;
  difficulty: number;
  due: string; // ISO date string (YYYY-MM-DD)
  lastReviewed?: string;
  reviewCount: number;
  lapseCount: number;

  createdAt: string;
  updatedAt: string;
}

export interface StudyEvent {
  id: UUID;
  date: string; // YYYY-MM-DD (local)
  count: number; // reviews completed that day
}


