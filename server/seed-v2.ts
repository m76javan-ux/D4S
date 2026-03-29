import admin from './firebase-admin';
import { exerciseData } from './seed-data';

const db = admin.firestore();

export async function seedV2Exercises() {
  try {
    const batch = db.batch();
    let count = 0;

    for (const exercise of exerciseData) {
      const ref = db.collection('practice_exercises').doc(exercise.id);
      batch.set(ref, {
        ...exercise,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: 'system',
      });
      count++;
    }

    await batch.commit();
    console.log(`Successfully seeded ${count} exercises.`);
    return count;
  } catch (error) {
    console.error('Error seeding exercises:', error);
    throw error;
  }
}

// If run directly
if (process.argv[1] === new URL(import.meta.url).pathname || process.argv[1] === __filename) {
  seedV2Exercises().then(() => process.exit(0)).catch(() => process.exit(1));
}
