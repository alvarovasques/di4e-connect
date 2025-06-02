
export type User = {
  id: string;
  name: string;
  email: string;
  userType: 'ADMIN' | 'SUPERVISOR' | 'AGENT_HUMAN' | 'AGENT_AI' | 'VIEWER';
  avatarUrl?: string;
  llmPrompt?: string; // Prompt do sistema para agentes IA
  aiModelName?: string; // Nome do modelo de IA (ex: gemini-pro)
  roleId?: string; // Adicionado para vincular usuário a um cargo
  teamId?: string; // Para simular pertencimento a uma equipe para KB
  assignedQueueIds?: string[]; // Para simular filas que o usuário/agente atende para KB
};

export type Message = {
  id: string;
  chatId: string;
  content: string;
  type: 'text' | 'image' | 'audio' | 'document';
  sender: 'customer' | 'agent' | 'ai' | 'system';
  senderId?: string; // Corresponds to User.id for agent/ai/system
  senderName?: string; // Display name for sender
  timestamp: Date;
  isFromCustomer: boolean;
  whatsappMessageId?: string;
  sentimentScore?: number; // Added for displaying sentiment per message
};

export type Chat = {
  id: string;
  whatsappId: string;
  customerPhone: string;
  customerName: string;
  queueId: string;
  assignedTo: string | null; // User.id
  status: 'WAITING' | 'IN_PROGRESS' | 'TRANSFERRED' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;
  lastMessagePreview?: string;
  unreadCount?: number;
  avatarUrl?: string; // Customer avatar
  aiAnalysis?: {
    sentimentScore: number;
    confidenceIndex: number;
  };
  messages: Message[]; // Embed messages for simpler client-side handling in this example
};

export type Queue = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
};

// Tipos para a Base de Conhecimento (KB)
export type KBModelType = 'personal' | 'team' | 'queue' | 'general';
export type KBItemType = 'folder' | 'file';
export type KBGeneralAccess = 'owner_only' | 'internal_users' | 'restricted' | 'public_to_model';

export interface KBItem {
  id: string;
  name: string;
  type: KBItemType;
  modelType: KBModelType;
  ownerId: string;
  author?: string;
  teamId?: string;
  queueId?: string; // Para vincular a uma fila específica se for do modelType 'queue'
  parentId?: string | null;
  linkedFolderIds?: string[];
  
  mimeType?: string;
  content?: string; // Para artigos/markdown
  fileUrl?: string; // Para binários
  size?: number; // em bytes
  version?: number;
  summary?: string;
  
  accessSettings: { // Simplificado para este protótipo; em um sistema real, seria mais granular
    general: KBGeneralAccess; // Ex: 'owner_only', 'team_only', 'queue_only', 'organization', 'public_within_model_type'
    // Para 'restricted', podemos ter listas específicas, mas vamos manter simples por agora.
    // sharedWithUsers?: string[]; 
    // sharedWithTeams?: string[];
    // sharedWithQueues?: string[];
  };

  tags?: string[];
  createdAt: string; // ISO Date string
  lastUpdatedAt: string; // ISO Date string
  lastUpdatedBy?: string; // User ID
}

// Mantendo KnowledgeBaseArticle para compatibilidade com o fluxo de Genkit, mas KBItem será o principal para a UI
export type KnowledgeBaseArticle = {
  id: string;
  title: string;
  content: string;
  summary?: string;
  relevanceScore?: number;
  tags?: string[];
};


export type WhisperNote = {
  id: string;
  chatId: string;
  userId: string; // Agent who wrote the note
  userName: string;
  note: string;
  timestamp: Date;
};

export type Metric = {
  id: string;
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative';
};

export type PerformanceData = {
  name: string;
  value: number;
}[];

export type AiInsight = {
  id: string;
  type: 'PERFORMANCE' | 'TRAINING' | 'PROCESS' | 'SATISFACTION';
  title: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: Date;
};

export const ALL_PERMISSIONS = [
  { id: 'manage_users', label: 'Gerenciar Usuários (Humanos)' },
  { id: 'manage_roles', label: 'Gerenciar Cargos e Permissões' },
  { id: 'manage_ai_agents', label: 'Gerenciar Agentes de IA' },
  { id: 'manage_ai_models', label: 'Gerenciar Modelos de IA' },
  { id: 'view_reports_full', label: 'Visualizar Relatórios Completos' },
  { id: 'view_reports_limited', label: 'Visualizar Relatórios Limitados' },
  { id: 'manage_queues', label: 'Gerenciar Filas de Atendimento' },
  { id: 'handle_chats_human', label: 'Atender Chats (Agente Humano)' },
  { id: 'handle_chats_ai', label: 'Atender Chats (Agente IA)' },
  
  { id: 'access_admin_section', label: 'Acessar Seção de Administração' },
  { id: 'access_dashboard', label: 'Acessar Painel Principal' },
  { id: 'access_chat_module', label: 'Acessar Módulo de Chat' },
  { id: 'access_queues_module', label: 'Acessar Módulo de Filas' },
  { id: 'access_kb_module', label: 'Acessar Módulo da Base de Conhecimento' }, // Permissão genérica para o módulo
  { id: 'access_reports_module', label: 'Acessar Módulo de Relatórios' },
  { id: 'access_support_page', label: 'Acessar Página de Suporte' },
  
  // Permissões específicas da Base de Conhecimento (KB)
  { id: 'kb_view_personal', label: 'KB: Ver Documentos Pessoais' },
  { id: 'kb_manage_personal', label: 'KB: Gerenciar Documentos Pessoais' },
  { id: 'kb_view_team_all', label: 'KB: Ver Todos Documentos de Equipe' }, // Supervisor/Admin
  { id: 'kb_view_team_own', label: 'KB: Ver Documentos da Própria Equipe' }, // Membro da equipe
  { id: 'kb_manage_team_all', label: 'KB: Gerenciar Todos Documentos de Equipe' },
  { id: 'kb_manage_team_own', label: 'KB: Gerenciar Documentos da Própria Equipe' },
  { id: 'kb_view_queue_all', label: 'KB: Ver Todos Documentos de Fila' }, // Supervisor/Admin
  { id: 'kb_view_queue_assigned', label: 'KB: Ver Documentos das Filas Atribuídas' }, // Agente
  { id: 'kb_manage_queue_all', label: 'KB: Gerenciar Todos Documentos de Fila' },
  { id: 'kb_manage_queue_assigned', label: 'KB: Gerenciar Documentos das Filas Atribuídas' },
  { id: 'kb_view_general', label: 'KB: Ver Documentos Gerais' },
  { id: 'kb_manage_general', label: 'KB: Gerenciar Documentos Gerais' },
  { id: 'kb_create_item', label: 'KB: Criar Novos Itens/Pastas' }, // Permissão para o botão "Novo Item"

  { id: 'supervisor_whisper_chat', label: 'Sussurrar em Chats (Supervisor)' },
  { id: 'supervisor_view_all_chats', label: 'Visualizar Todos os Chats (Supervisor)' },
] as const;

export type PermissionId = typeof ALL_PERMISSIONS[number]['id'];

export type Role = {
  id: string;
  name: string;
  permissions: PermissionId[];
  description?: string;
};

export type AiModel = {
  id: string;
  name: string;
  token: string;
  provider: string;
  description?: string;
};
