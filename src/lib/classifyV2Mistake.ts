import { V2CompletionResult } from '../components/V2GuidedSlotExercisePro';

export type MistakeType =
  | 'NONE'
  | 'INCOMPLETE'
  | 'V2_VIOLATION'
  | 'SUBJECT_BEFORE_VERB'
  | 'REST_ORDER_ERROR'
  | 'WRONG_SLOT1'
  | 'MULTIPLE_ERRORS';

export function classifyV2Mistake(
  result: V2CompletionResult
): MistakeType {
  const { isCorrect, userOrder, targetOrder } = result;

  if (isCorrect) return 'NONE';
  if ((userOrder?.length || 0) !== (targetOrder?.length || 0)) return 'INCOMPLETE';

  const slot1Correct = userOrder[0] === targetOrder[0];
  const slot2Correct = userOrder[1] === targetOrder[1];

  if (!slot2Correct) {
    if (userOrder[1] === targetOrder[2]) {
      return 'SUBJECT_BEFORE_VERB';
    }
    if (userOrder[2] === targetOrder[1]) {
      return 'V2_VIOLATION';
    }
    return slot1Correct ? 'V2_VIOLATION' : 'MULTIPLE_ERRORS';
  }

  const restCorrect = userOrder.slice(2).every((id, i) => id === targetOrder[i + 2]);

  if (!slot1Correct && restCorrect) return 'WRONG_SLOT1';
  if (slot1Correct && !restCorrect) return 'REST_ORDER_ERROR';

  return 'MULTIPLE_ERRORS';
}
