import { auth } from './firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
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

const INVITE_CODE = 'JAC2026'; 

export async function adminSignUp(email, password, inviteCode) {
  if (inviteCode !== INVITE_CODE) {
    return { success: false, message: 'Invalid invite code.' };
  }
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, message: error.message };
  }
}