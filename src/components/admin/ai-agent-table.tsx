
'use client';

import type { User, AiModel } from '@/types';
import { MOCK_AI_MODELS } from '@/lib/mock-data'; // Import MOCK_AI_MODELS
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Bot } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import AiAgentFormDialog, { type AiAgentFormData } from './ai-agent-form-dialog';
import { useToast } from '@/hooks/use-toast';

type AiAgentTableProps = {
  agents: User[]; 
};

const AiAgentTable = ({ agents: initialAgents }: AiAgentTableProps) => {
  const [agents, setAgents] = useState<User[]>(() => initialAgents.filter(u => u.userType === 'AGENT_AI'));
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<User | null>(null);
  const { toast } = useToast();
  
  // State for available AI models, initialized from MOCK_AI_MODELS
  // This could be fetched or managed globally in a real app. For now, using mock.
  const [availableModels, setAvailableModels] = useState<AiModel[]>(MOCK_AI_MODELS);

  useEffect(() => {
    setAgents(initialAgents.filter(u => u.userType === 'AGENT_AI'));
  }, [initialAgents]);

  // If MOCK_AI_MODELS can change (e.g., via AiModelTable), you might want an effect to update availableModels
  // For this prototype, assuming MOCK_AI_MODELS passed to AiModelTable is the source of truth
  // and this component just reads from it.
  useEffect(() => {
    setAvailableModels(MOCK_AI_MODELS);
  }, [MOCK_AI_MODELS]);


  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (agent.aiModelName && agent.aiModelName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (agent.llmPrompt && agent.llmPrompt.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleOpenEditDialog = (agentId: string) => {
    const agentToEdit = agents.find(a => a.id === agentId);
    if (agentToEdit) {
      setEditingAgent(agentToEdit);
      setIsFormOpen(true);
    }
  };

  const handleOpenAddDialog = () => {
    setEditingAgent(null);
    setIsFormOpen(true);
  };

  const handleDeleteAgent = (agentId: string) => {
    const agentToDelete = agents.find(a => a.id === agentId);
    if(confirm(`Tem certeza que deseja excluir o Agente IA ${agentToDelete?.name}?`)) {
      setAgents(prevAgents => prevAgents.filter(a => a.id !== agentId));
      toast({
        title: "Agente IA Excluído",
        description: `O Agente IA ${agentToDelete?.name} foi excluído com sucesso.`,
        variant: "default",
      });
    }
  };
  
  const handleFormSubmit = (data: AiAgentFormData) => {
    const submittedAgent = data as User;

    if (editingAgent && editingAgent.id) {
      setAgents(prevAgents =>
        prevAgents.map(a => (a.id === editingAgent.id ? { ...a, ...submittedAgent, id: a.id, userType: 'AGENT_AI' } : a))
      );
      toast({
        title: "Agente IA Atualizado",
        description: `O Agente IA ${submittedAgent.name} foi atualizado com sucesso.`,
      });
    } else {
      const newAgent: User = {
        ...submittedAgent,
        id: `ai_agent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userType: 'AGENT_AI',
        avatarUrl: submittedAgent.avatarUrl || `https://placehold.co/100x100/A4B4E6/white?text=${submittedAgent.name.substring(0,2).toUpperCase()}`,
      };
      setAgents(prevAgents => [newAgent, ...prevAgents]);
      toast({
        title: "Agente IA Adicionado",
        description: `O Agente IA ${submittedAgent.name} foi adicionado com sucesso.`,
      });
    }
    setIsFormOpen(false);
    setEditingAgent(null);
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-xl flex items-center"><Bot className="mr-2 h-5 w-5 text-primary" /> Agentes de IA</CardTitle>
            <CardDescription>Gerencie os perfis e configurações dos seus Agentes de Inteligência Artificial.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input 
              placeholder="Pesquisar agentes IA..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={handleOpenAddDialog} className="bg-primary hover:bg-primary/90">
              <Bot className="mr-2 h-4 w-4" /> Adicionar Agente IA
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Agente</TableHead>
                <TableHead>Modelo de IA</TableHead>
                <TableHead>Prompt do Sistema (Início)</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={agent.avatarUrl} alt={agent.name} data-ai-hint="robot avatar" />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {agent.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{agent.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{agent.aiModelName || 'N/D'}</TableCell>
                  <TableCell className="text-muted-foreground text-xs max-w-xs truncate" title={agent.llmPrompt}>
                    {agent.llmPrompt ? `${agent.llmPrompt.substring(0, 70)}...` : 'N/D'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEditDialog(agent.id)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar Configurações
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteAgent(agent.id)} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir Agente
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAgents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhum Agente IA encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AiAgentFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        initialData={editingAgent}
        availableModels={availableModels} 
      />
    </>
  );
};

export default AiAgentTable;
