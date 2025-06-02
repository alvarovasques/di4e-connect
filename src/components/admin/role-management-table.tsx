
'use client';

import type { Role, PermissionId } from '@/types';
import { ALL_PERMISSIONS } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, ShieldPlus, ShieldCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import RoleFormDialog, { type RoleFormData } from './role-form-dialog';
import { useToast } from '@/hooks/use-toast';

type RoleManagementTableProps = {
  roles: Role[];
};

const RoleManagementTable = ({ roles: initialRoles }: RoleManagementTableProps) => {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setRoles(initialRoles);
  }, [initialRoles]);

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getPermissionLabel = (permissionId: PermissionId): string => {
    const permission = ALL_PERMISSIONS.find(p => p.id === permissionId);
    return permission ? permission.label : permissionId;
  };

  const handleOpenEditDialog = (roleId: string) => {
    const roleToEdit = roles.find(r => r.id === roleId);
    if (roleToEdit) {
      setEditingRole(roleToEdit);
      setIsFormOpen(true);
    }
  };

  const handleOpenAddDialog = () => {
    setEditingRole(null);
    setIsFormOpen(true);
  };

  const handleDeleteRole = (roleId: string) => {
    const roleToDelete = roles.find(r => r.id === roleId);
    if (confirm(`Tem certeza que deseja excluir o cargo "${roleToDelete?.name}"?`)) {
      setRoles(prevRoles => prevRoles.filter(r => r.id !== roleId));
      toast({
        title: "Cargo Excluído",
        description: `O cargo "${roleToDelete?.name}" foi excluído com sucesso.`,
        variant: "default",
      });
    }
  };

  const handleFormSubmit = (data: RoleFormData) => {
    if (editingRole && editingRole.id) {
      setRoles(prevRoles =>
        prevRoles.map(r => (r.id === editingRole.id ? { ...r, ...data, id: r.id, permissions: data.permissions as PermissionId[] } : r))
      );
      toast({
        title: "Cargo Atualizado",
        description: `O cargo "${data.name}" foi atualizado com sucesso.`,
      });
    } else {
      const newRole: Role = {
        ...data,
        id: `role_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        permissions: data.permissions as PermissionId[],
      };
      setRoles(prevRoles => [newRole, ...prevRoles]);
      toast({
        title: "Cargo Adicionado",
        description: `O cargo "${data.name}" foi adicionado com sucesso.`,
      });
    }
    setIsFormOpen(false);
    setEditingRole(null);
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-xl flex items-center">
              <ShieldCheck className="mr-2 h-5 w-5 text-primary" /> Cargos e Permissões
            </CardTitle>
            <CardDescription>Gerencie cargos de usuário e suas permissões de acesso no sistema.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Pesquisar cargos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={handleOpenAddDialog} className="bg-primary hover:bg-primary/90">
              <ShieldPlus className="mr-2 h-4 w-4" /> Adicionar Cargo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Cargo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Permissões</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-xs truncate" title={role.description}>
                    {role.description || 'N/D'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-md">
                      {role.permissions.slice(0, 4).map((permission) => (
                        <Badge key={permission} variant="secondary" className="text-xs">
                          {getPermissionLabel(permission)}
                        </Badge>
                      ))}
                      {role.permissions.length > 4 && (
                        <Badge variant="outline" className="text-xs">+{role.permissions.length - 4} mais</Badge>
                      )}
                      {role.permissions.length === 0 && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">Nenhuma permissão</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEditDialog(role.id)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteRole(role.id)} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRoles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhum cargo encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <RoleFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        initialData={editingRole}
      />
    </>
  );
};

export default RoleManagementTable;
