export type SRSGrade = 'Again' | 'Hard' | 'Good' | 'Easy';

export interface SRSData {
  interval: number; // in days
  easeFactor: number;
  repetitions: number;
  dueDate: Date;
}

/**
 * Implements a simplified SuperMemo-2 (SM-2) algorithm for Spaced Repetition.
 * @param grade The user's performance on the item.
 * @param currentData The current SRS metadata for the item.
 * @returns Updated SRS metadata with the next review date.
 */
export function calculateNextReview(grade: SRSGrade, currentData?: SRSData): SRSData {
  let { interval = 0, easeFactor = 2.5, repetitions = 0 } = currentData || {};

  if (grade === 'Again') {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 4; // Slightly more aggressive than standard SM-2 for language learning
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions++;
  }

  // Adjust ease factor based on grade
  // 5: Easy, 4: Good, 3: Hard, 0: Again
  const gradeValue = { 'Again': 0, 'Hard': 3, 'Good': 4, 'Easy': 5 }[grade];
  
  // SM-2 Ease Factor formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - gradeValue) * (0.08 + (5 - gradeValue) * 0.02));
  
  // Minimum ease factor is 1.3
  if (easeFactor < 1.3) easeFactor = 1.3;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + interval);

  return { interval, easeFactor, repetitions, dueDate };
}
