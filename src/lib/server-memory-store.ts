
// src/lib/server-memory-store.ts
import type { Chat, Message, User, Queue, KBItem, Role, AiModel, ChatStatus } from '@/types';
import { 
  MOCK_CHATS as INITIAL_CHATS, 
  MOCK_USERS as INITIAL_USERS,
  MOCK_QUEUES as INITIAL_QUEUES,
  MOCK_KB_ITEMS as INITIAL_KB_ITEMS,
  MOCK_ROLES as INITIAL_ROLES,
  MOCK_AI_MODELS as INITIAL_AI_MODELS
} from '@/lib/mock-data-definitions'; // Renomearemos o mock-data original

// Simulação de um banco de dados em memória
let chats: Chat[] = [];
let messagesByChatId: Record<string, Message[]> = {};
let users: User[] = [];
let queues: Queue[] = [];
let kbItems: KBItem[] = [];
let roles: Role[] = [];
let aiModels: AiModel[] = [];

let storeInitialized = false;

export function initializeStore() {
  if (storeInitialized) return;

  console.log("Initializing server memory store...");

  chats = JSON.parse(JSON.stringify(INITIAL_CHATS));
  users = JSON.parse(JSON.stringify(INITIAL_USERS));
  queues = JSON.parse(JSON.stringify(INITIAL_QUEUES));
  kbItems = JSON.parse(JSON.stringify(INITIAL_KB_ITEMS));
  roles = JSON.parse(JSON.stringify(INITIAL_ROLES));
  aiModels = JSON.parse(JSON.stringify(INITIAL_AI_MODELS));

  // Popular messagesByChatId a partir dos chats inicializados
  messagesByChatId = {};
  chats.forEach(chat => {
    messagesByChatId[chat.id] = chat.messages ? JSON.parse(JSON.stringify(chat.messages)) : [];
  });

  storeInitialized = true;
  console.log("Server memory store initialized with:", {
    chatCount: chats.length,
    userCount: users.length,
    queueCount: queues.length,
  });
}

// --- Chat Functions ---
export function getChatsFromStore(): Chat[] {
  initializeStore();
  // Retornar chats sem as mensagens aninhadas para listas, apenas com preview
  return JSON.parse(JSON.stringify(chats.map(chat => ({...chat, messages: [] }))));
}

export function getChatByIdFromStore(chatId: string): Chat | null {
  initializeStore();
  const chat = chats.find(c => c.id === chatId);
  if (!chat) return null;
  const chatMessages = messagesByChatId[chatId] || [];
  return JSON.parse(JSON.stringify({ ...chat, messages: chatMessages }));
}

export function addMessageToStore(chatId: string, message: Message): Message | null {
  initializeStore();
  const chatIndex = chats.findIndex(c => c.id === chatId);
  if (chatIndex === -1) {
    console.error(`Chat with id ${chatId} not found in store to add message.`);
    return null; // Chat não encontrado
  }

  if (!messagesByChatId[chatId]) {
    messagesByChatId[chatId] = [];
  }
  messagesByChatId[chatId].push(JSON.parse(JSON.stringify(message)));
  
  // Atualizar o chat principal
  chats[chatIndex].messages.push(JSON.parse(JSON.stringify(message))); // Manter consistência se messages ainda for usado no objeto Chat
  chats[chatIndex].lastMessagePreview = message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '');
  chats[chatIndex].lastActivity = new Date(message.timestamp);
  chats[chatIndex].updatedAt = new Date(message.timestamp);
  // Lógica de unreadCount precisaria ser mais sofisticada (quem está visualizando o chat)
  // Por agora, vamos incrementar se a mensagem não for do agente/supervisor atual.
  // Esta lógica será melhorada quando tivermos autenticação real.
  if (message.sender === 'customer' || (message.sender === 'agent' && message.senderId !== chats[chatIndex].assignedTo)) {
    chats[chatIndex].unreadCount = (chats[chatIndex].unreadCount || 0) + 1;
  }


  return JSON.parse(JSON.stringify(message));
}

export function createChatInStore(newChatData: Omit<Chat, 'id' | 'createdAt' | 'updatedAt' | 'lastActivity' | 'messages' | 'unreadCount'> & { initialMessage: Message }): Chat | null {
  initializeStore();
  const newChatId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date();
  const chat: Chat = {
    ...newChatData,
    id: newChatId,
    createdAt: now,
    updatedAt: now,
    lastActivity: now,
    messages: [], // As mensagens serão gerenciadas em messagesByChatId e adicionadas aqui ao buscar
    unreadCount: 1, // Começa com a primeira mensagem não lida
    lastMessagePreview: newChatData.initialMessage.content.substring(0,50) + "...",
    status: newChatData.status || 'WAITING',
    priority: newChatData.priority || 'MEDIUM',
  };
  chats.push(JSON.parse(JSON.stringify(chat)));
  messagesByChatId[newChatId] = [JSON.parse(JSON.stringify(newChatData.initialMessage))];
  chat.messages.push(JSON.parse(JSON.stringify(newChatData.initialMessage))); // manter sincronizado

  console.log("Chat created in store: ", chat.id);
  return JSON.parse(JSON.stringify(chat));
}

export function updateChatInStore(chatId: string, updates: Partial<Chat>): Chat | null {
  initializeStore();
  const chatIndex = chats.findIndex(c => c.id === chatId);
  if (chatIndex === -1) return null;
  
  chats[chatIndex] = { ...chats[chatIndex], ...updates, updatedAt: new Date() };
  if (updates.status && updates.status !== 'IN_PROGRESS' && updates.status !== 'WAITING') {
    chats[chatIndex].unreadCount = 0; // Zerar não lidas se não estiver ativo
  }
  if (updates.assignedTo === MOCK_CURRENT_USER.id && chats[chatIndex].status === 'WAITING') {
    // Se atribuído ao usuário atual e ainda esperando, não zerar unread count aqui.
    // A UI deve zerar quando o chat é aberto.
  } else if (updates.assignedTo) {
     chats[chatIndex].unreadCount = 0;
  }


  return JSON.parse(JSON.stringify(chats[chatIndex]));
}


// --- User Functions ---
export function getUsersFromStore(): User[] {
  initializeStore();
  return JSON.parse(JSON.stringify(users));
}

export function getUserByIdFromStore(userId: string): User | null {
  initializeStore();
  const user = users.find(u => u.id === userId);
  return user ? JSON.parse(JSON.stringify(user)) : null;
}

// --- Queue Functions ---
export function getQueuesFromStore(): Queue[] {
  initializeStore();
  return JSON.parse(JSON.stringify(queues));
}

// ... (outras funções para gerenciar queues, kbItems, roles, aiModels podem ser adicionadas aqui)

// Exportar MOCK_CURRENT_USER e setSimulatedUserType para manter a funcionalidade de troca de usuário
export { MOCK_CURRENT_USER, setSimulatedUserType } from '@/lib/mock-data-definitions';
export { ALL_PERMISSIONS } from '@/types'; // Exportar para uso em RoleFormDialog se necessário
export { MOCK_USERS, MOCK_KB_ITEMS, MOCK_QUEUES, MOCK_ROLES, MOCK_AI_MODELS } from '@/lib/mock-data-definitions'; // Continuar exportando os mocks para inicialização ou referência

console.log("server-memory-store.ts loaded");
if (typeof window === 'undefined') { // Garante que initializeStore seja chamado no servidor
  initializeStore();
}
