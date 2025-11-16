
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// IMPORTANT: Replace with your own Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBNcQs55G2mWCpBoYq1TP1oQ3MhtvMDol4",
  authDomain: "lost-n-found-99416.firebaseapp.com",
  projectId: "lost-n-found-99416",
  storageBucket: "lost-n-found-99416.firebasestorage.app",
  messagingSenderId: "663836663185",
  appId: "1:663836663185:web:24b21a1ada5d97e63e8e30",
  measurementId: "G-3W8F2892JB"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
export const googleProvider = new GoogleAuthProvider();

   