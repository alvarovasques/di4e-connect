
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight, Users, Bot, PlusCircle, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { MOCK_QUEUES, MOCK_CHATS, MOCK_CURRENT_USER, MOCK_ROLES, MOCK_USERS } from '@/lib/mock-data';
import type { PermissionId, Queue, ChatStatusColumn, KanbanColumnConfig, User as UserType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import QueueFormDialog, { type QueueFormData } from '@/components/admin/queue-form-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const defaultMappedStatuses: ChatStatusColumn[][] = [
  ['WAITING'],
  ['IN_PROGRESS'],
  ['TRANSFERRED'],
];

export default function QueuesListPage() {
  const [queues, setQueues] = useState<Queue[]>(MOCK_QUEUES);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQueue, setEditingQueue] = useState<Queue | null>(null);
  const { toast } = useToast();
  
  const currentUserRole = MOCK_ROLES.find(role => role.id === MOCK_CURRENT_USER.roleId);
  const currentUserPermissions = useMemo(() => new Set(currentUserRole?.permissions || []), [currentUserRole]);

  const hasAccess = useMemo(() => {
    return currentUserPermissions.has('access_queues_module');
  }, [currentUserPermissions]);

  const canManageQueues = useMemo(() => {
    return currentUserPermissions.has('manage_queues');
  }, [currentUserPermissions]);

  const aiAgents = useMemo(() => MOCK_USERS.filter(user => user.userType === 'AGENT_AI'), []);


  useEffect(() => {
    // Em um app real, as filas seriam buscadas de uma API.
    // Para mock, se MOCK_QUEUES for atualizado externamente (improvável neste setup simples),
    // poderíamos re-sincronizar aqui, mas para o protótipo, inicializar uma vez é suficiente.
    setQueues(MOCK_QUEUES); 
  }, []);


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
    const humanAgentsInQueue = MOCK_USERS.filter(user => user.userType === 'AGENT_HUMAN' && user.assignedQueueIds?.includes(queue.id)).length;
    const allAiAgentsInQueue = MOCK_USERS.filter(user => user.userType === 'AGENT_AI' && user.assignedQueueIds?.includes(queue.id)).length; // Todos os IAs que poderiam ser atribuídos
    const defaultAiAgent = queue.defaultAiAgentId ? MOCK_USERS.find(u => u.id === queue.defaultAiAgentId) : null;
    
    return {
      activeChats: chatsInQueue.length,
      humanAgents: humanAgentsInQueue,
      aiAgents: allAiAgentsInQueue, // Renomeado para clareza, pode ser usado para info geral
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

  const handleDeleteQueue = (queueId: string) => {
    const queueToDelete = queues.find(q => q.id === queueId);
    if (confirm(`Tem certeza que deseja excluir a fila "${queueToDelete?.name}"?`)) {
      setQueues(prevQueues => prevQueues.filter(q => q.id !== queueId));
      // TODO: Em uma app real, faria uma chamada de API para excluir.
      // E.g., MOCK_QUEUES = MOCK_QUEUES.filter(q => q.id !== queueId);
      toast({
        title: "Fila Excluída",
        description: `A fila "${queueToDelete?.name}" foi excluída.`,
      });
    }
  };

  const processKanbanColumnNames = (namesString?: string): KanbanColumnConfig[] => {
    if (!namesString || namesString.trim() === '') {
      return [
        { id: `col_default_1_${Date.now()}`, title: 'Aguardando', mappedStatuses: ['WAITING'] },
        { id: `col_default_2_${Date.now()}`, title: 'Em Progresso', mappedStatuses: ['IN_PROGRESS'] },
        { id: `col_default_3_${Date.now()}`, title: 'Transferido', mappedStatuses: ['TRANSFERRED'] },
      ];
    }
    const namesArray = namesString.split('\n').map(name => name.trim()).filter(name => name !== '');
    return namesArray.map((name, index) => ({
      id: `col_${index}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: name,
      mappedStatuses: index < defaultMappedStatuses.length ? defaultMappedStatuses[index] : [],
    }));
  };

  const handleFormSubmit = (data: QueueFormData) => {
    const newKanbanColumns = processKanbanColumnNames(data.kanbanColumnNames);

    if (editingQueue) {
      const updatedQueues = queues.map(q => 
        q.id === editingQueue.id ? { ...q, ...data, kanbanColumns: newKanbanColumns, defaultAiAgentId: data.defaultAiAgentId || undefined } : q
      );
      setQueues(updatedQueues);
      // TODO: Em uma app real, MOCK_QUEUES seria atualizado ou uma chamada de API seria feita.
      // const mockIndex = MOCK_QUEUES.findIndex(q => q.id === editingQueue.id);
      // if (mockIndex !== -1) MOCK_QUEUES[mockIndex] = updatedQueues.find(q => q.id === editingQueue.id)!;
      toast({ title: "Fila Atualizada", description: `A fila "${data.name}" foi atualizada.` });
    } else {
      const newQueue: Queue = {
        id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: data.name,
        description: data.description || '',
        isActive: data.isActive,
        kanbanColumns: newKanbanColumns,
        defaultAiAgentId: data.defaultAiAgentId || undefined,
      };
      setQueues(prevQueues => [newQueue, ...prevQueues]);
      // TODO: Em uma app real, MOCK_QUEUES seria atualizado ou uma chamada de API seria feita.
      // MOCK_QUEUES.unshift(newQueue);
      toast({ title: "Fila Adicionada", description: `A fila "${data.name}" foi adicionada.` });
    }
    setIsFormOpen(false);
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
              <p className="text-muted-foreground">Nenhuma fila ativa para exibir.</p>
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
                      <p>Chats Ativos: <span className="font-semibold text-foreground">{info.activeChats}</span></p>
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

    
