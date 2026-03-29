import { adminDb } from "./firebase-admin";

async function getUserState(userId: string) {
  if (!userId) return null;
  const userRef = adminDb.collection("users").doc(userId);
  const userDoc = await userRef.get();
  if (!userDoc.exists) return null;
  return userDoc.data();
}

async function fetchLesson(lessonId: string) {
  if (!lessonId) return null;
  try {
    const lessonRef = adminDb.collection("lessons").doc(lessonId);
    const lessonDoc = await lessonRef.get();
    if (!lessonDoc.exists) return null;
    return lessonDoc.data();
  } catch (error) {
    // Suppress error log to avoid user confusion when using defaults
    return null;
  }
}

export async function getNextInteraction(userId: string) {
  let userData = null;
  try {
    userData = await getUserState(userId);
  } catch (error) {
    // Suppress error log to avoid user confusion when using defaults
    return fetchLesson("v2_intro").catch(() => null);
  }

  // First time user
  if (!userData) {
    return fetchLesson("v2_intro").catch(() => null);
  }

  const progress = userData.progress || {};
  const learning = userData.learning || {};

  // ----------------------------
  // REMEDIATION SYSTEM
  // ----------------------------
  if (progress.v2Accuracy !== undefined && progress.v2Accuracy < 0.5) {
    return fetchLesson("v2_remediation");
  }

  if (progress.deHetAccuracy !== undefined && progress.deHetAccuracy < 0.6) {
    return fetchLesson("de_het_remediation");
  }

  // ----------------------------
  // CONTINUE COURSE PATH
  // ----------------------------
  if (learning.lastLessonId) {
    const lastLesson = await fetchLesson(learning.lastLessonId);
    if (lastLesson && lastLesson.nextLesson) {
      return fetchLesson(lastLesson.nextLesson);
    }
  }

  // ----------------------------
  // DEFAULT FALLBACK
  // ----------------------------
  return fetchLesson("v2_intro");
}
