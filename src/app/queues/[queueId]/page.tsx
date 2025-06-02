
'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from "@/components/ui/card"; // CardContent, CardDescription, CardHeader, CardTitle
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Eye, MessageSquareQuote, CornerRightUp, ArrowLeft, Users, Bot } from 'lucide-react';
import { MOCK_QUEUES, MOCK_CHATS, MOCK_CURRENT_USER, MOCK_ROLES, MOCK_USERS } from '@/lib/mock-data';
import type { Queue, Chat, PermissionId, User as UserType, ChatStatusColumn, KanbanColumnConfig } from '@/types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


const DEFAULT_KANBAN_COLUMNS: KanbanColumnConfig[] = [
  { id: 'default_waiting', title: 'Aguardando', mappedStatuses: ['WAITING'] },
  { id: 'default_progress', title: 'Em Progresso', mappedStatuses: ['IN_PROGRESS'] },
  { id: 'default_transferred', title: 'Transferido', mappedStatuses: ['TRANSFERRED'] },
];


const ChatCard = ({ chat }: { chat: Chat }) => {
  const router = useRouter();
  const { toast } = useToast();
  const assignedAgent = MOCK_USERS.find(u => u.id === chat.assignedTo);

  const handleViewChat = (chatId: string) => {
    router.push(`/chat?chatId=${chatId}`);
    toast({
      title: "Visualizando Chat (Supervisor)",
      description: `Você está visualizando o chat ID: ${chatId}. Você pode sussurrar ou assumir o controle na tela de chat.`,
    });
  };

  const handleAssumeChat = (chatId: string) => {
    toast({
      title: "Chat Assumido (Simulação)",
      description: `Supervisor assumiu o chat ID: ${chatId}.`,
    });
    // Em uma app real: MOCK_CHATS.find(c => c.id === chatId).assignedTo = MOCK_CURRENT_USER.id;
  };
  
  const handleWhisper = (chatId: string) => {
     router.push(`/chat?chatId=${chatId}&action=whisper`);
     toast({
      title: "Sussurrar no Chat (Supervisor)",
      description: `Redirecionando para o chat ID: ${chatId} para enviar um sussurro.`,
    });
  }

  return (
    <Card className="p-3 bg-card hover:shadow-lg transition-shadow mb-3">
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-semibold text-sm text-foreground">{chat.customerName}</h4>
        <Badge 
          variant={chat.status === 'IN_PROGRESS' ? 'default' : chat.status === 'WAITING' ? 'secondary' : 'outline'}
          className={cn(
            chat.priority === 'HIGH' && 'bg-accent text-accent-foreground',
            chat.priority === 'URGENT' && 'bg-destructive text-destructive-foreground'
          )}
        >
          {chat.status} {chat.priority !== 'MEDIUM' && `(${chat.priority})`}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground truncate mb-2">
        {assignedAgent ? `Com: ${assignedAgent.name}` : 'Não atribuído'}
      </p>
      <p className="text-xs text-muted-foreground truncate mb-2">{chat.lastMessagePreview}</p>
      <div className="flex gap-1 justify-end">
        <Button variant="outline" size="xs" onClick={() => handleViewChat(chat.id)} title="Visualizar Chat">
          <Eye className="h-3 w-3" />
        </Button>
         <Button variant="outline" size="xs" onClick={() => handleWhisper(chat.id)} title="Sussurrar para Agente">
          <MessageSquareQuote className="h-3 w-3" />
        </Button>
        <Button variant="outline" size="xs" onClick={() => handleAssumeChat(chat.id)} title="Assumir Chat">
          <CornerRightUp className="h-3 w-3" />
        </Button>
      </div>
    </Card>
  );
};


export default function QueueKanbanPage({ params }: { params: { queueId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { queueId } = params;

  const [allQueues, setAllQueues] = useState<Queue[]>(MOCK_QUEUES); // Em app real, seria buscado ou viria de contexto global

  const currentUserRole = MOCK_ROLES.find(role => role.id === MOCK_CURRENT_USER.roleId);
  const currentUserPermissions = useMemo(() => new Set(currentUserRole?.permissions || []), [currentUserRole]);

  const hasAccess = useMemo(() => {
    return currentUserPermissions.has('access_queues_module');
  }, [currentUserPermissions]);

  const currentQueue = useMemo(() => allQueues.find(q => q.id === queueId), [queueId, allQueues]);

  const kanbanColumnsToRender = useMemo(() => {
    if (currentQueue?.kanbanColumns && currentQueue.kanbanColumns.length > 0) {
      return currentQueue.kanbanColumns;
    }
    return DEFAULT_KANBAN_COLUMNS;
  }, [currentQueue]);


  const chatsForCurrentQueue = useMemo(() => {
    // Inclui todos os status que podem estar em colunas visíveis do Kanban
    const relevantStatuses: ChatStatusColumn[] = ['WAITING', 'IN_PROGRESS', 'TRANSFERRED'];
    return MOCK_CHATS.filter(chat => chat.queueId === queueId && relevantStatuses.includes(chat.status as ChatStatusColumn));
  }, [queueId]);

  const humanAgentsInQueue = useMemo(() => MOCK_USERS.filter(user => user.userType === 'AGENT_HUMAN' && user.assignedQueueIds?.includes(queueId)), [queueId]);
  const aiAgentsInQueue = useMemo(() => MOCK_USERS.filter(user => user.userType === 'AGENT_AI' && user.assignedQueueIds?.includes(queueId)), [queueId]);


  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Lock className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Acesso Negado</h1>
        <p className="text-muted-foreground">Você não tem permissão para visualizar esta página.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard">Voltar ao Painel</Link>
        </Button>
      </div>
    );
  }

  if (!currentQueue) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <h1 className="text-2xl font-bold text-foreground mb-2">Fila não encontrada</h1>
        <p className="text-muted-foreground">A fila solicitada não foi encontrada.</p>
        <Button asChild className="mt-4" variant="outline">
          <Link href="/queues"><ArrowLeft className="mr-2 h-4 w-4"/> Voltar para Lista de Filas</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex-shrink-0">
        <Button asChild variant="outline" size="sm" className="mb-4">
            <Link href="/queues"><ArrowLeft className="mr-2 h-4 w-4"/> Voltar para Lista de Filas</Link>
        </Button>
        <h1 className="text-3xl font-bold font-headline text-foreground">Kanban da Fila: {currentQueue.name}</h1>
        <p className="text-muted-foreground">{currentQueue.description}</p>
        <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
                <Users className="h-4 w-4 mr-1 text-primary" />
                Agentes Humanos: <span className="font-semibold text-foreground ml-1">{humanAgentsInQueue.length}</span>
            </div>
            <div className="flex items-center">
                <Bot className="h-4 w-4 mr-1 text-primary" />
                Agentes IA: <span className="font-semibold text-foreground ml-1">{aiAgentsInQueue.length}</span>
            </div>
        </div>
      </div>
      
      {chatsForCurrentQueue.length === 0 && !kanbanColumnsToRender.some(col => chatsForCurrentQueue.filter(c => col.mappedStatuses.includes(c.status as ChatStatusColumn)).length > 0) ? (
         <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg flex-grow">
            <p className="text-muted-foreground">Nenhum chat ativo nesta fila para exibir no Kanban.</p>
          </div>
      ) : (
        <ScrollArea className="flex-grow whitespace-nowrap rounded-md border p-4 bg-muted/20">
          <div className="flex gap-4 pb-4 h-full">
            {kanbanColumnsToRender.map(column => {
              const chatsInColumn = chatsForCurrentQueue.filter(chat => column.mappedStatuses.includes(chat.status as ChatStatusColumn));
              return (
                <div key={column.id} className="w-80 min-w-[300px] max-w-sm flex-shrink-0 bg-background rounded-lg shadow-md p-3 flex flex-col">
                  <h3 className="font-semibold text-foreground mb-3 px-1 text-lg sticky top-0 bg-background py-2 z-10">{column.title} ({chatsInColumn.length})</h3>
                  <ScrollArea className="flex-grow h-[calc(100vh-22rem)] pr-2"> {/* Ajustar altura conforme necessidade */}
                    {chatsInColumn.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Nenhum chat aqui.</p>
                    ) : (
                      chatsInColumn.map(chat => (
                        <ChatCard key={chat.id} chat={chat} />
                      ))
                    )}
                  </ScrollArea>
                </div>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </div>
  );
}

    