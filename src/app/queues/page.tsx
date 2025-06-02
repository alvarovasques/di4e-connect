
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight, Users, Bot, PlusCircle, MoreHorizontal, Edit, Trash2, Loader2 } from 'lucide-react';
import { 
  MOCK_CURRENT_USER_FOR_INITIAL_RENDER, 
  getClientSideCurrentUser, 
  MOCK_ROLES, 
  MOCK_USERS as ALL_MOCK_USERS, // Renomeado para evitar conflito com o estado local `users`
  MOCK_CHATS // MOCK_CHATS ainda pode ser usado para info.activeChats
} from '@/lib/mock-data';
import type { PermissionId, Queue, ChatStatusColumn, User as UserType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import QueueFormDialog, { type QueueFormData } from '@/components/admin/queue-form-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getQueuesFromFirestoreServerAction, saveQueueToFirestoreServerAction, deleteQueueFromFirestoreServerAction } from '@/app/actions/queueActions'; // Importar a nova action

const defaultMappedStatuses: ChatStatusColumn[][] = [
  ['WAITING'],
  ['IN_PROGRESS'],
  ['TRANSFERRED'],
];

export default function QueuesListPage() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [isLoadingQueues, setIsLoadingQueues] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQueue, setEditingQueue] = useState<Queue | null>(null);
  const { toast } = useToast();
  
  const [currentUser, setCurrentUser] = useState<UserType>(MOCK_CURRENT_USER_FOR_INITIAL_RENDER);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCurrentUser(getClientSideCurrentUser());
  }, []);

  const currentUserRole = useMemo(() => ALL_MOCK_USERS.find(u => u.id === currentUser.id)?.roleId 
    ? MOCK_ROLES.find(role => role.id === ALL_MOCK_USERS.find(u => u.id === currentUser.id)?.roleId) 
    : null, [currentUser.id]);
  
  const currentUserPermissions = useMemo(() => new Set(currentUserRole?.permissions || []), [currentUserRole]);

  const hasAccess = useMemo(() => {
    return currentUserPermissions.has('access_queues_module');
  }, [currentUserPermissions]);

  const canManageQueues = useMemo(() => {
    return currentUserPermissions.has('manage_queues');
  }, [currentUserPermissions]);

  const aiAgents = useMemo(() => ALL_MOCK_USERS.filter(user => user.userType === 'AGENT_AI'), []);

  useEffect(() => {
    const fetchQueues = async () => {
      setIsLoadingQueues(true);
      try {
        const firestoreQueues = await getQueuesFromFirestoreServerAction();
        setQueues(firestoreQueues);
      } catch (error) {
        console.error("Failed to fetch queues:", error);
        toast({
          title: "Erro ao Carregar Filas",
          description: "Não foi possível buscar as filas do banco de dados.",
          variant: "destructive",
        });
      }
      setIsLoadingQueues(false);
    };
    fetchQueues();
  }, [toast]);


  if (!isClient || isLoadingQueues) { // Mostrar loading enquanto isClient é false ou as filas estão carregando
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Carregando filas...</p>
      </div>
    );
  }

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

  const activeQueues = queues.filter(q => q.isActive); 

  const getQueueInfo = (queue: Queue) => {
    const chatsInQueue = MOCK_CHATS.filter(chat => chat.queueId === queue.id && (chat.status === 'IN_PROGRESS' || chat.status === 'WAITING' || chat.status === 'TRANSFERRED'));
    const humanAgentsInQueue = ALL_MOCK_USERS.filter(user => user.userType === 'AGENT_HUMAN' && user.assignedQueueIds?.includes(queue.id)).length;
    const defaultAiAgent = queue.defaultAiAgentId ? ALL_MOCK_USERS.find(u => u.id === queue.defaultAiAgentId) : null;
    
    return {
      activeChats: chatsInQueue.length, // Esta contagem ainda usa MOCK_CHATS. Será migrada depois.
      humanAgents: humanAgentsInQueue,
      defaultAiAgentName: defaultAiAgent?.name,
    };
  };

  const handleOpenAddDialog = () => {
    setEditingQueue(null);
    setIsFormOpen(true);
  };

  const handleOpenEditDialog = (queue: Queue) => {
    setEditingQueue(queue);
    setIsFormOpen(true);
  };

  const handleDeleteQueue = async (queueId: string) => {
    const queueToDelete = queues.find(q => q.id === queueId);
    if (confirm(`Tem certeza que deseja excluir a fila "${queueToDelete?.name}"?`)) {
      const success = await deleteQueueFromFirestoreServerAction(queueId);
      if (success) {
        setQueues(prevQueues => prevQueues.filter(q => q.id !== queueId));
        toast({
          title: "Fila Excluída",
          description: `A fila "${queueToDelete?.name}" foi excluída.`,
        });
      } else {
        toast({
          title: "Erro ao Excluir",
          description: `Não foi possível excluir a fila "${queueToDelete?.name}".`,
          variant: "destructive",
        });
      }
    }
  };
  
  const handleFormSubmit = async (data: QueueFormData) => {
    const result = await saveQueueToFirestoreServerAction(data, editingQueue?.id);
    if (result) {
      if (editingQueue) {
        setQueues(prevQueues => prevQueues.map(q => (q.id === editingQueue.id ? result : q)));
        toast({ title: "Fila Atualizada", description: `A fila "${result.name}" foi atualizada.` });
      } else {
        setQueues(prevQueues => [result, ...prevQueues]);
        toast({ title: "Fila Adicionada", description: `A fila "${result.name}" foi adicionada.` });
      }
      setIsFormOpen(false);
      setEditingQueue(null);
    } else {
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar a fila. Verifique os logs do servidor.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            <h1 className="text-3xl font-bold font-headline text-foreground">Filas de Atendimento</h1>
            <p className="text-muted-foreground">
              Selecione uma fila para visualizar e gerenciar os chats em andamento.
            </p>
          </div>
          {canManageQueues && (
            <Button onClick={handleOpenAddDialog} className="bg-primary hover:bg-primary/90">
              <PlusCircle className="mr-2 h-4 w-4" /> Nova Fila
            </Button>
          )}
        </div>
        
        {activeQueues.length === 0 ? (
           <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg">
              <p className="text-muted-foreground">Nenhuma fila ativa para exibir. Crie uma nova fila ou verifique o banco de dados.</p>
            </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeQueues.map(queue => {
              const info = getQueueInfo(queue);
              return (
                <Card key={queue.id} className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-xl font-headline">{queue.name}</CardTitle>
                      <CardDescription className="text-sm">{queue.description}</CardDescription>
                    </div>
                    {canManageQueues && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEditDialog(queue)}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteQueue(queue.id)} className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3 flex-grow">
                    <div className="text-sm text-muted-foreground">
                      <p>Chats Ativos (Mock): <span className="font-semibold text-foreground">{info.activeChats}</span></p>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-primary" />
                        Agentes Humanos: <span className="font-semibold text-foreground ml-1">{info.humanAgents}</span>
                      </div>
                      <div className="flex items-center">
                        <Bot className="h-4 w-4 mr-2 text-primary" />
                        Agente IA Padrão: <span className="font-semibold text-foreground ml-1">{info.defaultAiAgentName || 'Nenhum'}</span>
                      </div>
                    </div>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Button asChild className="w-full bg-primary hover:bg-primary/90 mt-auto">
                        <Link href={`/queues/${queue.id}`}>
                        Ver Kanban da Fila <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      {canManageQueues && (
        <QueueFormDialog
          isOpen={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={handleFormSubmit}
          initialData={editingQueue}
          aiAgents={aiAgents}
        />
      )}
    </>
  );
}
