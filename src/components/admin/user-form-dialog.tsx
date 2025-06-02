
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Schema for regular users, excluding AI Agent specific fields at the top level
const userFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  userType: z.enum(['ADMIN', 'SUPERVISOR', 'AGENT_HUMAN', 'VIEWER'], { // AGENT_AI removed
    errorMap: () => ({ message: "Selecione um tipo de usuário válido." }),
  }),
  avatarUrl: z.string().url({ message: "Por favor, insira uma URL válida para o avatar." }).optional().or(z.literal('')),
  // llmPrompt and aiModelName are removed as they are specific to AI Agents
});

export type UserFormData = z.infer<typeof userFormSchema>;

type UserFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: UserFormData) => void;
  initialData?: User | null;
};

const UserFormDialog = ({ isOpen, onOpenChange, onSubmit, initialData }: UserFormDialogProps) => {
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: initialData && initialData.userType !== 'AGENT_AI' ? initialData : { // Ensure not to load AGENT_AI data
      name: '',
      email: '',
      userType: 'AGENT_HUMAN',
      avatarUrl: '',
      id: undefined,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData && initialData.userType !== 'AGENT_AI') {
        form.reset(initialData);
      } else {
        form.reset({
          name: '',
          email: '',
          userType: 'AGENT_HUMAN',
          avatarUrl: '',
          id: undefined,
        });
      }
    }
  }, [initialData, form, isOpen]);
  
  const handleFormSubmit = (data: UserFormData) => {
    onSubmit(data);
    onOpenChange(false);
  };
  
  const userTypeOptions: { value: Exclude<User['userType'], 'AGENT_AI'>; label: string }[] = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'SUPERVISOR', label: 'Supervisor' },
    { value: 'AGENT_HUMAN', label: 'Agente Humano' },
    { value: 'VIEWER', label: 'Visualizador' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Atualize os detalhes do usuário.' : 'Preencha os detalhes para criar um novo usuário.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo do usuário" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="userType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Usuário</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {userTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <Input placeholder="https://example.com/avatar.png" {...field} />
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
                {initialData ? 'Salvar Alterações' : 'Adicionar Usuário'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;
