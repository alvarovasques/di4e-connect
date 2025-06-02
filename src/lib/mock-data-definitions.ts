
// src/lib/mock-data-definitions.ts
import type { User, Chat, Message, Queue, KnowledgeBaseArticle, KBItem, WhisperNote, Metric, PerformanceData, AiInsight, Role, AiModel, PermissionId, KBModelType, ChatStatusColumn, KanbanColumnConfig } from '@/types';
import { ALL_PERMISSIONS } from '@/types'; 

export const MOCK_USERS_DEFINITIONS: User[] = [
  { id: 'user_1', name: 'Alice Silva', email: 'alice@example.com', userType: 'AGENT_HUMAN', avatarUrl: 'https://placehold.co/100x100/E6A4B4/white?text=AS', roleId: 'role_agent_human', teamId: 'team_suporte_geral', assignedQueueIds: ['queue_1', 'queue_2'] },
  { id: 'user_2', name: 'Roberto Johnson', email: 'roberto@example.com', userType: 'SUPERVISOR', avatarUrl: 'https://placehold.co/100x100/A4E6B4/white?text=RJ', roleId: 'role_supervisor', teamId: 'team_suporte_geral', assignedQueueIds: ['queue_1', 'queue_2', 'queue_3', 'queue_pre_atendimento'] },
  {
    id: 'user_3',
    name: 'Assistente IA Padrão',
    email: 'ia@example.com',
    userType: 'AGENT_AI',
    avatarUrl: 'https://placehold.co/100x100/A4B4E6/white?text=IA',
    llmPrompt: 'Você é um assistente de atendimento ao cliente amigável e eficiente. Responda às perguntas dos clientes de forma clara e concisa. Se não souber a resposta, diga que vai verificar e peça um momento.',
    aiModelName: 'gemini-1.5-flash',
    roleId: 'role_agent_ai', 
    assignedQueueIds: ['queue_1', 'queue_pre_atendimento'] 
  },
  { id: 'user_4', name: 'Carlos Brown', email: 'carlos@example.com', userType: 'ADMIN', avatarUrl: 'https://placehold.co/100x100/E6DCA4/white?text=CB', roleId: 'role_admin', teamId: 'team_devops' },
  { id: 'user_5', name: 'Viviane Lima', email: 'viviane@example.com', userType: 'VIEWER', avatarUrl: 'https://placehold.co/100x100/B4A4E6/white?text=VL', roleId: 'role_viewer' },
  {
    id: 'user_6',
    name: 'Especialista IA Vendas',
    email: 'ia_vendas@example.com',
    userType: 'AGENT_AI',
    avatarUrl: 'https://placehold.co/100x100/FADBD8/white?text=IV',
    llmPrompt: 'Você é um especialista em vendas da IntelliContato. Seu objetivo é entender as necessidades do cliente e guiá-lo para a melhor solução de nossos produtos.',
    aiModelName: 'gemini-1.5-flash', 
    roleId: 'role_agent_ai',
    assignedQueueIds: ['queue_1']
  },
];

export const MOCK_USERS: User[] = MOCK_USERS_DEFINITIONS;

export const DEFAULT_USER_FOR_MOCK: User = MOCK_USERS_DEFINITIONS.find(u => u.userType === 'ADMIN')!;

// This user is for SSR and the initial client render state, ensuring consistency.
export const MOCK_CURRENT_USER_FOR_INITIAL_RENDER: User = DEFAULT_USER_FOR_MOCK;

export function getClientSideCurrentUser(): User {
  if (typeof window !== 'undefined') {
    const simulatedUserType = localStorage.getItem('simulatedUserType');
    const agentUser = MOCK_USERS_DEFINITIONS.find(u => u.userType === 'AGENT_HUMAN');
    const supervisorUser = MOCK_USERS_DEFINITIONS.find(u => u.userType === 'SUPERVISOR');
    const adminUser = MOCK_USERS_DEFINITIONS.find(u => u.userType === 'ADMIN');

    if (simulatedUserType === 'AGENT_HUMAN' && agentUser) {
      return agentUser;
    } else if (simulatedUserType === 'SUPERVISOR' && supervisorUser) {
      return supervisorUser;
    } else if (simulatedUserType === 'ADMIN' && adminUser) {
      return adminUser;
    }
    // Fallback if localStorage not set or invalid, set it to default.
    // This ensures that even if localStorage is weird, we default consistently.
    localStorage.setItem('simulatedUserType', DEFAULT_USER_FOR_MOCK.userType);
    return DEFAULT_USER_FOR_MOCK;
  }
  // This case should ideally not be hit if getClientSideCurrentUser is only called in useEffect.
  return DEFAULT_USER_FOR_MOCK; 
}

export const setSimulatedUserType = (userType: 'AGENT_HUMAN' | 'SUPERVISOR' | 'ADMIN') => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('simulatedUserType', userType);
    window.location.reload(); 
  }
};

// Legacy MOCK_CURRENT_USER for any direct non-component imports, now always the default.
// Components should use the state managed by useState and useEffect.
export const MOCK_CURRENT_USER: User = DEFAULT_USER_FOR_MOCK;


const generateMessages = (chatId: string, count: number, customerName: string): Message[] => {
  const messages: Message[] = [];
  const senders: Array<'customer' | 'agent'> = ['customer', 'agent'];
  const agent = MOCK_USERS_DEFINITIONS[0]; 
  for (let i = 0; i < count; i++) {
    const senderType = senders[i % 2];
    messages.push({
      id: `msg_${chatId}_${i}_${Date.now()}_${Math.random().toString(36).substring(2,5)}`,
      chatId,
      content: `Esta é a mensagem ${i + 1} para ${customerName}. ${'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(Math.random() * 2 + 1)}`,
      type: 'text',
      sender: senderType,
      senderId: senderType === 'agent' ? agent.id : `cust_${chatId.split('_')[1]}`,
      senderName: senderType === 'agent' ? agent.name : customerName,
      timestamp: new Date(Date.now() - (count - i) * 60000 * (Math.random() * 5 + 1)),
      isFromCustomer: senderType === 'customer',
      sentimentScore: senderType === 'customer' ? (Math.random() * 2 - 1) : undefined,
    });
  }
  return messages;
};

const DEFAULT_KANBAN_COLUMNS_DEFINITIONS: KanbanColumnConfig[] = [
  { id: 'col_waiting_default', title: 'Aguardando', mappedStatuses: ['WAITING'] },
  { id: 'col_progress_default', title: 'Em Progresso', mappedStatuses: ['IN_PROGRESS'] },
  { id: 'col_transferred_default', title: 'Transferido', mappedStatuses: ['TRANSFERRED'] }
];

export const MOCK_CHATS: Chat[] = [
  {
    id: 'chat_1',
    whatsappId: 'whatsapp:12345',
    customerName: 'João Silva',
    customerPhone: '+15551234567',
    queueId: 'queue_1',
    assignedTo: MOCK_USERS_DEFINITIONS[0].id, 
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    createdAt: new Date(Date.now() - 3600000 * 2),
    updatedAt: new Date(),
    lastActivity: new Date(Date.now() - 60000 * 5),
    lastMessagePreview: 'Ok, vou tentar isso agora.',
    unreadCount: 0,
    avatarUrl: 'https://placehold.co/100x100/F39C12/white?text=JS',
    aiAnalysis: { sentimentScore: 0.8, confidenceIndex: 0.9 },
    messages: generateMessages('chat_1', 10, 'João Silva'),
  },
  {
    id: 'chat_2',
    whatsappId: 'whatsapp:67890',
    customerName: 'Maria Souza',
    customerPhone: '+15559876543',
    queueId: 'queue_2',
    assignedTo: null,
    status: 'WAITING',
    priority: 'MEDIUM',
    createdAt: new Date(Date.now() - 3600000 * 1),
    updatedAt: new Date(Date.now() - 60000 * 15),
    lastActivity: new Date(Date.now() - 60000 * 15),
    lastMessagePreview: 'Preciso de ajuda com minha fatura.',
    unreadCount: 2,
    avatarUrl: 'https://placehold.co/100x100/5DADE2/white?text=MS',
    aiAnalysis: { sentimentScore: -0.2, confidenceIndex: 0.7 },
    messages: generateMessages('chat_2', 5, 'Maria Souza'),
  },
  {
    id: 'chat_3',
    whatsappId: 'whatsapp:11223',
    customerName: 'Pedro Pereira',
    customerPhone: '+15551122334',
    queueId: 'queue_pre_atendimento',
    assignedTo: MOCK_USERS_DEFINITIONS[2].id,
    status: 'IN_PROGRESS', 
    priority: 'LOW',
    createdAt: new Date(Date.now() - 3600000 * 5),
    updatedAt: new Date(Date.now() - 3600000 * 1),
    lastActivity: new Date(Date.now() - 3600000 * 1),
    lastMessagePreview: 'Obrigado pela sua ajuda!',
    unreadCount: 0,
    avatarUrl: 'https://placehold.co/100x100/2ECC71/white?text=PP',
    aiAnalysis: { sentimentScore: 0.95, confidenceIndex: 0.98 },
    messages: generateMessages('chat_3', 8, 'Pedro Pereira'),
  },
];

export const MOCK_QUEUES: Queue[] = [
  { 
    id: 'queue_pre_atendimento', 
    name: 'Fila de Pré-atendimento', 
    description: 'Primeiro contato e triagem inicial por IA.', 
    isActive: true, 
    kanbanColumns: DEFAULT_KANBAN_COLUMNS_DEFINITIONS,
    defaultAiAgentId: MOCK_USERS_DEFINITIONS.find(u => u.name === 'Assistente IA Padrão')?.id
  },
  { 
    id: 'queue_1', 
    name: 'Suporte de Vendas', 
    description: 'Lida com consultas de vendas', 
    isActive: true, 
    kanbanColumns: DEFAULT_KANBAN_COLUMNS_DEFINITIONS,
    defaultAiAgentId: MOCK_USERS_DEFINITIONS.find(u => u.name === 'Especialista IA Vendas')?.id
  },
  { id: 'queue_2', name: 'Suporte Técnico', description: 'Lida com problemas técnicos', isActive: true, kanbanColumns: DEFAULT_KANBAN_COLUMNS_DEFINITIONS },
  { id: 'queue_3', name: 'Faturamento', description: 'Lida com questões de faturamento', isActive: true, kanbanColumns: DEFAULT_KANBAN_COLUMNS_DEFINITIONS }, 
];

export const MOCK_KB_ITEMS: KBItem[] = [
  {
    id: 'folder_general_1', name: 'Políticas da Empresa', type: 'folder', modelType: 'general', ownerId: 'system',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), lastUpdatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    accessSettings: { general: 'public_to_model' }, tags: ['políticas', 'empresa'],
  },
  {
    id: 'file_general_politica_reembolso', parentId: 'folder_general_1', name: 'Política de Reembolso.md', type: 'file', modelType: 'general', ownerId: 'system',
    mimeType: 'text/markdown', content: '# Política de Reembolso\n\nDetalhes sobre nossa política de reembolso...\n\nSe um cliente solicitar um reembolso, siga estes passos:\n1. Verifique a data da compra.\n2. Consulte os termos de serviço.\n3. Se elegível, processe o reembolso via sistema X.', size: 1024,
    createdAt: new Date(Date.now() - 86400000 * 9).toISOString(), lastUpdatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    accessSettings: { general: 'public_to_model' }, tags: ['reembolso', 'financeiro'], summary: 'Detalhes sobre a política de reembolso da empresa, incluindo o processo passo a passo.'
  },
];


export const MOCK_ROLES: Role[] = [
  { 
    id: 'role_admin', name: 'Administrador', 
    permissions: ALL_PERMISSIONS.map(p => p.id), 
    description: 'Acesso total ao sistema.' 
  },
  { 
    id: 'role_supervisor', name: 'Supervisor', 
    permissions: [
      'access_dashboard', 'access_chat_module', 'access_queues_module', 'access_kb_module', 'access_reports_module', 
      'view_reports_full', 'manage_queues', 'supervisor_whisper_chat', 'supervisor_view_all_chats', 'access_support_page',
      'kb_view_personal', 'kb_view_team_all', 'kb_view_queue_all', 'kb_view_general', 
      'kb_manage_team_all', 'kb_manage_queue_all', 'kb_manage_general', 'kb_create_item',
      'manage_users', 'manage_roles', 'manage_ai_agents', 'access_admin_section',
      'access_integrations_module', 'manage_whatsapp_channels',
    ], 
    description: 'Gerencia agentes e filas, visualiza relatórios, gerencia KB e usuários (exceto admins), cargos, agentes IA e integrações.' 
  },
  { 
    id: 'role_agent_human', name: 'Agente Humano', 
    permissions: [
      'access_dashboard', 'access_chat_module', 'access_queues_module', 'handle_chats_human', 'access_support_page',
      'kb_view_personal', 'kb_manage_personal', 'kb_view_team_own', 'kb_view_queue_assigned', 'kb_view_general', 'kb_create_item'
    ], 
    description: 'Lida com interações de clientes, acessa e cria KB pessoal/da equipe/fila/geral.' 
  },
  { 
    id: 'role_agent_ai', name: 'Agente IA', 
    permissions: [
      'handle_chats_ai', 'kb_view_queue_assigned', 'kb_view_general' 
    ], 
    description: 'Agente de IA automatizado para atendimento.' 
  },
  { 
    id: 'role_viewer', name: 'Visualizador', 
    permissions: [
      'access_dashboard', 'view_reports_limited', 'access_support_page', 'kb_view_general'
    ], 
    description: 'Acesso somente leitura a determinados relatórios, painel e KB geral.' 
  },
];

export const MOCK_AI_MODELS: AiModel[] = [
  {
    id: 'model_1',
    name: 'gemini-1.5-flash',
    token: 'MOCK_TOKEN_GEMINI_FLASH_XXXXXXXXXXXXXXXXXXXX', 
    provider: 'Google AI',
    description: 'Modelo rápido e versátil da Google AI.'
  },
  {
    id: 'model_2',
    name: 'googleai/gemini-2.0-flash-exp',
    token: 'MOCK_TOKEN_GEMINI_FLASH_EXP_YYYYYYYYYYYYYYYY', 
    provider: 'Google AI',
    description: 'Modelo experimental da Google AI com capacidade de geração de imagem.'
  },
];

export const MOCK_WHISPER_NOTES: WhisperNote[] = [ /* ... */ ];
export const MOCK_METRICS: Metric[] = [ /* ... */ ];
export const MOCK_PERFORMANCE_DATA: PerformanceData = [ /* ... */ ];
export const MOCK_AI_INSIGHTS: AiInsight[] = [ /* ... */ ];

    