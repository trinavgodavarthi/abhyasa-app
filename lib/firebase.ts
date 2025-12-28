
import { initializeApp } from "firebase/app";

// NOTE: Replace these values with your actual Firebase project configuration 
// from the Firebase Console (Settings > General > Your apps).
const firebaseConfig = {
  apiKey: "AIzaSy_MOCK_KEY",
  authDomain: "abhyasa-productivity.firebaseapp.com",
  projectId: "abhyasa-productivity",
  storageBucket: "abhyasa-productivity.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
// Firestore is being replaced by local storage mock to resolve environment import errors.
export const db = {};
