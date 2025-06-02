
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, MessageCircle, Users, Settings, LifeBuoy, Bot, BookOpen, Share2, BarChart3, ShieldCheck } from 'lucide-react';
import type { PermissionId } from '@/types';

export type NavItem = {
  path: string;
  label: string;
  icon: LucideIcon;
  subItems?: NavItem[];
  section?: string;
  requiredPermission?: PermissionId; // Permissão necessária para ver este item
};

export const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Painel', icon: LayoutDashboard, section: 'Visão Geral', requiredPermission: 'access_dashboard' },
  { path: '/chat', label: 'Chat', icon: MessageCircle, section: 'Área de Trabalho', requiredPermission: 'access_chat_module' },
  { path: '/queues', label: 'Filas', icon: Share2, section: 'Área de Trabalho', requiredPermission: 'access_queues_module' },
  {
    path: '/knowledge-base',
    label: 'Base de Conhecimento',
    icon: BookOpen,
    section: 'Recursos',
    requiredPermission: 'access_kb_module'
  },
  {
    path: '/reports',
    label: 'Relatórios',
    icon: BarChart3,
    section: 'Análise',
    requiredPermission: 'access_reports_module'
  },
  {
    path: '/admin',
    label: 'Admin',
    icon: Settings,
    section: 'Configuração',
    requiredPermission: 'access_admin_section', // Permissão genérica para acessar a seção Admin
    subItems: [
      { path: '/admin/users', label: 'Usuários', icon: Users, requiredPermission: 'manage_users' },
      { path: '/admin/roles', label: 'Cargos e Permissões', icon: ShieldCheck, requiredPermission: 'manage_roles' }, // Ícone atualizado
      { path: '/admin/ai-settings', label: 'Agentes IA', icon: Bot, requiredPermission: 'manage_ai_agents' }, // Assumindo que gerenciar agentes IA é a permissão correta
    ]
  },
  { path: '/support', label: 'Suporte', icon: LifeBuoy, section: 'Ajuda', requiredPermission: 'access_support_page' },
];

export const APP_NAME = "IntelliContato";
