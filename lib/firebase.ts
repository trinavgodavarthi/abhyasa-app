
import { initializeApp } from "firebase/app";
// Use the lite version of firestore to resolve exported member errors in restricted environments
import { getFirestore } from "firebase/firestore/lite";

// NOTE: In a real app, these would be in environment variables.
// Since we are building a standalone functional prototype, 
// replace these with your actual Firebase config if deploying.
const firebaseConfig = {
  apiKey: "AIzaSy_MOCK_KEY",
  authDomain: "abhyasa-productivity.firebaseapp.com",
  projectId: "abhyasa-productivity",
  storageBucket: "abhyasa-productivity.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
