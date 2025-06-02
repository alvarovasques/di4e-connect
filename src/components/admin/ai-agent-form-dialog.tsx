
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { User } from '@/types';
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

const aiAgentFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "O nome do agente IA deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um email válido (pode ser um email de serviço)." }).optional().or(z.literal('')), // Email can be optional for AI agents
  userType: z.literal('AGENT_AI'), // Fixed user type
  avatarUrl: z.string().url({ message: "Por favor, insira uma URL válida para o avatar." }).optional().or(z.literal('')),
  llmPrompt: z.string().min(10, { message: "O Prompt do Sistema é obrigatório e deve ter pelo menos 10 caracteres." }),
  aiModelName: z.string().min(3, { message: "O Nome do Modelo de IA é obrigatório." }),
});

export type AiAgentFormData = z.infer<typeof aiAgentFormSchema>;

type AiAgentFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: AiAgentFormData) => void;
  initialData?: User | null; // Expects a User object, will adapt to AiAgentFormData
};

const AiAgentFormDialog = ({ isOpen, onOpenChange, onSubmit, initialData }: AiAgentFormDialogProps) => {
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
      aiModelName: 'gemini-1.5-flash',
      id: undefined,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData && initialData.userType === 'AGENT_AI') {
        form.reset({
          ...initialData,
          llmPrompt: initialData.llmPrompt || '',
          aiModelName: initialData.aiModelName || '',
          userType: 'AGENT_AI', // Ensure userType is always AGENT_AI
        });
      } else {
        form.reset({
          name: '',
          email: '',
          userType: 'AGENT_AI',
          avatarUrl: '',
          llmPrompt: 'Você é um assistente virtual prestativo.',
          aiModelName: 'gemini-1.5-flash',
          id: undefined,
        });
      }
    }
  }, [initialData, form, isOpen]);
  
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
                  <FormLabel>Nome do Modelo de IA</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: gemini-1.5-flash, gpt-4-turbo" {...field} />
                  </FormControl>
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
