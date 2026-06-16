import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
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
export const auth = getAuth(app);
export const storage = getStorage(app);