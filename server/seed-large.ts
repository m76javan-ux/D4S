import { adminDb } from "./firebase-admin";
import * as admin from 'firebase-admin';

export async function seedLargeDatabase(totalExercises: number = 20000) {
  const batchSize = 500;
  const exercisesCollection = adminDb.collection("practice_exercises");

  for (let i = 0; i < totalExercises; i += batchSize) {
    const batch = adminDb.batch();
    for (let j = 0; j < batchSize && (i + j) < totalExercises; j++) {
      const id = `ex_large_${i + j}`;
      const ref = exercisesCollection.doc(id);
      batch.set(ref, {
        type: "flashcard",
        question: `Question ${i + j}`,
        answer: `Answer ${i + j}`,
        dutch: `Dutch ${i + j}`,
        farsi: `Farsi ${i + j}`,
        explanation: `Explanation ${i + j}`,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    await batch.commit();
    console.log(`Committed batch ${i / batchSize + 1}`);
  }
  return totalExercises;
}
