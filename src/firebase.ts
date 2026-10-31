import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB9GwIHCM30zMkZ35XzWHJB4z-roPYHxPU",
  authDomain: "crud-53b9a.firebaseapp.com",
  projectId: "crud-53b9a",
  storageBucket: "crud-53b9a.firebasestorage.app",
  messagingSenderId: "928702645891",
  appId: "1:928702645891:web:feb59e28703ec8cf7abdb6"
};

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp(firebaseConfig);

export const db = getFirestore(app);