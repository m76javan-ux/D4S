import { doc, getDoc, setDoc, serverTimestamp, type Firestore } from 'firebase/firestore';

export async function getCachedResponse(db: Firestore, cacheKey: string) {
  const cacheRef = doc(db, 'ai_cache', cacheKey);
  const docSnap = await getDoc(cacheRef);
  if (docSnap.exists()) {
    return docSnap.data().response;
  }
  return null;
}

export async function storeResponse(db: Firestore, cacheKey: string, response: string) {
  const cacheRef = doc(db, 'ai_cache', cacheKey);
  await setDoc(cacheRef, {
    cacheKey,
    response,
    created: serverTimestamp()
  });
}
