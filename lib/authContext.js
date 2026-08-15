import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from './firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  collection, query, where, getDocs,
  doc, setDoc, serverTimestamp,
} from 'firebase/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Admin status is derived, not stored on the user — anyone whose
        // email is in `admins` gets isAdmin: true. Everyone else (including
        // newly self-signed-up members) is just a regular authenticated user.
        const q = query(
          collection(db, 'admins'),
          where('email', '==', firebaseUser.email)
        );
        const snap = await getDocs(q);
        setIsAdmin(!snap.empty);
        setUser(firebaseUser);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Member self-signup. Creates the Firebase Auth account, then a matching
  // profile doc in `members/{uid}` so signups are traceable (name, when
  // they joined) — same trust concern that drove the notes-persistence fix.
  async function signup(email, password, name) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'members', cred.user.uid), {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      joinedAt: serverTimestamp(),
    });
    return cred;
  }

  async function logout() {
    return signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}