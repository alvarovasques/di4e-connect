
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight, Users, Bot } from 'lucide-react';
import { MOCK_QUEUES, MOCK_CHATS, MOCK_CURRENT_USER, MOCK_ROLES, MOCK_USERS } from '@/lib/mock-data';
import type { PermissionId } from '@/types';

export default function QueuesListPage() {
  const currentUserRole = MOCK_ROLES.find(role => role.id === MOCK_CURRENT_USER.roleId);
  const currentUserPermissions = useMemo(() => new Set(currentUserRole?.permissions || []), [currentUserRole]);

  const hasAccess = useMemo(() => {
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

  const getQueueStats = (queueId: string) => {
    const chatsInQueue = MOCK_CHATS.filter(chat => chat.queueId === queueId && (chat.status === 'IN_PROGRESS' || chat.status === 'WAITING' || chat.status === 'TRANSFERRED'));
    const humanAgentsInQueue = MOCK_USERS.filter(user => user.userType === 'AGENT_HUMAN' && user.assignedQueueIds?.includes(queueId)).length;
    const aiAgentsInQueue = MOCK_USERS.filter(user => user.userType === 'AGENT_AI' && user.assignedQueueIds?.includes(queueId)).length;
    return {
      activeChats: chatsInQueue.length,
      humanAgents: humanAgentsInQueue,
      aiAgents: aiAgentsInQueue,
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline text-foreground">Filas de Atendimento</h1>
        <p className="text-muted-foreground">
          Selecione uma fila para visualizar e gerenciar os chats em andamento.
        </p>
      </div>
      
      {activeQueues.length === 0 ? (
         <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <p className="text-muted-foreground">Nenhuma fila ativa para exibir.</p>
          </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeQueues.map(queue => {
            const stats = getQueueStats(queue.id);
            return (
              <Card key={queue.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl font-headline">{queue.name}</CardTitle>
                  <CardDescription className="text-sm">{queue.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <p>Chats Ativos: <span className="font-semibold text-foreground">{stats.activeChats}</span></p>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-primary" />
                      Agentes Humanos: <span className="font-semibold text-foreground ml-1">{stats.humanAgents}</span>
                    </div>
                    <div className="flex items-center">
                      <Bot className="h-4 w-4 mr-2 text-primary" />
                      Agentes IA: <span className="font-semibold text-foreground ml-1">{stats.aiAgents}</span>
                    </div>
                  </div>
                  <Button asChild className="w-full bg-primary hover:bg-primary/90">
                    <Link href={`/queues/${queue.id}`}>
                      Ver Kanban da Fila <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
