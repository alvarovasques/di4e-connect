
'use client';

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatList from '@/components/chat/chat-list';
import ActiveChatArea from '@/components/chat/active-chat-area';
import { MOCK_CHATS, MOCK_CURRENT_USER } from '@/lib/mock-data';
import type { Chat, User } from '@/types';
import { Loader2 } from 'lucide-react';

const SLA_THRESHOLD_MINUTES = 10; // Defina o limite de SLA em minutos

function ChatPageContent() {
  const searchParams = useSearchParams();
  const queryChatId = searchParams.get('chatId');
  const currentUser = MOCK_CURRENT_USER; // Assumindo que o usuário atual é um agente humano aqui

  const [allChats, setAllChats] = useState<Chat[]>(() => 
    MOCK_CHATS.map(chat => {
      let slaBreached = false;
      if (chat.status === 'WAITING' && !chat.assignedTo) {
        const waitingTimeMs = Date.now() - new Date(chat.createdAt).getTime();
        const waitingTimeMinutes = waitingTimeMs / (1000 * 60);
        if (waitingTimeMinutes > SLA_THRESHOLD_MINUTES) {
          slaBreached = true;
        }
      }
      return { ...chat, slaBreached };
    })
  );

  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    if (queryChatId && allChats.some(c => c.id === queryChatId)) {
      return queryChatId;
    }
    // Tenta encontrar o primeiro chat atribuído ao usuário atual ou o primeiro chat aguardando nas filas dele
    const firstAssigned = allChats.find(c => c.assignedTo === currentUser.id && (c.status === 'IN_PROGRESS' || c.status === 'WAITING'));
    if (firstAssigned) return firstAssigned.id;
    
    const firstWaitingInQueue = allChats.find(c => 
        !c.assignedTo && 
        currentUser.assignedQueueIds?.includes(c.queueId) && 
        c.status === 'WAITING'
    );
    if (firstWaitingInQueue) return firstWaitingInQueue.id;
    
    return allChats[0]?.id || null; // Fallback para o primeiro chat qualquer se nada for encontrado
  });

  const activeChat = useMemo(() => allChats.find(chat => chat.id === activeChatId) || null, [allChats, activeChatId]);

  // Efeito para recalcular SLA periodicamente ou quando os chats mudam
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
    }, 60000); // Recalcula a cada minuto

    return () => clearInterval(intervalId);
  }, []);


  useEffect(() => {
    if (queryChatId && allChats.some(c => c.id === queryChatId)) {
      setActiveChatId(queryChatId);
      setAllChats(prevChats => prevChats.map(c => c.id === queryChatId ? {...c, unreadCount: 0} : c));
    }
  }, [queryChatId, allChats]);

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setAllChats(prevChats => prevChats.map(c => c.id === chatId ? {...c, unreadCount: 0} : c));
  };

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
  // Verifica se o usuário atual é um agente humano. Se não, redireciona ou mostra mensagem.
  // Para este exemplo, vamos assumir que a rota só é acessível por agentes.
  // Em um app real, você teria lógica de autenticação e autorização aqui.
  if (MOCK_CURRENT_USER.userType !== 'AGENT_HUMAN' && MOCK_CURRENT_USER.userType !== 'ADMIN' && MOCK_CURRENT_USER.userType !== 'SUPERVISOR') {
    // ADMIN e SUPERVISOR também podem acessar o chat de agente para testes/intervenção,
    // mas a filtragem da ChatList será baseada no MOCK_CURRENT_USER.
    // A lógica de "Meus Atendimentos" pode não fazer tanto sentido para Admin/Supervisor
    // a menos que eles se atribuam a chats.
  }


  return (
    <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <ChatPageContent />
    </Suspense>
  );
}
