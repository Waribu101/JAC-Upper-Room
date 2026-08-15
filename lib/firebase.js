import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyB2W-O5421TNhI23gxlPH_OKbwq6YlZ7I8",
  authDomain: "jac-upper-room.firebaseapp.com",
  projectId: "jac-upper-room",
  storageBucket: "jac-upper-room.firebasestorage.app",
  messagingSenderId: "703382860620",
  appId: "1:703382860620:web:856080bb0927029a52d5e9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// initializeAuth (not getAuth) is required here so we can pass in
// AsyncStorage persistence. Without this, React Native falls back to
// in-memory auth — the session doesn't survive an app restart, so
// signInAnonymously mints a brand-new UID every time and old data
// (like saved notes) becomes orphaned under the previous UID.
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const storage = getStorage(app);