import type { Card, ReviewRating } from '../db/types';
import { addDays, toISODate } from './date';

// Tunable constants (documented)
const BASE_STABILITY = 0.4; // days-equivalent
const BASE_DIFFICULTY = 0.3; // 0..1 (lower is easier)
const DIFFICULTY_STEP = 0.08; // change per rating step
const MIN_DIFFICULTY = 0.05;
const MAX_DIFFICULTY = 0.95;
const INTERVAL_GROWTH = 2.2; // multiplicative factor influenced by stability and difficulty

export function initCard(card: Card, now = new Date()): Card {
  return {
    ...card,
    stability: BASE_STABILITY,
    difficulty: BASE_DIFFICULTY,
    due: toISODate(now),
    reviewCount: 0,
    lapseCount: 0,
  };
}

export function getDueCards(cards: Card[], now = new Date()): Card[] {
  const today = toISODate(now);
  return cards.filter((c) => c.due <= today);
}

export function review(card: Card, rating: ReviewRating, now = new Date()): Card {
  const { nextStability, nextDifficulty, intervalDays } = fsrsNext(card, rating);
  return {
    ...card,
    stability: nextStability,
    difficulty: nextDifficulty,
    due: toISODate(addDays(now, Math.max(1, Math.round(intervalDays)))),
    lastReviewed: now.toISOString(),
    reviewCount: card.reviewCount + 1,
    lapseCount: rating === 'again' ? card.lapseCount + 1 : card.lapseCount,
    updatedAt: now.toISOString(),
  };
}

export function fsrsNext(card: Card, rating: ReviewRating): {
  nextStability: number;
  nextDifficulty: number;
  intervalDays: number;
} {
  const qualityIndex: Record<ReviewRating, number> = {
    again: 0,
    hard: 1,
    good: 2,
    easy: 3,
  };
  const q = qualityIndex[rating];

  // Difficulty adjustment: down for easy, up for again
  const difficultyDelta = (1 - q / 3) * DIFFICULTY_STEP - (q === 3 ? DIFFICULTY_STEP : 0);
  const nextDifficultyUnclamped = card.difficulty + difficultyDelta;
  const nextDifficulty = clamp(nextDifficultyUnclamped, MIN_DIFFICULTY, MAX_DIFFICULTY);

  // Stability grows multiplicatively when successful, resets partially on lapses
  let nextStability = card.stability;
  if (rating === 'again') {
    nextStability = Math.max(BASE_STABILITY * 0.5, card.stability * 0.5);
  } else {
    const growth = INTERVAL_GROWTH * (1 - nextDifficulty * 0.7);
    nextStability = card.stability * growth;
  }
  const intervalDays = Math.max(1, nextStability);
  return { nextStability, nextDifficulty, intervalDays };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}


