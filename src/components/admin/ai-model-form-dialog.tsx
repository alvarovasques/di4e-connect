
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { AiModel } from '@/types';
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
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const aiModelFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, { message: "O nome do modelo deve ter pelo menos 3 caracteres." }),
  token: z.string().min(10, { message: "O token da API é obrigatório e deve ter pelo menos 10 caracteres." })
    .regex(/^[a-zA-Z0-9_-]+$/, {message: "O token deve conter apenas letras, números, _ ou -"}), // Basic validation
  provider: z.string().min(2, { message: "O provedor deve ter pelo menos 2 caracteres." }),
  description: z.string().optional(),
});

export type AiModelFormData = z.infer<typeof aiModelFormSchema>;

type AiModelFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: AiModelFormData) => void;
  initialData?: AiModel | null;
};

const AiModelFormDialog = ({ isOpen, onOpenChange, onSubmit, initialData }: AiModelFormDialogProps) => {
  const form = useForm<AiModelFormData>({
    resolver: zodResolver(aiModelFormSchema),
    defaultValues: initialData || {
      name: '',
      token: '',
      provider: '',
      description: '',
      id: undefined,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset(initialData);
      } else {
        form.reset({
          name: '',
          token: '',
          provider: 'Google AI', // Default provider
          description: '',
          id: undefined,
        });
      }
    }
  }, [initialData, form, isOpen]);
  
  const handleFormSubmit = (data: AiModelFormData) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Modelo de IA' : 'Adicionar Novo Modelo de IA'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Atualize os detalhes do modelo de IA.' : 'Preencha os detalhes para configurar um novo modelo de IA.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Modelo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: gemini-1.5-flash" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provedor</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Google AI, OpenAI" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token da API</FormLabel>
                  <FormControl>
                    {/* data-ai-hint é usado para sinalizar a necessidade de segurança de token no futuro */}
                    <Input type="password" placeholder="Cole seu token da API aqui" {...field} data-ai-hint="token security needed" />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground pt-1">
                    <strong>Aviso:</strong> Em produção, gerencie tokens de API com segurança no backend.
                  </p>
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
                      placeholder="Descreva brevemente este modelo ou suas capacidades."
                      className="min-h-[80px]"
                      {...field}
                    />
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
                {initialData ? 'Salvar Alterações' : 'Adicionar Modelo'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AiModelFormDialog;
