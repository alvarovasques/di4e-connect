
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Eye, MessageSquareQuote, CornerRightUp } from 'lucide-react';
import { MOCK_QUEUES, MOCK_CHATS, MOCK_CURRENT_USER, MOCK_ROLES } from '@/lib/mock-data';
import type { Queue, Chat, PermissionId } from '@/types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const QueueCard = ({ queue, chatsInQueue }: { queue: Queue; chatsInQueue: Chat[] }) => {
  const router = useRouter();
  const { toast } = useToast();

  const handleViewChat = (chatId: string) => {
    // Em um cenário real, o supervisor poderia ver o chat em um modal ou ser redirecionado
    // Para agora, vamos apenas simular e permitir que ele vá para a página de chat principal
    // O supervisor não será o "assignedTo" automaticamente, mas poderá ver a conversa
    router.push(`/chat?chatId=${chatId}`); // Simples redirecionamento para ActiveChatArea
    toast({
      title: "Visualizando Chat (Supervisor)",
      description: `Você está visualizando o chat ID: ${chatId}. Você pode sussurrar ou assumir o controle na tela de chat.`,
    });
  };

  const handleAssumeChat = (chatId: string) => {
    // Lógica para o supervisor assumir o chat (atualizar MOCK_CHATS)
    // Esta é uma simulação, precisaria de gerenciamento de estado mais robusto
    toast({
      title: "Chat Assumido (Simulação)",
      description: `Supervisor assumiu o chat ID: ${chatId}.`,
    });
    // Exemplo: MOCK_CHATS.find(c => c.id === chatId).assignedTo = MOCK_CURRENT_USER.id;
  };
  
  const handleWhisper = (chatId: string) => {
     router.push(`/chat?chatId=${chatId}&action=whisper`);
     toast({
      title: "Sussurrar no Chat (Supervisor)",
      description: `Redirecionando para o chat ID: ${chatId} para enviar um sussurro.`,
    });
  }

  return (
    <Card className="w-80 min-w-80 flex-shrink-0 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-headline">{queue.name}</CardTitle>
        <CardDescription className="text-xs">{queue.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 h-96 overflow-y-auto p-4">
        {chatsInQueue.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum chat nesta fila.</p>
        ) : (
          chatsInQueue.map(chat => (
            <Card key={chat.id} className="p-3 bg-card/70 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-sm text-foreground">{chat.customerName}</h4>
                <Badge 
                  variant={chat.status === 'IN_PROGRESS' ? 'default' : chat.status === 'WAITING' ? 'secondary' : 'outline'}
                  className={cn(
                    chat.priority === 'HIGH' && 'border-destructive text-accent', // Alterado aqui
                    chat.priority === 'URGENT' && 'bg-destructive text-destructive-foreground'
                  )}
                >
                  {chat.status} {chat.priority !== 'MEDIUM' && `(${chat.priority})`}
                </Badge>
              </div>
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
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default function QueuesPage() {
  const currentUserRole = MOCK_ROLES.find(role => role.id === MOCK_CURRENT_USER.roleId);
  const currentUserPermissions = useMemo(() => new Set(currentUserRole?.permissions || []), [currentUserRole]);

  const hasAccess = useMemo(() => {
    // Supervisores e Admins devem ter 'access_queues_module'
    // e também 'supervisor_view_all_chats' ou uma permissão similar para esta página.
    // Por simplicidade, usaremos 'access_queues_module' como chave principal para acesso à página.
    return currentUserPermissions.has('access_queues_module');
  }, [currentUserPermissions]);

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

  const activeQueues = MOCK_QUEUES.filter(q => q.isActive);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex-shrink-0">
        <h1 className="text-3xl font-bold font-headline text-foreground">Gerenciamento de Filas (Kanban)</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie os chats em andamento em todas as filas ativas.
        </p>
      </div>
      
      {activeQueues.length === 0 ? (
         <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg flex-grow">
            <p className="text-muted-foreground">Nenhuma fila ativa para exibir.</p>
          </div>
      ) : (
        <ScrollArea className="flex-grow whitespace-nowrap rounded-md border p-4">
          <div className="flex gap-4 pb-4">
            {activeQueues.map(queue => {
              const chatsInQueue = MOCK_CHATS.filter(chat => chat.queueId === queue.id && (chat.status === 'IN_PROGRESS' || chat.status === 'WAITING' || chat.status === 'TRANSFERRED'));
              return <QueueCard key={queue.id} queue={queue} chatsInQueue={chatsInQueue} />;
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </div>
  );
}
