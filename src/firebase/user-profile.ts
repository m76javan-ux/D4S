import { doc, getDoc, setDoc, serverTimestamp, type Firestore } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './errors';

export async function ensureUserProfile(db: Firestore, userId: string) {
  console.log("ensureUserProfile called for userId:", userId);
  const progressRef = doc(db, 'users', userId, 'progress', 'current');
  const path = `users/${userId}/progress/current`;
  
  try {
    const docSnap = await getDoc(progressRef);
    console.log("ensureUserProfile: docSnap.exists() =", docSnap.exists());

    if (!docSnap.exists()) {
      await setDoc(progressRef, {
        userId,
        level: 'A1',
        xp: 0,
        streak: 0,
        hearts: 5,
        v2Accuracy: 0.5,
        deHetAccuracy: 0.5,
        vocabAccuracy: 0.5,
        wordsLearned: 0,
        struggleAreas: [],
        completedLessons: [],
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error("ensureUserProfile error for userId:", userId, error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
