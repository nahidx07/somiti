
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase configuration. 
 * Use environment variables for security.
 * Ensure your Firestore rules are set to: allow read, write: if true; (for initial development)
 */
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_ID",
  appId: process.env.FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Safety check: Don't attempt connection with obvious placeholders
const isConfigured = firebaseConfig.projectId !== "YOUR_PROJECT_ID" && firebaseConfig.apiKey !== "YOUR_API_KEY";

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const firestore = getFirestore(app);
export const firebaseReady = isConfigured;
