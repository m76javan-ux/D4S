import { adminDb } from "./firebase-admin";
import * as admin from 'firebase-admin';

export async function updateProgress(userId: string, intent: string, isCorrect: boolean) {
  if (!userId) return;

  try {
    const userRef = adminDb.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) return;

    const data = userDoc.data() || {};
    const progress = data.progress || {};
    const profile = data.profile || {};

    const updates: any = {};

    // ----------------------------
    // GRAMMAR (V2 accuracy)
    // ----------------------------
    if (intent === "grammar") {
      const currentAccuracy = progress.v2Accuracy ?? 1.0;
      const newAccuracy = (currentAccuracy * 0.9) + (isCorrect ? 0.1 : 0);
      updates["progress.v2Accuracy"] = Math.max(0, Math.min(1, newAccuracy));
    }

    // ----------------------------
    // VOCABULARY
    // ----------------------------
    if (intent === "vocabulary") {
      const currentAccuracy = progress.vocabAccuracy ?? 1.0;
      const newAccuracy = (currentAccuracy * 0.9) + (isCorrect ? 0.1 : 0);
      updates["progress.vocabAccuracy"] = Math.max(0, Math.min(1, newAccuracy));

      // count words learned
      if (isCorrect) {
        const wordsLearned = progress.wordsLearned ?? 0;
        updates["progress.wordsLearned"] = wordsLearned + 1;
      }
    }

    // ----------------------------
    // XP SYSTEM
    // ----------------------------
    const currentXP = profile.xp ?? 0;
    updates["profile.xp"] = currentXP + (isCorrect ? 10 : 2);

    // ----------------------------
    // STREAK SYSTEM
    // ----------------------------
    const currentStreak = profile.streak ?? 0;
    if (isCorrect) {
      updates["profile.streak"] = currentStreak + 1;
    }

    // ----------------------------
    // LAST INTERACTION
    // ----------------------------
    updates["last_interaction.timestamp"] = admin.firestore.FieldValue.serverTimestamp();
    updates["last_interaction.topic"] = intent;

    // ----------------------------
    // SAVE
    // ----------------------------
    if (Object.keys(updates).length > 0) {
      await userRef.update(updates);
    }
  } catch (error) {
    // Suppress error log to avoid user confusion when using defaults
  }
}
