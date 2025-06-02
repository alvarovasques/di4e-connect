
// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

let firebaseAdminApp: admin.app.App | null = null;
let firestoreInstance: admin.firestore.Firestore | null = null;
// let authInstance: admin.auth.Auth | null = null; // Para Firebase Authentication no backend

// Função para inicializar o Firebase Admin SDK
// Garante que seja inicializado apenas uma vez (Singleton)
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    firebaseAdminApp = admin.app();
    console.log("Firebase Admin SDK já estava inicializado.");
  } else {
    const serviceAccountJsonString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_STRING;
    let serviceAccount;

    if (serviceAccountJsonString) {
      try {
        serviceAccount = JSON.parse(serviceAccountJsonString);
      } catch (error) {
        console.error("Erro ao parsear FIREBASE_SERVICE_ACCOUNT_JSON_STRING:", error);
        console.warn("Firebase Admin SDK não pôde ser inicializado devido a erro no JSON da conta de serviço.");
        return; // Sai da função se o JSON for inválido
      }
    } else if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };
    } else {
      console.warn(
        'Credenciais do Firebase Admin SDK não encontradas nas variáveis de ambiente. ' +
        'Defina FIREBASE_SERVICE_ACCOUNT_JSON_STRING ou as variáveis FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY.' +
        ' O Firestore não estará disponível.'
      );
      return; // Sai da função se não houver credenciais
    }
    
    try {
      firebaseAdminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("Firebase Admin SDK inicializado com sucesso!");
    } catch (error: any) {
        if (error.code === 'app/duplicate-app') {
          firebaseAdminApp = admin.app();
          console.log("Firebase Admin SDK já estava inicializado (capturado no catch).");
        } else {
          console.error('Erro ao inicializar Firebase Admin SDK:', error);
          firebaseAdminApp = null; // Garante que app seja null em caso de outro erro
        }
    }
  }

  if (firebaseAdminApp) {
    firestoreInstance = admin.firestore();
    // authInstance = admin.auth();
  } else {
    firestoreInstance = null;
    // authInstance = null;
  }
}

// Chamar a inicialização quando o módulo é carregado (lado do servidor)
if (typeof window === 'undefined') {
  initializeFirebaseAdmin();
}

// Exportar instâncias inicializadas (ou null se a inicialização falhar)
// Isso permite que o aplicativo continue funcionando (pelo menos as partes que não dependem do Firebase)
// se houver um problema de configuração, em vez de quebrar o build.
export { firestoreInstance as firestore /*, authInstance as auth */, firebaseAdminApp };

