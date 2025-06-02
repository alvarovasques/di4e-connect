
// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

let firebaseAdminApp: admin.app.App | null = null;
let firestoreInstance: admin.firestore.Firestore | null = null;
// let authInstance: admin.auth.Auth | null = null; // Para Firebase Authentication no backend

// Função para inicializar o Firebase Admin SDK
// Garante que seja inicializado apenas uma vez (Singleton)
function initializeFirebaseAdmin() {
  console.log("Attempting to initialize Firebase Admin SDK..."); // Log de tentativa

  const appName = 'Di4E-Connect-Admin';

  // Check if the named app is already initialized
  const existingApp = admin.apps.find(app => app?.name === appName);
  if (existingApp) {
    firebaseAdminApp = existingApp;
    console.log(`Firebase Admin SDK '${appName}' already initialized.`);
  } else {
    console.log(`Firebase Admin SDK '${appName}' not yet initialized. Proceeding with new initialization...`);
    const serviceAccountJsonString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_STRING;
    let serviceAccount;

    if (serviceAccountJsonString && serviceAccountJsonString.trim() !== "" && serviceAccountJsonString.trim() !== "''" && serviceAccountJsonString.trim() !== '""') {
      console.log("Found FIREBASE_SERVICE_ACCOUNT_JSON_STRING. Attempting to parse...");
      try {
        serviceAccount = JSON.parse(serviceAccountJsonString);
        console.log("FIREBASE_SERVICE_ACCOUNT_JSON_STRING parsed successfully.");
      } catch (error: any) {
        console.error("CRITICAL Error parsing FIREBASE_SERVICE_ACCOUNT_JSON_STRING:", error.message);
        console.error("Problematic content of FIREBASE_SERVICE_ACCOUNT_JSON_STRING (first 100 chars, then last 50 chars):");
        console.error("Start:", serviceAccountJsonString.substring(0,100));
        console.error("End:", serviceAccountJsonString.substring(Math.max(0, serviceAccountJsonString.length - 50)));
        console.warn("Firebase Admin SDK CANNOT be initialized due to JSON parsing error. Verify .env variable. Firestore will NOT be available.");
        return; // Exit if JSON is invalid
      }
    } else if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      console.log("Using separate environment variables for Firebase Admin SDK.");
      serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Ensure newlines are correctly formatted
      };
      console.log("Service account object created from separate environment variables.");
    } else {
      console.warn(
        'Firebase Admin SDK credentials NOT FOUND in environment variables. ' +
        'Define FIREBASE_SERVICE_ACCOUNT_JSON_STRING or individual FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY. ' +
        'Firestore will NOT be available.'
      );
      return; // Exit if no credentials found
    }
    
    try {
      firebaseAdminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      }, appName); 
      console.log(`Firebase Admin SDK initialized successfully with the name '${appName}'!`);
    } catch (error: any) {
        // This catch block might be redundant if the existingApp check above works,
        // but it's a good safety net.
        if (error.code === 'app/duplicate-app' && error.message.includes(`'${appName}'`)) {
          firebaseAdminApp = admin.app(appName);
          console.log(`Firebase Admin SDK '${appName}' was already initialized (caught duplicate-app error).`);
        } else {
          console.error('CRITICAL Error initializing Firebase Admin SDK:', error);
          firebaseAdminApp = null; // Ensure app is null on other errors
        }
    }
  }

  if (firebaseAdminApp) {
    firestoreInstance = admin.firestore(firebaseAdminApp);
    console.log("Firestore instance obtained successfully.");
  } else {
    firestoreInstance = null;
    console.warn("Firestore instance COULD NOT be obtained because the Firebase Admin App was not initialized correctly.");
  }
}

// Call initialization when the module is loaded on the server-side
if (typeof window === 'undefined') {
  initializeFirebaseAdmin();
}

// Export instances (or null if initialization failed)
export { firestoreInstance as firestore, firebaseAdminApp };
