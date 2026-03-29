import { adminDb } from "./firebase-admin";
import * as admin from 'firebase-admin';

const DEFAULT_USER_DATA = {
  profile: {
    level: "A1",
    streak: 0,
    xp: 0,
  },
  progress: {
    v2Accuracy: 1.0,
    deHetAccuracy: 1.0,
    vocabAccuracy: 1.0,
    wordsLearned: 0,
    struggleAreas: []
  },
  last_interaction: {
    topic: null,
  }
};

export async function ensureUserProfile(userId: string) {
  try {
    const ref = adminDb.collection("users").doc(userId);
    const docSnap = await ref.get();

    if (!docSnap.exists) {
      await ref.set({
        ...DEFAULT_USER_DATA,
        profile: {
          ...DEFAULT_USER_DATA.profile,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        },
        last_interaction: {
          ...DEFAULT_USER_DATA.last_interaction,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        }
      });
    }
  } catch (error) {
    // Suppress error log to avoid user confusion when using defaults
  }
}

export function getDefaultUserData() {
  return DEFAULT_USER_DATA;
}
