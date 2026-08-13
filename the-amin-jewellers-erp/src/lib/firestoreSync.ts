import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  onSnapshot,
  FirestoreError,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db, auth } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  console.warn(`Firestore Notice (${operationType}) on [${path}]:`, errMessage);
}

export async function saveDocumentToFirestore(collectionPath: string, id: string, data: any) {
  try {
    await setDoc(doc(db, collectionPath, id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionPath}/${id}`);
  }
}

export async function updateDocumentInFirestore(collectionPath: string, id: string, data: any) {
  try {
    await updateDoc(doc(db, collectionPath, id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${collectionPath}/${id}`);
  }
}

export async function deleteDocumentFromFirestore(collectionPath: string, id: string) {
  try {
    await deleteDoc(doc(db, collectionPath, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${collectionPath}/${id}`);
  }
}

export function subscribeCollection<T = DocumentData>(
  collectionPath: string, 
  callback: (data: T[]) => void,
  constraints: QueryConstraint[] = [],
  onError?: (error: any) => void
) {
  const q = query(collection(db, collectionPath), ...constraints);
  
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as T));
    callback(data);
  }, (error) => {
    console.warn(`Firestore subscription notice on [${collectionPath}]:`, error?.message || error);
    if (onError) {
      onError(error);
    }
  });
}

export async function getDocument<T = DocumentData>(collectionPath: string, id: string): Promise<T | null> {
  try {
    const docSnap = await getDoc(doc(db, collectionPath, id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as unknown as T;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${collectionPath}/${id}`);
    return null;
  }
}

// Gold Rate specific functions
export function subscribeGoldRates(callback: (rates: any[]) => void) {
  return subscribeCollection('goldRates', callback);
}

export function subscribeOldGoldPurchases(callback: (purchases: any[]) => void, onError?: (error: any) => void) {
  return subscribeCollection('oldGoldPurchases', callback, [], onError);
}

export async function saveOldGoldPurchaseToFirestore(purchase: any) {
  return saveDocumentToFirestore('oldGoldPurchases', purchase.id, purchase);
}

export async function deleteOldGoldPurchaseFromFirestore(id: string) {
  return deleteDocumentFromFirestore('oldGoldPurchases', id);
}

export async function saveGoldRatesToFirestore(rates: any[]) {
  try {
    const batch = rates.map(rate => setDoc(doc(db, 'goldRates', rate.karat), rate));
    await Promise.all(batch);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'goldRates');
  }
}

export async function seedInitialData(mortgages: any[], stockItems: any[], artisans: any[]) {
  try {
    const mortgageBatch = mortgages.map(m => setDoc(doc(db, 'mortgages', m.id), m));
    const stockBatch = stockItems.map(s => setDoc(doc(db, 'stock', s.id), s));
    const artisanBatch = artisans.map(a => setDoc(doc(db, 'artisans', a.id), a));
    
    await Promise.all([...mortgageBatch, ...stockBatch, ...artisanBatch]);
    localStorage.setItem('firebase_seeded', 'true');
  } catch (error) {
    console.error('Seeding error:', error);
  }
}
