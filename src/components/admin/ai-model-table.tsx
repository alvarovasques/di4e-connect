
'use client';

import type { AiModel } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, PlusCircle, Cpu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import AiModelFormDialog, { type AiModelFormData } from './ai-model-form-dialog';
import { useToast } from '@/hooks/use-toast';

type AiModelTableProps = {
  models: AiModel[];
};

const AiModelTable = ({ models: initialModels }: AiModelTableProps) => {
  const [models, setModels] = useState<AiModel[]>(initialModels);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<AiModel | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setModels(initialModels);
  }, [initialModels]);

  const filteredModels = models.filter(model => 
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (model.description && model.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleOpenEditDialog = (modelId: string) => {
    const modelToEdit = models.find(m => m.id === modelId);
    if (modelToEdit) {
      setEditingModel(modelToEdit);
      setIsFormOpen(true);
    }
  };

  const handleOpenAddDialog = () => {
    setEditingModel(null);
    setIsFormOpen(true);
  };

  const handleDeleteModel = (modelId: string) => {
    const modelToDelete = models.find(m => m.id === modelId);
    if(confirm(`Tem certeza que deseja excluir o modelo de IA ${modelToDelete?.name}?`)) {
      setModels(prevModels => prevModels.filter(m => m.id !== modelId));
      toast({
        title: "Modelo de IA Excluído",
        description: `O modelo ${modelToDelete?.name} foi excluído com sucesso.`,
        variant: "default",
      });
    }
  };
  
  const handleFormSubmit = (data: AiModelFormData) => {
    if (editingModel && editingModel.id) {
      setModels(prevModels =>
        prevModels.map(m => (m.id === editingModel.id ? { ...m, ...data, id: m.id } : m))
      );
      toast({
        title: "Modelo de IA Atualizado",
        description: `O modelo ${data.name} foi atualizado com sucesso.`,
      });
    } else {
      const newModel: AiModel = {
        ...data,
        id: `model_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      };
      setModels(prevModels => [newModel, ...prevModels]);
      toast({
        title: "Modelo de IA Adicionado",
        description: `O modelo ${data.name} foi adicionado com sucesso.`,
      });
    }
    setIsFormOpen(false);
    setEditingModel(null);
  };

  const obfuscateToken = (token: string) => {
    if (token.length <= 8) return '********';
    return `${token.substring(0, 4)}...${token.substring(token.length - 4)}`;
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
             {/* CardTitle and CardDescription are handled by the page now */}
          </div>
          <div className="flex items-center gap-2">
            <Input 
              placeholder="Pesquisar modelos..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={handleOpenAddDialog} className="bg-primary hover:bg-primary/90">
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Modelo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Modelo</TableHead>
                <TableHead>Provedor</TableHead>
                <TableHead>Token (Ofuscado)</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModels.map((model) => (
                <TableRow key={model.id}>
                  <TableCell className="font-medium flex items-center">
                    <Cpu className="mr-2 h-4 w-4 text-primary" />
                    {model.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{model.provider}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs" data-ai-hint="token security needed">
                    {obfuscateToken(model.token)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs max-w-xs truncate" title={model.description}>
                    {model.description || 'N/D'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEditDialog(model.id)}>
                          <Edit className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteModel(model.id)} className="text-destructive focus:text-destructive-foreground focus:bg-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredModels.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum Modelo de IA configurado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AiModelFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleFormSubmit}
        initialData={editingModel}
      />
    </>
  );
};

export default AiModelTable;
