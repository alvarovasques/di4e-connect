
'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Role, PermissionId } from '@/types';
import { ALL_PERMISSIONS } from '@/types'; // Importar ALL_PERMISSIONS
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

const roleFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, { message: "O nome do cargo deve ter pelo menos 3 caracteres." }),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, { message: "Selecione pelo menos uma permissão." }),
});

export type RoleFormData = z.infer<typeof roleFormSchema>;

type RoleFormDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: RoleFormData) => void;
  initialData?: Role | null;
};

const RoleFormDialog = ({ isOpen, onOpenChange, onSubmit, initialData }: RoleFormDialogProps) => {
  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: initialData ? {
        ...initialData,
        permissions: initialData.permissions as PermissionId[],
    } : {
      name: '',
      description: '',
      permissions: [],
      id: undefined,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
            ...initialData,
            permissions: initialData.permissions as PermissionId[],
        });
      } else {
        form.reset({
          name: '',
          description: '',
          permissions: [],
          id: undefined,
        });
      }
    }
  }, [initialData, form, isOpen]);

  const handleFormSubmit = (data: RoleFormData) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar Cargo' : 'Adicionar Novo Cargo'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Atualize os detalhes e permissões do cargo.' : 'Preencha os detalhes e selecione as permissões para o novo cargo.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cargo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Supervisor de Atendimento" {...field} />
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
                      placeholder="Descreva brevemente as responsabilidades deste cargo."
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
              name="permissions"
              render={() => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel className="text-base">Permissões</FormLabel>
                    <FormDescription>
                      Selecione as permissões que este cargo terá.
                    </FormDescription>
                  </div>
                  <ScrollArea className="h-64 rounded-md border p-4">
                    <div className="space-y-2">
                    {ALL_PERMISSIONS.map((permission) => (
                      <FormField
                        key={permission.id}
                        control={form.control}
                        name="permissions"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={permission.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(permission.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), permission.id])
                                      : field.onChange(
                                          (field.value || []).filter(
                                            (value) => value !== permission.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal text-sm">
                                {permission.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                    </div>
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                {initialData ? 'Salvar Alterações' : 'Adicionar Cargo'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RoleFormDialog;
