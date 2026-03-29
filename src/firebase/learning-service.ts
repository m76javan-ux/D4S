import { doc, getDoc, setDoc, updateDoc, increment, arrayUnion, serverTimestamp, type Firestore, Timestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './errors';
import { calculateNextReview, SRSGrade } from '@/services/srs-service';

export async function saveSRSResult(db: Firestore, userId: string, itemId: string, itemType: 'vocabulary' | 'grammar', grade: SRSGrade) {
  const srsRef = doc(db, 'users', userId, 'srs', itemId);
  const path = `users/${userId}/srs/${itemId}`;
  
  try {
    const docSnap = await getDoc(srsRef);
    const currentData = docSnap.exists() ? {
      interval: docSnap.data().interval,
      easeFactor: docSnap.data().easeFactor,
      repetitions: docSnap.data().repetitions,
      dueDate: docSnap.data().dueDate.toDate()
    } : undefined;

    const nextReview = calculateNextReview(grade, currentData);

    await setDoc(srsRef, {
      userId,
      itemId,
      itemType,
      ...nextReview,
      dueDate: Timestamp.fromDate(nextReview.dueDate),
      lastReviewed: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function ensureUserProfile(db: Firestore, userId: string) {
  const progressRef = doc(db, 'users', userId, 'progress', 'current');
  const path = `users/${userId}/progress/current`;
  
  try {
    const docSnap = await getDoc(progressRef);

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
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateLearnerProgress(db: Firestore, userId: string, type: 'grammar' | 'vocabulary' | 'conversation', isCorrect: boolean) {
  const progressRef = doc(db, 'users', userId, 'progress', 'current');
  const path = `users/${userId}/progress/current`;
  
  const updates: any = {
    xp: increment(isCorrect ? 10 : 2),
    updatedAt: serverTimestamp()
  };

  if (type === 'grammar') {
    updates.v2Accuracy = increment(isCorrect ? 0.05 : -0.02);
  } else if (type === 'vocabulary') {
    updates.vocabAccuracy = increment(isCorrect ? 0.05 : -0.02);
  }

  try {
    await updateDoc(progressRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function completeLesson(db: Firestore, userId: string, lessonId: string) {
  const progressRef = doc(db, 'users', userId, 'progress', 'current');
  const path = `users/${userId}/progress/current`;
  
  try {
    await updateDoc(progressRef, {
      completedLessons: arrayUnion(lessonId),
      xp: increment(50),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function refillHearts(db: Firestore, userId: string) {
  const progressRef = doc(db, 'users', userId, 'progress', 'current');
  const path = `users/${userId}/progress/current`;
  
  try {
    await updateDoc(progressRef, {
      hearts: 5,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
