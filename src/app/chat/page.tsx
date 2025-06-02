
'use client';

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatList from '@/components/chat/chat-list';
import ActiveChatArea from '@/components/chat/active-chat-area';
// import { MOCK_CHATS, MOCK_CURRENT_USER } from '@/lib/mock-data'; // Substituído por Server Actions
import { MOCK_CURRENT_USER } from '@/lib/server-memory-store'; // Usar MOCK_CURRENT_USER do store para consistência
import type { Chat, User } from '@/types';
import { Loader2 } from 'lucide-react';
import { getChatsForUserServerAction, markChatAsReadServerAction } from '@/app/actions/chatActions'; // Importar Server Action

const SLA_THRESHOLD_MINUTES = 10; 

function ChatPageContent() {
  const searchParams = useSearchParams();
  const queryChatId = searchParams.get('chatId');
  const currentUser = MOCK_CURRENT_USER; 

  const [allChats, setAllChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);

  useEffect(() => {
    const fetchChats = async () => {
      setIsLoadingChats(true);
      try {
        const chatsFromAction = await getChatsForUserServerAction(currentUser.id);
        const chatsWithSla = chatsFromAction.map(chat => {
          let slaBreached = false;
          if (chat.status === 'WAITING' && !chat.assignedTo) {
            const waitingTimeMs = Date.now() - new Date(chat.createdAt).getTime();
            const waitingTimeMinutes = waitingTimeMs / (1000 * 60);
            if (waitingTimeMinutes > SLA_THRESHOLD_MINUTES) {
              slaBreached = true;
            }
          }
          return { ...chat, slaBreached };
        });
        setAllChats(chatsWithSla);

        if (queryChatId && chatsWithSla.some(c => c.id === queryChatId)) {
          setActiveChatId(queryChatId);
           await markChatAsReadServerAction(queryChatId, currentUser.id); // Marcar como lido
        } else {
          const firstAssigned = chatsWithSla.find(c => c.assignedTo === currentUser.id && (c.status === 'IN_PROGRESS' || c.status === 'WAITING'));
          if (firstAssigned) {
            setActiveChatId(firstAssigned.id);
             await markChatAsReadServerAction(firstAssigned.id, currentUser.id);
          } else {
            const firstWaitingInQueue = chatsWithSla.find(c => 
                !c.assignedTo && 
                currentUser.assignedQueueIds?.includes(c.queueId) && 
                c.status === 'WAITING'
            );
            if (firstWaitingInQueue) {
                setActiveChatId(firstWaitingInQueue.id);
                // Não marcar como lido automaticamente ao selecionar da fila, apenas quando abrir o chat
            } else if (chatsWithSla.length > 0) {
                // setActiveChatId(chatsWithSla[0].id); // Evitar selecionar um chat automaticamente se não for relevante
            }
          }
        }

      } catch (error) {
        console.error("Error fetching chats:", error);
      }
      setIsLoadingChats(false);
    };
    fetchChats();
  }, [currentUser.id, queryChatId]); // Adicionar queryChatId como dependência

  const activeChat = useMemo(() => allChats.find(chat => chat.id === activeChatId) || null, [allChats, activeChatId]);

  // Efeito para recalcular SLA periodicamente
  useEffect(() => {
    const intervalId = setInterval(() => {
      setAllChats(prevChats =>
        prevChats.map(chat => {
          let slaBreached = chat.slaBreached;
          if (chat.status === 'WAITING' && !chat.assignedTo) {
            const waitingTimeMs = Date.now() - new Date(chat.createdAt).getTime();
            const waitingTimeMinutes = waitingTimeMs / (1000 * 60);
            slaBreached = waitingTimeMinutes > SLA_THRESHOLD_MINUTES;
          }
          return { ...chat, slaBreached };
        })
      );
    }, 60000); 
    return () => clearInterval(intervalId);
  }, []);


  useEffect(() => {
    // Se queryChatId mudar e for um chat válido, atualiza o activeChatId
    if (queryChatId && allChats.some(c => c.id === queryChatId)) {
      if (activeChatId !== queryChatId) { // Evita loop se já estiver ativo
        setActiveChatId(queryChatId);
        markChatAsReadServerAction(queryChatId, currentUser.id).then(updatedChat => {
            if (updatedChat) {
                setAllChats(prevChats => prevChats.map(c => c.id === queryChatId ? {...c, unreadCount: 0} : c));
            }
        });
      }
    }
  }, [queryChatId, allChats, currentUser.id, activeChatId]);


  const handleSelectChat = async (chatId: string) => {
    setActiveChatId(chatId);
    // Otimisticamente marcar como lido na UI
    setAllChats(prevChats => prevChats.map(c => c.id === chatId ? {...c, unreadCount: 0} : c));
    // Chamar a Server Action para marcar como lido no backend
    const updatedChat = await markChatAsReadServerAction(chatId, currentUser.id);
    if (updatedChat) {
        // Se a server action retornar o chat atualizado, podemos usá-lo,
        // mas a atualização otimista geralmente é suficiente para a UI.
        // setAllChats(prevChats => prevChats.map(c => c.id === chatId ? updatedChat : c));
    }
  };
  
  if (isLoadingChats) {
     return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] w-full overflow-hidden">
      <div className="w-full max-w-xs shrink-0 md:w-80 lg:w-96">
        <ChatList
          chats={allChats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
          currentUser={currentUser}
        />
      </div>
      <div className="flex-1">
        <ActiveChatArea chat={activeChat} />
      </div>
    </div>
  );
}

export default function ChatPage() {
  // A lógica de permissão para acessar a página de chat pode ser adicionada aqui
  // ou através de middleware/layout no futuro.
  // Por agora, assumimos que MOCK_CURRENT_USER reflete o usuário logado.
  
  return (
    <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <ChatPageContent />
    </Suspense>
  );
}
