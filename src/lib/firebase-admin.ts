
// src/lib/firebase-admin.ts
import * as admin from 'firebase-admin';

let firebaseAdminApp: admin.app.App | null = null;
let firestoreInstance: admin.firestore.Firestore | null = null;
// let authInstance: admin.auth.Auth | null = null; // Para Firebase Authentication no backend

// Função para inicializar o Firebase Admin SDK
// Garante que seja inicializado apenas uma vez (Singleton)
function initializeFirebaseAdmin() {
  console.log("Attempting to initialize Firebase Admin SDK..."); // Log de tentativa

  if (admin.apps.length > 0 && admin.app()) { // Verifica se já existe uma app e se ela é válida
    firebaseAdminApp = admin.app();
    console.log("Firebase Admin SDK já estava inicializado (admin.apps.length > 0).");
  } else {
    console.log("Firebase Admin SDK não estava inicializado (admin.apps.length === 0 ou app inválida). Procedendo com nova inicialização...");
    const serviceAccountJsonString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_STRING;
    let serviceAccount;

    if (serviceAccountJsonString && serviceAccountJsonString.trim() !== "") {
      console.log("Encontrado FIREBASE_SERVICE_ACCOUNT_JSON_STRING. Tentando parsear...");
      try {
        serviceAccount = JSON.parse(serviceAccountJsonString);
        console.log("FIREBASE_SERVICE_ACCOUNT_JSON_STRING parseado com sucesso.");
      } catch (error) {
        console.error("Erro CRÍTICO ao parsear FIREBASE_SERVICE_ACCOUNT_JSON_STRING:", error);
        console.warn("Firebase Admin SDK NÃO pôde ser inicializado devido a erro no JSON da conta de serviço. Verifique o formato no .env.");
        return; // Sai da função se o JSON for inválido
      }
    } else if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      console.log("Usando variáveis de ambiente separadas para Firebase Admin SDK.");
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
      }, 'Di4E-Connect-Admin'); // Dando um nome único para a instância do app
      console.log("Firebase Admin SDK inicializado com sucesso com o nome 'Di4E-Connect-Admin'!");
    } catch (error: any) {
        // Verificar se o app já foi inicializado com este nome específico
        if (error.code === 'app/duplicate-app' && error.message.includes("'Di4E-Connect-Admin'")) {
          firebaseAdminApp = admin.app('Di4E-Connect-Admin');
          console.log("Firebase Admin SDK 'Di4E-Connect-Admin' já estava inicializado (capturado no catch).");
        } else if (admin.apps.length > 0 && admin.app()) { // Fallback para app padrão se a nomeada falhar e uma padrão existir
            firebaseAdminApp = admin.app();
            console.log("Firebase Admin SDK já estava inicializado (app padrão recuperada no catch).");
        } else {
          console.error('Erro CRÍTICO ao inicializar Firebase Admin SDK:', error);
          firebaseAdminApp = null; // Garante que app seja null em caso de outro erro
        }
    }
  }

  if (firebaseAdminApp) {
    firestoreInstance = admin.firestore(firebaseAdminApp); // Usar a app específica
    console.log("Instância do Firestore obtida com sucesso.");
  } else {
    firestoreInstance = null;
    console.warn("Instância do Firestore NÃO pôde ser obtida pois o Firebase Admin App não foi inicializado corretamente.");
  }
}

// Chamar a inicialização quando o módulo é carregado (lado do servidor)
if (typeof window === 'undefined') {
  initializeFirebaseAdmin();
}

// Exportar instâncias inicializadas (ou null se a inicialização falhar)
export { firestoreInstance as firestore, firebaseAdminApp };
