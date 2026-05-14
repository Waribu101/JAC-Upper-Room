import { auth } from './firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

export async function adminLogin(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function adminLogout() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}