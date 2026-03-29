import { adminDb } from "./firebase-admin";
import crypto from "crypto";
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

function hashString(str: string) {
  return crypto.createHash("sha256").update(str).digest("hex");
}

export async function getCachedResponse(cacheKeyString: string) {
  try {
    const id = hashString(cacheKeyString);
    const docRef = adminDb.collection("ai_cache").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) return null;
    const data = docSnap.data();

    if (!data) return null;

    // TTL check
    if (Date.now() - data.created > CACHE_TTL) {
      await docRef.delete();
      return null;
    }
    return data.response;
  } catch (error) {
    // Suppress error log to avoid user confusion when using defaults
    return null;
  }
}

export async function storeResponse(cacheKeyString: string, response: string) {
  try {
    const id = hashString(cacheKeyString);
    const docRef = adminDb.collection("ai_cache").doc(id);
    await docRef.set({
      cacheKey: cacheKeyString, // stored for debugging purposes
      response,
      created: Date.now()
    });
  } catch (error) {
    // Suppress error log to avoid user confusion when using defaults
  }
}
