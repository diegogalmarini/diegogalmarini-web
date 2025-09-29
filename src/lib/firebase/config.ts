import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBrJ_xfZeEVRXe0Fcw2XdDKVdCSRYHqaGA",
  authDomain: "diego-galmarini-oficial-web.firebaseapp.com",
  projectId: "diego-galmarini-oficial-web",
  storageBucket: "diego-galmarini-oficial-web.appspot.com",
  messagingSenderId: "668819276616",
  appId: "1:668819276616:web:5ca12fddfa9fd5fcc2697d",
  measurementId: "G-91HFCBNTBY"
};

// Initialize Firebase app
let app: FirebaseApp;

// Prevent re-initialization during development with HMR (Hot Module Replacement)
if (typeof window !== 'undefined') {
  // Client-side initialization
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
} else {
  // Server-side: Initialize for SSR compatibility but don't use auth/firestore
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
}

// Initialize Firebase services
// Note: These should only be used on the client-side
export const auth: Auth = typeof window !== 'undefined' ? getAuth(app) : null as any;
export const db: Firestore = typeof window !== 'undefined' ? getFirestore(app) : null as any;

// Export the app instance
export { app };