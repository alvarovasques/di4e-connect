
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, MessageCircle, Users, Settings, LifeBuoy, Bot, BookOpen, Share2, BarChart3 } from 'lucide-react';

export type NavItem = {
  path: string;
  label: string;
  icon: LucideIcon;
  subItems?: NavItem[];
  section?: string;
};

export const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Painel', icon: LayoutDashboard, section: 'Visão Geral' },
  { path: '/chat', label: 'Chat', icon: MessageCircle, section: 'Área de Trabalho' },
  { path: '/queues', label: 'Filas', icon: Share2, section: 'Área de Trabalho' },
  { 
    path: '/knowledge-base', 
    label: 'Base de Conhecimento', 
    icon: BookOpen, 
    section: 'Recursos' 
  },
  { 
    path: '/reports', 
    label: 'Relatórios', 
    icon: BarChart3, 
    section: 'Análise' 
  },
  { 
    path: '/admin', 
    label: 'Admin', 
    icon: Settings, 
    section: 'Configuração',
    subItems: [
      { path: '/admin/users', label: 'Usuários', icon: Users },
      { path: '/admin/roles', label: 'Cargos e Permissões', icon: Users },
      { path: '/admin/ai-settings', label: 'Configurações de IA', icon: Bot },
    ]
  },
  { path: '/support', label: 'Suporte', icon: LifeBuoy, section: 'Ajuda' },
];

export const APP_NAME = "IntelliContato";
