
export type User = {
  id: string;
  name: string;
  email: string;
  userType: 'ADMIN' | 'SUPERVISOR' | 'AGENT_HUMAN' | 'AGENT_AI' | 'VIEWER';
  avatarUrl?: string;
  llmPrompt?: string; // Prompt do sistema para agentes IA
  aiModelName?: string; // Nome do modelo de IA (ex: gemini-pro)
  roleId?: string; // Adicionado para vincular usuário a um cargo
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

export type KnowledgeBaseArticle = {
  id: string;
  title: string;
  content: string;
  summary?: string; // Short summary for display
  relevanceScore?: number; // For suggested articles
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

// Definindo explicitamente o tipo para IDs de permissão
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
  { id: 'view_knowledge_base', label: 'Visualizar Base de Conhecimento' },
  { id: 'manage_knowledge_base', label: 'Gerenciar Base de Conhecimento' },
  { id: 'supervisor_whisper_chat', label: 'Sussurrar em Chats (Supervisor)' },
  { id: 'supervisor_view_all_chats', label: 'Visualizar Todos os Chats (Supervisor)' },
  { id: 'access_admin_section', label: 'Acessar Seção de Administração' },
  { id: 'access_dashboard', label: 'Acessar Painel Principal' },
  { id: 'access_chat_module', label: 'Acessar Módulo de Chat' },
  { id: 'access_queues_module', label: 'Acessar Módulo de Filas' },
  { id: 'access_kb_module', label: 'Acessar Módulo da Base de Conhecimento' },
  { id: 'access_reports_module', label: 'Acessar Módulo de Relatórios' },
  { id: 'access_support_page', label: 'Acessar Página de Suporte' },
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
  name: string; // e.g., "gemini-1.5-flash", "googleai/gemini-2.0-flash-exp"
  token: string; // API Key - handle with extreme care in a real app
  provider: string; // e.g., "Google AI", "OpenAI"
  description?: string;
};
