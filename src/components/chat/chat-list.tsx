
'use client';

import type { Chat, User } from '@/types';
import ChatListItem from './chat-list-item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, UserCheck, Clock } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Separator } from '../ui/separator';

type ChatListProps = {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  currentUser: User;
};

const ChatList = ({ chats, activeChatId, onSelectChat, currentUser }: ChatListProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { myOpenChats, waitingInMyQueuesChats, otherChats } = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = chats.filter(chat => 
      chat.customerName.toLowerCase().includes(lowerSearchTerm) ||
      (chat.lastMessagePreview && chat.lastMessagePreview.toLowerCase().includes(lowerSearchTerm))
    );

    const myChats = filtered.filter(chat => 
      chat.assignedTo === currentUser.id && 
      (chat.status === 'IN_PROGRESS' || chat.status === 'WAITING') // 'WAITING' aqui significa que foi atribuído mas não iniciado
    ).sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());

    const waitingChats = filtered.filter(chat => 
      !chat.assignedTo && // Não atribuído a ninguém OU atribuído a uma IA (precisaria de lógica extra para IA)
      currentUser.assignedQueueIds?.includes(chat.queueId) &&
      chat.status === 'WAITING'
    ).sort((a,b) => (b.slaBreached ? 1 : 0) - (a.slaBreached ? 1 : 0) || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); // Prioriza SLA breached, depois mais antigo

    // Para Admin/Supervisor, pode ser útil ver outros chats também
    const adminOrSupervisorView = currentUser.userType === 'ADMIN' || currentUser.userType === 'SUPERVISOR';
    const otherVisibleChats = adminOrSupervisorView 
      ? filtered.filter(chat => 
          !myChats.find(mc => mc.id === chat.id) && 
          !waitingChats.find(wc => wc.id === chat.id) &&
          (chat.status === 'IN_PROGRESS' || chat.status === 'WAITING' || chat.status === 'TRANSFERRED') // Mostra chats ativos não atribuídos a ele ou em suas filas de espera
        ).sort((a,b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
      : [];


    return { myOpenChats: myChats, waitingInMyQueuesChats: waitingChats, otherChats: otherVisibleChats };
  }, [chats, searchTerm, currentUser]);

  const renderChatSection = (title: string, icon: React.ElementType, chatList: Chat[], emptyMessage: string) => {
    if (chatList.length === 0 && !searchTerm) return null; // Não renderiza a seção se vazia e sem busca
    
    return (
      <div className="py-2">
        <h2 className="mb-2 flex items-center px-3 text-sm font-semibold text-muted-foreground">
          {React.createElement(icon, { className: "mr-2 h-4 w-4" })}
          {title} ({chatList.length})
        </h2>
        {chatList.length > 0 ? (
          chatList.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              isActive={chat.id === activeChatId}
              onClick={() => onSelectChat(chat.id)}
            />
          ))
        ) : (
          <p className="px-3 text-xs text-muted-foreground">{emptyMessage}</p>
        )}
      </div>
    );
  };


  return (
    <div className="flex h-full flex-col border-r bg-background">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Pesquisar chats..." 
            className="pl-8 w-full rounded-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <nav className="space-y-1 p-2">
          {renderChatSection("Meus Atendimentos", UserCheck, myOpenChats, "Nenhum chat atribuído a você no momento.")}
          
          {(myOpenChats.length > 0 && waitingInMyQueuesChats.length > 0) && <Separator className="my-2" />}
          
          {renderChatSection("Aguardando nas Minhas Filas", Clock, waitingInMyQueuesChats, "Nenhum chat aguardando em suas filas.")}

          {(currentUser.userType === 'ADMIN' || currentUser.userType === 'SUPERVISOR') && otherChats.length > 0 && (
            <>
              <Separator className="my-2" />
              {renderChatSection("Outros Chats Ativos", Search, otherChats, "")}
            </>
          )}

          {myOpenChats.length === 0 && waitingInMyQueuesChats.length === 0 && otherChats.length === 0 && searchTerm && (
             <p className="p-4 text-center text-sm text-muted-foreground">Nenhum chat encontrado para "{searchTerm}".</p>
          )}
           {myOpenChats.length === 0 && waitingInMyQueuesChats.length === 0 && otherChats.length === 0 && !searchTerm && (
             <p className="p-4 text-center text-sm text-muted-foreground">Nenhum chat para exibir.</p>
          )}
        </nav>
      </ScrollArea>
    </div>
  );
};

export default ChatList;
