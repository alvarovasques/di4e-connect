
'use client';

import type { Role } from '@/types';
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
import { MoreHorizontal, Edit, Trash2, ShieldPlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

type RoleManagementTableProps = {
  roles: Role[];
};

const RoleManagementTable = ({ roles: initialRoles }: RoleManagementTableProps) => {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleEditRole = (roleId: string) => alert(`Editar cargo: ${roleId}`);
  const handleDeleteRole = (roleId: string) => {
     if(confirm(`Tem certeza que deseja excluir o cargo ${roleId}?`)) {
      setRoles(prevRoles => prevRoles.filter(r => r.id !== roleId));
      alert(`Cargo excluído: ${roleId}`);
    }
  };
  const handleAddRole = () => alert('Adicionar novo cargo');

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline text-xl">Cargos e Permissões</CardTitle>
          <CardDescription>Gerencie cargos de usuário e suas permissões.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
           <Input 
            placeholder="Pesquisar cargos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button onClick={handleAddRole} className="bg-primary hover:bg-primary/90">
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
                <TableCell className="text-muted-foreground">{role.description || 'N/D'}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((permission) => (
                      <Badge key={permission} variant="secondary">{permission.replace(/_/g, ' ')}</Badge>
                    ))}
                    {role.permissions.length > 3 && (
                      <Badge variant="outline">+{role.permissions.length - 3} mais</Badge>
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
                      <DropdownMenuItem onClick={() => handleEditRole(role.id)}>
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
  );
};

export default RoleManagementTable;
