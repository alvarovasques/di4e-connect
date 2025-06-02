

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

export type MessageType = 'text' | 'image' | 'audio' | 'document' | 'whisper' | 'system';

export type Message = {
  id: string;
  chatId: string;
  content: string;
  type: MessageType;
  sender: 'customer' | 'agent' | 'ai' | 'system' | 'supervisor'; // Added 'supervisor' for clarity on whispers
  senderId?: string; // Corresponds to User.id for agent/ai/system/supervisor
  senderName?: string; // Display name for sender
  timestamp: Date; // No Firestore, será armazenado como Timestamp, mas convertido para Date na aplicação
  isFromCustomer: boolean; // Can be derived from sender type, mas kept for explicitness
  whatsappMessageId?: string;
  sentimentScore?: number; // Added for displaying sentiment per message
  targetAgentId?: string; // For whisper messages, to know who it's intended for
};

export type ChatStatus = 'WAITING' | 'IN_PROGRESS' | 'TRANSFERRED' | 'RESOLVED' | 'CLOSED';
export type ChatPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// Definindo ChatStatusColumn para ser usado em kanbanColumns
export type ChatStatusColumn = 'WAITING' | 'IN_PROGRESS' | 'TRANSFERRED';


export type Chat = {
  id: string;
  whatsappId: string;
  customerPhone: string;
  customerName: string;
  queueId: string;
  assignedTo: string | null; // User.id
  status: ChatStatus;
  priority: ChatPriority;
  createdAt: Date; // No Firestore, será Timestamp
  updatedAt: Date; // No Firestore, será Timestamp
  lastActivity: Date; // No Firestore, será Timestamp
  lastMessagePreview?: string;
  unreadCount?: number;
  avatarUrl?: string; // Customer avatar
  aiAnalysis?: {
    sentimentScore: number;
    confidenceIndex: number;
  };
  messages: Message[]; // Em Firestore, messages serão uma subcoleção. No tipo Chat, pode ser opcional ou não existir.
  slaBreached?: boolean; 
};

export type KanbanColumnConfig = {
  id: string;
  title: string;
  mappedStatuses: ChatStatusColumn[]; // Mantido como estava, string[]
};

export type Queue = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  kanbanColumns?: KanbanColumnConfig[]; 
  defaultAiAgentId?: string; 
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
  queueId?: string; 
  parentId?: string | null;
  linkedFolderIds?: string[];
  
  mimeType?: string;
  content?: string; 
  fileUrl?: string; 
  size?: number; 
  version?: number;
  summary?: string;
  
  accessSettings: { 
    general: KBGeneralAccess; 
  };

  tags?: string[];
  createdAt: string; 
  lastUpdatedAt: string; 
  lastUpdatedBy?: string; 
}

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
  userId: string; 
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
  { id: 'access_kb_module', label: 'Acessar Módulo da Base de Conhecimento' }, 
  { id: 'access_reports_module', label: 'Acessar Módulo de Relatórios' },
  { id: 'access_support_page', label: 'Acessar Página de Suporte' },
  
  { id: 'kb_view_personal', label: 'KB: Ver Documentos Pessoais' },
  { id: 'kb_manage_personal', label: 'KB: Gerenciar Documentos Pessoais' },
  { id: 'kb_view_team_all', label: 'KB: Ver Todos Documentos de Equipe' }, 
  { id: 'kb_view_team_own', label: 'KB: Ver Documentos da Própria Equipe' }, 
  { id: 'kb_manage_team_all', label: 'KB: Gerenciar Todos Documentos de Equipe' },
  { id: 'kb_manage_team_own', label: 'KB: Gerenciar Documentos da Própria Equipe' },
  { id: 'kb_view_queue_all', label: 'KB: Ver Todos Documentos de Fila' }, 
  { id: 'kb_view_queue_assigned', label: 'KB: Ver Documentos das Filas Atribuídas' }, 
  { id: 'kb_manage_queue_all', label: 'KB: Gerenciar Todos Documentos de Fila' },
  { id: 'kb_manage_queue_assigned', label: 'KB: Gerenciar Documentos das Filas Atribuídas' },
  { id: 'kb_view_general', label: 'KB: Ver Documentos Gerais' },
  { id: 'kb_manage_general', label: 'KB: Gerenciar Documentos Gerais' },
  { id: 'kb_create_item', label: 'KB: Criar Novos Itens/Pastas' }, 

  { id: 'supervisor_whisper_chat', label: 'Sussurrar em Chats (Supervisor)' }, 
  { id: 'supervisor_view_all_chats', label: 'Visualizar Todos os Chats (Supervisor)' },

  { id: 'access_integrations_module', label: 'Acessar Módulo de Integrações' },
  { id: 'manage_whatsapp_channels', label: 'Gerenciar Canais WhatsApp' },
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
