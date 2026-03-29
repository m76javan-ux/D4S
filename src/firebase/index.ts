import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, type DocumentData, type Query, type DocumentReference } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import * as React from 'react';

import config from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, config.firestoreDatabaseId);
export const storage = getStorage(app);

export default app;

export function useAuth() {
  return auth;
}

export function useFirestore() {
  return db;
}

export function useStorage() {
  return storage;
}

export function useUser() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  return { user, loading };
}

import { handleFirestoreError, OperationType } from './errors';

export function useDoc(ref: DocumentReference | null) {
  const [data, setData] = React.useState<DocumentData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!ref) {
      setLoading(false);
      return;
    }

    return onSnapshot(ref, (snapshot) => {
      setData(snapshot.data() || null);
      setLoading(false);
    }, (err) => {
      try {
        handleFirestoreError(err, OperationType.GET, ref.path);
      } catch (e) {
        setError(e as Error);
      }
      setLoading(false);
    });
  }, [ref]);

  return { data, loading, error };
}

export function useCollection(q: Query | null) {
  const [data, setData] = React.useState<DocumentData[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!q) {
      setLoading(false);
      return;
    }

    return onSnapshot(q, (snapshot) => {
      setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      try {
        // For queries, we don't have a single path, but we can try to get it from the query if possible
        // or just use 'query' as path
        handleFirestoreError(err, OperationType.LIST, 'query');
      } catch (e) {
        setError(e as Error);
      }
      setLoading(false);
    });
  }, [q]);

  return { data, loading, error };
}

export function useMemoFirebase<T>(factory: () => T, deps: React.DependencyList): T {
  return React.useMemo(factory, deps);
}
