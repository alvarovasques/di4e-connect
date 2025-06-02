
// src/app/actions/chatActions.ts
'use server';

import type { Chat, Message, User, ChatStatus, MessageType } from '@/types';
import { 
  getChatsFromStore, 
  getChatByIdFromStore, 
  addMessageToStore,
  createChatInStore,
  updateChatInStore,
  getUserByIdFromStore,
  getQueuesFromStore,
  // MOCK_CURRENT_USER // Não use MOCK_CURRENT_USER diretamente em Server Actions se depender do localStorage
} from '@/lib/server-memory-store'; // Ajuste para importar do store
import { firestore } from '@/lib/firebase-admin'; // Importar para forçar a inicialização do firebase-admin.ts

// Log para verificar se o firestore foi inicializado (pode ser null se falhar)
console.log('chatActions.ts: Firestore instance status on load:', firestore ? 'Available' : 'Not Available');


export async function getChatsForUserServerAction(userId: string): Promise<Chat[]> {
  console.log(`[ServerAction] getChatsForUserServerAction called for userId: ${userId}`);
  const allChats = getChatsFromStore(); // Isso já retorna chats sem mensagens detalhadas
  const currentUser = getUserByIdFromStore(userId); // Precisamos buscar o usuário atual pelo ID

  if (!currentUser) {
    console.error(`[ServerAction] User not found for ID: ${userId}`);
    return [];
  }

  // Filtrar chats:
  // 1. Chats diretamente atribuídos ao usuário.
  // 2. Chats em 'WAITING' nas filas que o usuário atende.
  // 3. Se for SUPERVISOR ou ADMIN, todos os chats ativos.
  let relevantChats: Chat[];

  if (currentUser.userType === 'SUPERVISOR' || currentUser.userType === 'ADMIN') {
    relevantChats = allChats.filter(chat => 
        chat.status === 'IN_PROGRESS' || chat.status === 'WAITING' || chat.status === 'TRANSFERRED'
    );
  } else {
    relevantChats = allChats.filter(chat => {
      const isAssignedToUser = chat.assignedTo === userId;
      const isInUsersQueueAndWaiting = 
        !chat.assignedTo && 
        chat.status === 'WAITING' && 
        currentUser.assignedQueueIds?.includes(chat.queueId);
      return isAssignedToUser || isInUsersQueueAndWaiting;
    });
  }
  
  // Simular um pequeno delay de rede
  await new Promise(resolve => setTimeout(resolve, 200)); 
  console.log(`[ServerAction] Returning ${relevantChats.length} chats for user ${userId}`);
  return relevantChats;
}

export async function getChatDetailsServerAction(chatId: string): Promise<Chat | null> {
  console.log(`[ServerAction] getChatDetailsServerAction called for chatId: ${chatId}`);
  const chat = getChatByIdFromStore(chatId); // Isso já retorna o chat com suas mensagens
  // Simular um pequeno delay de rede
  await new Promise(resolve => setTimeout(resolve, 150));
  if (chat) {
    console.log(`[ServerAction] Returning chat ${chatId} with ${chat.messages.length} messages.`);
  } else {
    console.log(`[ServerAction] Chat ${chatId} not found.`);
  }
  return chat;
}

export async function sendChatMessageServerAction(
  chatId: string, 
  content: string, 
  senderId: string, // ID do agente/supervisor que está enviando
  type: MessageType = 'text' // Default to text, allow whisper
): Promise<Message | null> {
  console.log(`[ServerAction] sendChatMessageServerAction: chatId=${chatId}, senderId=${senderId}, type=${type}`);
  const sender = getUserByIdFromStore(senderId);
  if (!sender) {
    console.error(`[ServerAction] Sender with ID ${senderId} not found.`);
    return null;
  }

  const message: Message = {
    id: `msg_${chatId}_${Date.now()}_${Math.random().toString(36).substring(2,5)}`,
    chatId,
    content,
    type,
    sender: sender.userType === 'SUPERVISOR' && type === 'whisper' ? 'supervisor' : 'agent', // Ajustar sender para whisper
    senderId: sender.id,
    senderName: sender.name,
    timestamp: new Date(),
    isFromCustomer: false,
  };

  if (type === 'whisper') {
    const chat = getChatByIdFromStore(chatId);
    message.targetAgentId = chat?.assignedTo || undefined;
  }
  
  const addedMessage = addMessageToStore(chatId, message);
  // Simular um pequeno delay de rede
  await new Promise(resolve => setTimeout(resolve, 100));
  
  if (addedMessage) {
     console.log(`[ServerAction] Message sent by ${sender.name} in chat ${chatId}.`);
  } else {
     console.error(`[ServerAction] Failed to add message to chat ${chatId}.`);
  }
  return addedMessage;
}

export async function processIncomingWebhookMessageServerAction(
  payload: { 
    customerName: string, 
    customerPhone: string, 
    messageContent: string,
    queueId?: string, // Opcional, pode ser definido por regras de roteamento da Evolution
    whatsappMessageId?: string,
    chatId?: string, // Se a Evolution API já souber o ID do chat no nosso sistema
  }
): Promise<Chat | null> {
  console.log('[ServerAction] processIncomingWebhookMessageServerAction called with payload:', payload);
  let chat = payload.chatId ? getChatByIdFromStore(payload.chatId) : null;
  
  const customerMessage: Message = {
    id: `msg_cust_${Date.now()}_${Math.random().toString(36).substring(2,5)}`,
    chatId: '', // Será definido abaixo
    content: payload.messageContent,
    type: 'text',
    sender: 'customer',
    senderName: payload.customerName,
    timestamp: new Date(),
    isFromCustomer: true,
    whatsappMessageId: payload.whatsappMessageId,
  };

  if (chat) {
    customerMessage.chatId = chat.id;
    addMessageToStore(chat.id, customerMessage);
    // Atualizar o chat com a nova atividade
    updateChatInStore(chat.id, { lastMessagePreview: customerMessage.content, lastActivity: customerMessage.timestamp, unreadCount: (chat.unreadCount || 0) + 1 });
    chat = getChatByIdFromStore(chat.id); // Recarregar para pegar a mensagem e o unreadCount atualizado
  } else {
    // Tentar encontrar chat existente pelo telefone do cliente (simplificado)
    const allChats = getChatsFromStore();
    chat = allChats.find(c => c.customerPhone === payload.customerPhone && (c.status === 'IN_PROGRESS' || c.status === 'WAITING')) || null;

    if (chat) {
      customerMessage.chatId = chat.id;
      addMessageToStore(chat.id, customerMessage);
      updateChatInStore(chat.id, { lastMessagePreview: customerMessage.content, lastActivity: customerMessage.timestamp, unreadCount: (chat.unreadCount || 0) + 1 });
      chat = getChatByIdFromStore(chat.id);
    } else {
      // Criar novo chat
      const defaultQueues = getQueuesFromStore();
      const targetQueueId = payload.queueId || defaultQueues.find(q => q.name.toLowerCase().includes('pré-atendimento'))?.id || defaultQueues[0]?.id || 'queue_undefined';
      
      const newChatData = {
        whatsappId: `whatsapp:${payload.customerPhone.replace(/\D/g, '')}`, // Simplificado
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        queueId: targetQueueId,
        assignedTo: null, // Será atribuído pela lógica da fila ou IA
        status: 'WAITING' as ChatStatus,
        priority: 'MEDIUM' as ChatPriority,
        avatarUrl: `https://placehold.co/100x100/cccccc/333333?text=${payload.customerName.substring(0,2).toUpperCase()}`,
        initialMessage: customerMessage, // Passar a mensagem inicial
      };
      customerMessage.chatId = 'pending'; // Será atualizado quando o chat for criado
      const createdChat = createChatInStore(newChatData);
      if (createdChat) {
        customerMessage.chatId = createdChat.id; // Atualiza o ID do chat na mensagem
        // A mensagem já foi adicionada ao criar o chat via initialMessage
        console.log(`[ServerAction] New chat ${createdChat.id} created for ${payload.customerName}`);
        chat = createdChat;
      } else {
        console.error("[ServerAction] Failed to create new chat.");
        return null;
      }
    }
  }
  // Simular um pequeno delay de rede
  await new Promise(resolve => setTimeout(resolve, 250));
  return chat;
}

export async function assignChatToServerAction(chatId: string, agentId: string | null): Promise<Chat | null> {
  console.log(`[ServerAction] assignChatToServerAction: chatId=${chatId}, agentId=${agentId}`);
  const updates: Partial<Chat> = { assignedTo: agentId };
  if (agentId) { // Se está atribuindo a um agente, pode-se assumir que está em progresso ou pronto para
    // updates.status = 'IN_PROGRESS'; // A lógica de status pode ser mais complexa
  }
  const updatedChat = updateChatInStore(chatId, updates);
  await new Promise(resolve => setTimeout(resolve, 50));
  return updatedChat;
}

export async function updateChatStatusServerAction(chatId: string, status: ChatStatus): Promise<Chat | null> {
  console.log(`[ServerAction] updateChatStatusServerAction: chatId=${chatId}, status=${status}`);
  const updatedChat = updateChatInStore(chatId, { status });
  await new Promise(resolve => setTimeout(resolve, 50));
  return updatedChat;
}

// Ação para marcar o chat como lido (zerar unreadCount)
export async function markChatAsReadServerAction(chatId: string, userId: string): Promise<Chat | null> {
  console.log(`[ServerAction] markChatAsReadServerAction: chatId=${chatId}, userId=${userId}`);
  const chat = getChatByIdFromStore(chatId);
  if (chat && chat.assignedTo === userId) { // Só zera se for o agente/supervisor atribuído (ou se for uma regra geral)
    return updateChatInStore(chatId, { unreadCount: 0 });
  }
  return chat; // Retorna o chat sem alteração se as condições não forem atendidas
}
