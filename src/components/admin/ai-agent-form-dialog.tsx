
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { User, AiModel } from '@/types';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const aiAgentFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "O nome do agente IA deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um email válido (pode ser um email de serviço)." }).optional().or(z.literal('')),
  userType: z.literal('AGENT_AI'),
  avatarUrl: z.string().url({ message: "Por favor, insira uma URL válida para o avatar." }).optional().or(z.literal('')),
  llmPrompt: z.string().min(10, { message: "O Prompt do Sistema é obrigatório e deve ter pelo menos 10 caracteres." }),
  aiModelName: z.string().min(3, { message: "Selecione um Modelo de IA." }),
});

export type AiAgentFormData = z.infer<typeof aiAgentFormSchema>;

type AiAgentFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: AiAgentFormData) => void;
  initialData?: User | null;
  availableModels: AiModel[];
};

const AiAgentFormDialog = ({ isOpen, onOpenChange, onSubmit, initialData, availableModels }: AiAgentFormDialogProps) => {
  const form = useForm<AiAgentFormData>({
    resolver: zodResolver(aiAgentFormSchema),
    defaultValues: initialData && initialData.userType === 'AGENT_AI' ? {
      ...initialData,
      llmPrompt: initialData.llmPrompt || '',
      aiModelName: initialData.aiModelName || '',
    } : {
      name: '',
      email: '',
      userType: 'AGENT_AI',
      avatarUrl: '',
      llmPrompt: 'Você é um assistente virtual prestativo.',
      aiModelName: availableModels.length > 0 ? availableModels[0].name : '',
      id: undefined,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData && initialData.userType === 'AGENT_AI') {
        form.reset({
          ...initialData,
          llmPrompt: initialData.llmPrompt || '',
          aiModelName: initialData.aiModelName || (availableModels.length > 0 ? availableModels[0].name : ''),
          userType: 'AGENT_AI',
        });
      } else {
        form.reset({
          name: '',
          email: '',
          userType: 'AGENT_AI',
          avatarUrl: '',
          llmPrompt: 'Você é um assistente virtual prestativo.',
          aiModelName: availableModels.length > 0 ? availableModels[0].name : '',
          id: undefined,
        });
      }
    }
  }, [initialData, form, isOpen, availableModels]);
  
  const handleFormSubmit = (data: AiAgentFormData) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Agente IA' : 'Adicionar Novo Agente IA'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Atualize os detalhes do Agente IA.' : 'Preencha os detalhes para criar um novo Agente IA.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Agente IA</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Assistente de Vendas IA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="ia-assistente@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Avatar (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://placehold.co/avatar.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="llmPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt do Sistema</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Você é um assistente virtual amigável e prestativo..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="aiModelName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo de IA</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um modelo de IA" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableModels.length === 0 && <SelectItem value="" disabled>Nenhum modelo cadastrado</SelectItem>}
                      {availableModels.map(model => (
                        <SelectItem key={model.id} value={model.name}>
                          {model.name} ({model.provider})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {initialData ? 'Salvar Alterações' : 'Adicionar Agente IA'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AiAgentFormDialog;
