
// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

// Função para inicializar o Firebase Admin SDK
// Garante que seja inicializado apenas uma vez (Singleton)
function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app(); // Retorna o app já inicializado
  }

  // Tenta obter as credenciais das variáveis de ambiente
  // Esta é a forma mais comum de configurar em ambientes de servidor como Vercel, Google Cloud Run, etc.
  const serviceAccountJsonString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_STRING;
  let serviceAccount;

  if (serviceAccountJsonString) {
    try {
      serviceAccount = JSON.parse(serviceAccountJsonString);
    } catch (error) {
      console.error("Erro ao parsear FIREBASE_SERVICE_ACCOUNT_JSON_STRING:", error);
      throw new Error("A variável de ambiente FIREBASE_SERVICE_ACCOUNT_JSON_STRING não é um JSON válido.");
    }
  } else if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    // Se o JSON stringificado não estiver presente, tenta usar as variáveis de ambiente separadas
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // A chave privada precisa ter as quebras de linha restauradas se vier de uma variável de ambiente
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  } else {
    console.error(
      'Credenciais do Firebase Admin SDK não encontradas nas variáveis de ambiente. ' +
      'Defina FIREBASE_SERVICE_ACCOUNT_JSON_STRING ou as variáveis FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY.'
    );
    // Não lance um erro aqui para permitir que o app inicie mesmo sem Firebase configurado,
    // mas as operações do Firestore falharão.
    // Em produção, você pode querer lançar um erro se o Firebase for essencial.
    return null; 
  }
  
  try {
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // databaseURL: `https://${serviceAccount.projectId}.firebaseio.com` // Opcional, necessário para Realtime Database
    });
  } catch (error: any) {
      if (error.code === 'app/duplicate-app') {
        // App já inicializado, o que é ok.
        return admin.app();
      }
      console.error('Erro ao inicializar Firebase Admin SDK:', error);
      throw error; // Relança o erro se for algo diferente de 'duplicate-app'
  }
}

const firebaseAdminApp = initializeFirebaseAdmin();
const firestore = firebaseAdminApp ? admin.firestore() : null;
// const auth = firebaseAdminApp ? admin.auth() : null; // Para Firebase Authentication no backend

// Exportar instâncias inicializadas
// Se firestore for null, as chamadas falharão, indicando problema de configuração.
export { firestore, firebaseAdminApp /*, auth */ };
