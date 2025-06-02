
// src/lib/firebase-client.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth'; // Para Firebase Authentication no futuro

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Opcional
};

let app: FirebaseApp;
let firestore: Firestore;
// let auth: Auth;

if (typeof window !== 'undefined' && !getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    firestore = getFirestore(app);
    // auth = getAuth(app);
    console.log("Firebase client SDK initialized successfully!");
  } catch (error) {
    console.error("Error initializing Firebase client SDK:", error);
    // Fallback para evitar que o app quebre completamente se a inicialização falhar
    // @ts-ignore
    app = null;
    // @ts-ignore
    firestore = null;
    // @ts-ignore
    // auth = null;
  }
} else if (typeof window !== 'undefined' && getApps().length > 0) {
  app = getApp();
  firestore = getFirestore(app);
  // auth = getAuth(app);
}

// @ts-ignore
export { app as firebaseApp, firestore as clientFirestore /*, auth as clientAuth */ };
