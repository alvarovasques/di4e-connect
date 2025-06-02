
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { PlusCircle, Search, Eye, Edit, Trash2, Folder, FileText as FileIcon, ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { KBItem, KBModelType, KBItemType, PermissionId } from '@/types';
import { MOCK_KB_ITEMS, MOCK_CURRENT_USER, MOCK_ROLES, MOCK_QUEUES, MOCK_USERS } from '@/lib/mock-data';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface PathSegment {
  id: string;
  name: string;
}

const modelTypeOptions: { value: KBModelType | 'all'; label: string; requiredPermission?: PermissionId }[] = [
  { value: 'all', label: 'Todos os Documentos' }, // Não requer permissão específica de modelo
  { value: 'personal', label: 'Meus Documentos', requiredPermission: 'kb_view_personal' },
  { value: 'team', label: 'Documentos da Equipe', requiredPermission: 'kb_view_team_own' }, // Ou kb_view_team_all
  { value: 'queue', label: 'Documentos da Fila', requiredPermission: 'kb_view_queue_assigned' }, // Ou kb_view_queue_all
  { value: 'general', label: 'Documentos Gerais', requiredPermission: 'kb_view_general' },
];

function getItemIcon(itemType: KBItemType, mimeType?: string) {
  if (itemType === 'folder') {
    return <Folder className="h-5 w-5 text-yellow-500" />;
  }
  if (mimeType?.startsWith('image/')) return <FileIcon className="h-5 w-5 text-blue-500" />;
  if (mimeType === 'application/pdf') return <FileIcon className="h-5 w-5 text-red-500" />;
  if (mimeType === 'text/markdown' || mimeType === 'text/plain') return <FileIcon className="h-5 w-5 text-gray-500" />;
  if (mimeType?.startsWith('video/')) return <FileIcon className="h-5 w-5 text-purple-500" />;
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return <FileIcon className="h-5 w-5 text-sky-500" />;
  return <FileIcon className="h-5 w-5 text-muted-foreground" />;
}

export default function KnowledgeBasePage() {
  const { toast } = useToast();
  const [allItems, setAllItems] = useState<KBItem[]>(MOCK_KB_ITEMS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isClient, setIsClient] = useState(false);

  const [selectedModelType, setSelectedModelType] = useState<KBModelType | 'all'>('all');
  const [currentPathSegments, setCurrentPathSegments] = useState<PathSegment[]>([]);
  
  const currentUserRole = MOCK_ROLES.find(role => role.id === MOCK_CURRENT_USER.roleId);
  const currentUserPermissions = useMemo(() => new Set(currentUserRole?.permissions || []), [currentUserRole]);

  const hasPermission = (permission: PermissionId) => currentUserPermissions.has(permission);

  const currentFolderId = useMemo(() => {
    return currentPathSegments.length > 0 ? currentPathSegments[currentPathSegments.length - 1].id : null;
  }, [currentPathSegments]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleNavigateToFolder = (folder: KBItem) => {
    setCurrentPathSegments(prev => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleNavigateBreadcrumb = (index: number) => {
    setCurrentPathSegments(prev => prev.slice(0, index + 1));
  };

  const handleNavigateHome = () => {
    setCurrentPathSegments([]);
  };

  const handleViewItem = (item: KBItem) => {
    if (item.type === 'folder') {
      handleNavigateToFolder(item);
    } else {
      toast({ title: 'Ação Simulada', description: `Visualizar arquivo: ${item.name}. Conteúdo: ${item.content || item.summary || 'N/A'}` });
    }
  };

  const handleEditItem = (item: KBItem) => {
    let canEdit = false;
    if (item.modelType === 'personal' && hasPermission('kb_manage_personal') && item.ownerId === MOCK_CURRENT_USER.id) canEdit = true;
    else if (item.modelType === 'team') {
        if (hasPermission('kb_manage_team_all')) canEdit = true;
        else if (hasPermission('kb_manage_team_own') && item.teamId === MOCK_CURRENT_USER.teamId) canEdit = true;
    } else if (item.modelType === 'queue') {
        if (hasPermission('kb_manage_queue_all')) canEdit = true;
        else if (hasPermission('kb_manage_queue_assigned') && MOCK_CURRENT_USER.assignedQueueIds?.includes(item.queueId || '')) canEdit = true;
    } else if (item.modelType === 'general' && hasPermission('kb_manage_general')) canEdit = true;
    
    if (canEdit) {
        toast({ title: 'Ação Simulada', description: `Editar item ID: ${item.id}` });
    } else {
        toast({ title: 'Acesso Negado', description: `Você não tem permissão para editar este item.`, variant: 'destructive'});
    }
  };

  const handleDeleteItem = (item: KBItem) => {
    let canDelete = false;
    // Similar permission logic as edit
    if (item.modelType === 'personal' && hasPermission('kb_manage_personal') && item.ownerId === MOCK_CURRENT_USER.id) canDelete = true;
    else if (item.modelType === 'team') {
        if (hasPermission('kb_manage_team_all')) canDelete = true;
        else if (hasPermission('kb_manage_team_own') && item.teamId === MOCK_CURRENT_USER.teamId) canDelete = true;
    } else if (item.modelType === 'queue') {
        if (hasPermission('kb_manage_queue_all')) canDelete = true;
        else if (hasPermission('kb_manage_queue_assigned') && MOCK_CURRENT_USER.assignedQueueIds?.includes(item.queueId || '')) canDelete = true;
    } else if (item.modelType === 'general' && hasPermission('kb_manage_general')) canDelete = true;

    if (canDelete) {
        if (confirm(`Tem certeza que deseja excluir "${item.name}"?`)) {
            setAllItems(prev => prev.filter(i => i.id !== item.id)); // Also delete children if it's a folder in a real scenario
            toast({ title: 'Item Excluído', description: `"${item.name}" foi excluído.` });
        }
    } else {
         toast({ title: 'Acesso Negado', description: `Você não tem permissão para excluir este item.`, variant: 'destructive'});
    }
  };

  const getAccessDisplayText = (item: KBItem): string => {
    if (item.type === 'file' && item.parentId) return "Herdado da Pasta"; // Simplified
    
    const owner = MOCK_USERS.find(u => u.id === item.ownerId);
    const ownerName = owner?.id === MOCK_CURRENT_USER.id ? 'Você' : owner?.name || 'Desconhecido';

    switch (item.modelType) {
        case 'personal': return `Pessoal (${ownerName})`;
        case 'team': 
            const teamName = item.teamId === MOCK_CURRENT_USER.teamId ? `Sua Equipe (${item.teamId})` : `Equipe ${item.teamId || 'N/A'}`;
            return teamName;
        case 'queue':
            const queueName = MOCK_QUEUES.find(q => q.id === item.queueId)?.name || item.queueId || 'N/A';
            return `Fila (${queueName})`;
        case 'general': return 'Geral (Toda Organização)';
        default: return item.accessSettings.general;
    }
  };

  const filteredAndSortedItems = useMemo(() => {
    return allItems
      .filter(item => {
        // 1. Filter by Selected Model Type & Permissions
        if (selectedModelType !== 'all') {
            if (item.modelType !== selectedModelType) return false;
        }
        // Check specific model type view permissions
        if (item.modelType === 'personal' && !hasPermission('kb_view_personal')) return false;
        if (item.modelType === 'personal' && item.ownerId !== MOCK_CURRENT_USER.id) return false; // Must be owner for personal
        
        if (item.modelType === 'team') {
            if (!hasPermission('kb_view_team_all') && (!hasPermission('kb_view_team_own') || item.teamId !== MOCK_CURRENT_USER.teamId)) return false;
        }
        if (item.modelType === 'queue') {
             if (!hasPermission('kb_view_queue_all') && (!hasPermission('kb_view_queue_assigned') || !MOCK_CURRENT_USER.assignedQueueIds?.includes(item.queueId || ''))) return false;
        }
        if (item.modelType === 'general' && !hasPermission('kb_view_general')) return false;


        // 2. Filter by Current Path (folder navigation)
        if (currentFolderId) { 
          return item.parentId === currentFolderId;
        } else { 
          // At the root of the selected model, show root folders of that modelType or root files of that modelType
          return !item.parentId;
        }
      })
      .filter(item => {
         // 3. Filter by Search Term
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          if (!item.name.toLowerCase().includes(searchLower) &&
              !(item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchLower)))) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
      });
  }, [allItems, selectedModelType, currentFolderId, searchTerm, currentUserPermissions, MOCK_CURRENT_USER.id, MOCK_CURRENT_USER.teamId, MOCK_CURRENT_USER.assignedQueueIds]);

  const formatFileSize = (bytes?: number) => {
    if (bytes === undefined || bytes === null) return '-';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const visibleModelTypeOptions = modelTypeOptions.filter(opt => {
    if (opt.value === 'all') return true;
    if (!opt.requiredPermission) return true; // Should not happen based on current options
    // Special check for team/queue "all" vs "own/assigned"
    if (opt.value === 'team' && (hasPermission('kb_view_team_all') || hasPermission('kb_view_team_own'))) return true;
    if (opt.value === 'queue' && (hasPermission('kb_view_queue_all') || hasPermission('kb_view_queue_assigned'))) return true;
    return hasPermission(opt.requiredPermission);
  });

  if (!isClient) {
    // Basic Skeleton for initial load
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <Skeleton className="h-10 w-48" />
          {hasPermission('kb_create_item') && <Skeleton className="h-10 w-36" />}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <Skeleton className="h-10 w-full sm:w-56" />
          <Skeleton className="h-10 w-full sm:flex-1" />
        </div>
        <div className="mb-4 h-7 w-1/2"><Skeleton className="h-full w-full" /></div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow><TableHead className="w-[50px] hidden sm:table-cell"><Skeleton className="h-4 w-full" /></TableHead><TableHead><Skeleton className="h-4 w-32" /></TableHead><TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableHead><TableHead><Skeleton className="h-4 w-28" /></TableHead><TableHead className="hidden lg:table-cell"><Skeleton className="h-4 w-16" /></TableHead><TableHead className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableHead><TableHead className="text-right"><Skeleton className="h-4 w-20" /></TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={`skeleton-load-${i}`}><TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-5 rounded-full" /></TableCell><TableCell><Skeleton className="h-4 w-full" /></TableCell><TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-full" /></TableCell><TableCell><Skeleton className="h-4 w-full" /></TableCell><TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-full" /></TableCell><TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-full" /></TableCell><TableCell className="text-right space-x-1"><Skeleton className="h-8 w-8 inline-block" /><Skeleton className="h-8 w-8 inline-block" /><Skeleton className="h-8 w-8 inline-block" /></TableCell></TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <div>
            <h1 className="text-3xl font-bold font-headline text-foreground">Base de Conhecimento</h1>
            <p className="text-muted-foreground">Gerencie documentos, arquivos e pastas por modelo e hierarquia.</p>
        </div>
        {hasPermission('kb_create_item') && (
            <Button asChild>
                <Link href="#"> {/* TODO: Implementar página/modal de criação */}
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo Item / Pasta
                </Link>
            </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <Select
          value={selectedModelType}
          onValueChange={(value) => {
            setSelectedModelType(value as KBModelType | 'all');
            setCurrentPathSegments([]); 
          }}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="Selecionar Modelo/Visão" />
          </SelectTrigger>
          <SelectContent>
            {visibleModelTypeOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
             {visibleModelTypeOptions.length === 0 && <SelectItem value="none" disabled>Nenhuma visão disponível</SelectItem>}
          </SelectContent>
        </Select>
        <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
            placeholder="Buscar por nome ou tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            />
        </div>
      </div>

      <div className="flex items-center gap-1 text-sm text-muted-foreground min-h-[28px]"> {/* min-h para evitar pulo de layout */}
        <Button variant="ghost" size="icon" onClick={handleNavigateHome} className="h-7 w-7" title="Início (Modelo Selecionado)">
          <Home className="h-4 w-4" />
        </Button>
        {currentPathSegments.map((segment, index) => (
          <React.Fragment key={segment.id}>
            <ChevronRight className="h-4 w-4" />
            <Button
              variant="link"
              onClick={() => handleNavigateBreadcrumb(index)}
              className={cn(
                "p-0 h-auto font-normal text-sm",
                index === currentPathSegments.length - 1 ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {segment.name}
            </Button>
          </React.Fragment>
        ))}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] hidden sm:table-cell"></TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">Tipo</TableHead>
              <TableHead>Última Modificação</TableHead>
              <TableHead className="hidden lg:table-cell">Tamanho</TableHead>
              <TableHead className="hidden md:table-cell">Acesso</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedItems.length > 0 ? (
              filteredAndSortedItems.map((item) => (
                <TableRow key={item.id} className={item.type === 'folder' ? 'hover:bg-muted/50' : ''}>
                  <TableCell className="hidden sm:table-cell">{getItemIcon(item.type, item.mimeType)}</TableCell>
                  <TableCell className="font-medium">
                    <button
                      onClick={() => handleViewItem(item)}
                      className={cn(
                        "text-left hover:underline w-full flex items-center gap-2",
                        item.type === 'folder' && "cursor-pointer"
                       )}
                    >
                      <span className="sm:hidden">{getItemIcon(item.type, item.mimeType)}</span>
                      {item.name}
                    </button>
                  </TableCell>
                  <TableCell className="hidden md:table-cell capitalize">
                    {item.type === 'file' ? (item.mimeType?.split('/')[1] || 'Arquivo') : 'Pasta'}
                  </TableCell>
                  <TableCell>{format(parseISO(item.lastUpdatedAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
                  <TableCell className="hidden lg:table-cell">{item.type === 'file' ? formatFileSize(item.size) : '-'}</TableCell>
                  <TableCell className="hidden md:table-cell text-xs">{getAccessDisplayText(item)}</TableCell>
                  <TableCell className="text-right space-x-0.5">
                    <Button variant="ghost" size="icon" onClick={() => handleViewItem(item)} title={item.type === 'folder' ? "Abrir Pasta" : "Ver Arquivo"}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)} title="Editar">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item)} title="Excluir" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                 {isClient ? `Nenhum item encontrado ${currentFolderId ? "nesta pasta" : (selectedModelType !== 'all' ? `em "${modelTypeOptions.find(opt => opt.value === selectedModelType)?.label}"` : "")}. Verifique suas permissões ou filtros.` : "Carregando itens..."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
