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
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'Overview' },
  { path: '/chat', label: 'Chat', icon: MessageCircle, section: 'Workspace' },
  { path: '/queues', label: 'Queues', icon: Share2, section: 'Workspace' },
  { 
    path: '/knowledge-base', 
    label: 'Knowledge Base', 
    icon: BookOpen, 
    section: 'Resources' 
  },
  { 
    path: '/reports', 
    label: 'Reports', 
    icon: BarChart3, 
    section: 'Analysis' 
  },
  { 
    path: '/admin', 
    label: 'Admin', 
    icon: Settings, 
    section: 'Configuration',
    subItems: [
      { path: '/admin/users', label: 'Users', icon: Users },
      { path: '/admin/roles', label: 'Roles & Permissions', icon: Users },
      { path: '/admin/ai-settings', label: 'AI Settings', icon: Bot },
    ]
  },
  { path: '/support', label: 'Support', icon: LifeBuoy, section: 'Help' },
];

export const APP_NAME = "IntelliContact";
