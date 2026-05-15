import { db } from './firebase';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  getDoc,
  doc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

// ─── Announcements ────────────────────────────────────────
export async function getAnnouncements(department = 'all') {
  try {
    const ref = collection(db, 'announcements');
    const q = query(ref, orderBy('date', 'desc'));
    const snapshot = await getDocs(q);
    const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (department === 'all') return all;

    return all.filter(item =>
      item.department === department || item.department === 'all'
    );
  } catch (error) {
    console.error('getAnnouncements error:', error);
    return [];
  }
}

// ─── Services ─────────────────────────────────────────────
export async function getServices() {
  try {
    const ref = collection(db, 'services');
    const q = query(ref, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('getServices error:', error);
    return [];
  }
}

// ─── Leadership ───────────────────────────────────────────
export async function getLeadership() {
  try {
    const ref = collection(db, 'leadership');
    const q = query(ref, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('getLeadership error:', error);
    return [];
  }
}
// ─── Media ────────────────────────────────────────────────
export async function getMedia() {
    try {
      const ref = collection(db, 'media');
      const q = query(ref, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('getMedia error:', error);
      return [];
    }
  }
  // ─── Live Link ────────────────────────────────────────────
export async function getLiveLink() {
  try {
    const snap = await getDoc(doc(db, 'settings', 'liveLink'));
    if (snap.exists()) return snap.data().url || 'https://www.facebook.com';
    return 'https://www.facebook.com';
  } catch (error) {
    return 'https://www.facebook.com';
  }
}
  // ─── Departments ──────────────────────────────────────────
export async function getDepartments() {
    try {
      const ref = collection(db, 'departments');
      const q = query(ref, orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('getDepartments error:', error);
      return [];
    }
  }
  // ─── Quotes ───────────────────────────────────────────────
export async function getQuotes() {
  try {
    const ref = collection(db, 'quotes');
    const q = query(ref, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('getQuotes error:', error);
    return [];
  }
}

// ─── Admin: Add/Delete helpers ────────────────────────────


export async function addDocument(collectionName, data) {
  try {
    const ref = collection(db, collectionName);
    const docRef = await addDoc(ref, {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('addDocument error:', error);
    return null;
  }
}

export async function deleteDocument(collectionName, id) {
  try {
    await deleteDoc(doc(db, collectionName, id));
    return true;
  } catch (error) {
    console.error('deleteDocument error:', error);
    return false;
  }
}