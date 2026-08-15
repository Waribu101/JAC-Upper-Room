import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  initializeAuth,
  getReactNativePersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { getStorage } from 'firebase/storage';

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

// getReactNativePersistence only exists in the native Firebase Auth bundle.
// On web (this Vercel build) it's undefined, which crashed the whole app
// on load — blank page. Fix: branch by platform.
// - Web uses browserLocalPersistence (built into firebase/auth for web,
//   survives refresh via localStorage).
// - Native uses AsyncStorage persistence, but that import is done lazily
//   via require() so the module is never evaluated on web at all.
export const auth = Platform.OS === 'web'
  ? initializeAuth(app, {
      persistence: browserLocalPersistence,
    })
  : initializeAuth(app, {
      persistence: getReactNativePersistence(
        require('@react-native-async-storage/async-storage').default
      ),
    });

export const storage = getStorage(app);