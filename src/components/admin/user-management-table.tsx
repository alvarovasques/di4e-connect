
'use client';

import type { User } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, UserPlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import UserFormDialog, { type UserFormData } from './user-form-dialog';
import { useToast } from '@/hooks/use-toast';

type UserManagementTableProps = {
  users: User[];
};

const UserManagementTable = ({ users: initialUsers }: UserManagementTableProps) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.userType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const translateUserType = (userType: User['userType']): string => {
    switch (userType) {
      case 'ADMIN': return 'Administrador';
      case 'SUPERVISOR': return 'Supervisor';
      case 'AGENT_HUMAN': return 'Agente Humano';
      case 'AGENT_AI': return 'Agente IA';
      case 'VIEWER': return 'Visualizador';
      default: return userType.replace('_', ' ');
    }
  };

  const getUserTypeBadgeVariant = (userType: User['userType']): 'default' | 'secondary' | 'outline' | 'destructive' => {
    switch (userType) {
      case 'ADMIN': return 'destructive';
      case 'SUPERVISOR': return 'default';
      case 'AGENT_HUMAN': return 'secondary';
      case 'AGENT_AI': return 'outline';
      case 'VIEWER': return 'outline';
      default: return 'secondary';
    }
  };
  
  const handleOpenEditDialog = (userId: string) => {
    const userToEdit = users.find(u => u.id === userId);
    if (userToEdit) {
      setEditingUser(userToEdit);
      setIsFormOpen(true);
    }
  };

  const handleOpenAddDialog = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if(confirm(`Tem certeza que deseja excluir o usuário ${userToDelete?.name}?`)) {
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      toast({
        title: "Usuário Excluído",
        description: `O usuário ${userToDelete?.name} foi excluído com sucesso.`,
        variant: "default",
      });
    }
  };
  
  const handleFormSubmit = (data: UserFormData) => {
    if (editingUser && editingUser.id) {
      // Edit existing user
      setUsers(prevUsers =>
        prevUsers.map(u => (u.id === editingUser.id ? { ...u, ...data, id: u.id } : u))
      );
      toast({
        title: "Usuário Atualizado",
        description: `O usuário ${data.name} foi atualizado com sucesso.`,
      });
    } else {
      // Add new user
      const newUser: User = {
        ...data,
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`, // Simple unique ID for mock
        avatarUrl: data.avatarUrl || `https://placehold.co/100x100/cccccc/333333?text=${data.name.substring(0,2).toUpperCase()}`
      };
      setUsers(prevUsers => [newUser, ...prevUsers]);
      toast({
        title: "Usuário Adicionado",
        description: `O usuário ${data.name} foi adicionado com sucesso.`,
      });
    }
    setIsFormOpen(false);
    setEditingUser(null);
  };


  return (
    <>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="font-headline text-xl">Gerenciamento de Usuários</CardTitle>
            <CardDescription>Gerencie todos os usuários no sistema.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input 
              placeholder="Pesquisar usuários..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={handleOpenAddDialog} className="bg-primary hover:bg-primary/90">
              <UserPlus className="mr-2 h-4 w-4" /> Adicionar Usuário
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person avatar" />
                        <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getUserTypeBadgeVariant(user.userType)}>{translateUserType(user.userType)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">Ativo</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEditDialog(user.id)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <UserFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        initialData={editingUser}
      />
    </>
  );
};

export default UserManagementTable;
