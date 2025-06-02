
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Queue, User } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const queueFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, { message: "O nome da fila deve ter pelo menos 3 caracteres." }),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  kanbanColumnNames: z.string().optional().describe("Nomes das colunas do Kanban, um por linha. As três primeiras serão mapeadas para Aguardando, Em Progresso, Transferido."),
  defaultAiAgentId: z.string().optional().describe("ID do Agente IA padrão para esta fila."),
});

export type QueueFormData = z.infer<typeof queueFormSchema>;

type QueueFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: QueueFormData) => void;
  initialData?: Queue | null;
  aiAgents: User[]; // Lista de agentes IA disponíveis
};

const defaultKanbanColumnTitles = ['Aguardando', 'Em Progresso', 'Transferido'];

const QueueFormDialog = ({ isOpen, onOpenChange, onSubmit, initialData, aiAgents }: QueueFormDialogProps) => {
  const form = useForm<QueueFormData>({
    resolver: zodResolver(queueFormSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
      kanbanColumnNames: defaultKanbanColumnTitles.join('\n'),
      defaultAiAgentId: '',
      id: undefined,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        const columnNames = initialData.kanbanColumns && initialData.kanbanColumns.length > 0
          ? initialData.kanbanColumns.map(col => col.title).join('\n')
          : defaultKanbanColumnTitles.join('\n');
        form.reset({
          ...initialData,
          kanbanColumnNames: columnNames,
          defaultAiAgentId: initialData.defaultAiAgentId || '',
        });
      } else {
        form.reset({
          name: '',
          description: '',
          isActive: true,
          kanbanColumnNames: defaultKanbanColumnTitles.join('\n'),
          defaultAiAgentId: '',
          id: undefined,
        });
      }
    }
  }, [initialData, form, isOpen]);
  
  const handleFormSubmit = (data: QueueFormData) => {
    // Se defaultAiAgentId for uma string vazia, transforma em undefined para não salvar string vazia
    const dataToSubmit = {
      ...data,
      defaultAiAgentId: data.defaultAiAgentId === '' ? undefined : data.defaultAiAgentId,
    };
    onSubmit(dataToSubmit);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Fila' : 'Adicionar Nova Fila'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Atualize os detalhes, colunas do Kanban e Agente IA padrão da fila.' : 'Preencha os detalhes para criar uma nova fila, configurar suas colunas Kanban e Agente IA padrão.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Fila</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Suporte Nível 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva brevemente o propósito desta fila."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="defaultAiAgentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agente IA Padrão (Opcional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um Agente IA" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Nenhum Agente IA Padrão</SelectItem>
                      {aiAgents.map(agent => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Selecione um Agente IA para ser o padrão desta fila.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="kanbanColumnNames"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomes das Colunas do Kanban</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Aguardando\nEm Progresso\nTransferido"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Digite um nome de coluna por linha. As três primeiras serão mapeadas para os status padrão de chat.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Status da Fila</FormLabel>
                    <FormDescription>
                      {field.value ? "A fila está ativa e pode receber chats." : "A fila está inativa e não receberá novos chats."}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {initialData ? 'Salvar Alterações' : 'Adicionar Fila'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default QueueFormDialog;

    
