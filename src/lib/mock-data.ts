
import type { User, Chat, Message, Queue, KnowledgeBaseArticle, WhisperNote, Metric, PerformanceData, AiInsight, Role } from '@/types';

export const MOCK_USERS: User[] = [
  { id: 'user_1', name: 'Alice Silva', email: 'alice@example.com', userType: 'AGENT_HUMAN', avatarUrl: 'https://placehold.co/100x100/E6A4B4/white?text=AS' },
  { id: 'user_2', name: 'Roberto Johnson', email: 'roberto@example.com', userType: 'SUPERVISOR', avatarUrl: 'https://placehold.co/100x100/A4E6B4/white?text=RJ' },
  { 
    id: 'user_3', 
    name: 'Assistente IA Padrão', 
    email: 'ia@example.com', 
    userType: 'AGENT_AI', 
    avatarUrl: 'https://placehold.co/100x100/A4B4E6/white?text=IA',
    llmPrompt: 'Você é um assistente de atendimento ao cliente amigável e eficiente. Responda às perguntas dos clientes de forma clara e concisa. Se não souber a resposta, diga que vai verificar e peça um momento.',
    aiModelName: 'gemini-1.5-flash'
  },
  { id: 'user_4', name: 'Carlos Brown', email: 'carlos@example.com', userType: 'ADMIN', avatarUrl: 'https://placehold.co/100x100/E6DCA4/white?text=CB' },
];

export const MOCK_CURRENT_USER: User = MOCK_USERS[1]; // Roberto Johnson (Supervisor)

const generateMessages = (chatId: string, count: number): Message[] => {
  const messages: Message[] = [];
  const senders: Array<'customer' | 'agent'> = ['customer', 'agent'];
  const agent = MOCK_USERS[0]; // Alice Silva
  for (let i = 0; i < count; i++) {
    const senderType = senders[i % 2];
    messages.push({
      id: `msg_${chatId}_${i}`,
      chatId,
      content: `Esta é a mensagem ${i + 1} para o chat ${chatId}. ${'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(Math.random() * 3 + 1)}`,
      type: 'text',
      sender: senderType,
      senderId: senderType === 'agent' ? agent.id : undefined,
      senderName: senderType === 'agent' ? agent.name : 'Cliente',
      timestamp: new Date(Date.now() - (count - i) * 60000 * 5), 
      isFromCustomer: senderType === 'customer',
      sentimentScore: senderType === 'customer' ? (Math.random() * 2 - 1) : undefined,
    });
  }
  return messages;
};

export const MOCK_CHATS: Chat[] = [
  {
    id: 'chat_1',
    whatsappId: 'whatsapp:12345',
    customerName: 'João Silva',
    customerPhone: '+15551234567',
    queueId: 'queue_1',
    assignedTo: MOCK_USERS[0].id,
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    createdAt: new Date(Date.now() - 3600000 * 2), 
    updatedAt: new Date(),
    lastActivity: new Date(Date.now() - 60000 * 5), 
    lastMessagePreview: 'Ok, vou tentar isso agora.',
    unreadCount: 0,
    avatarUrl: 'https://placehold.co/100x100/F39C12/white?text=JS',
    aiAnalysis: { sentimentScore: 0.8, confidenceIndex: 0.9 },
    messages: generateMessages('chat_1', 10),
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
    messages: generateMessages('chat_2', 5),
  },
  {
    id: 'chat_3',
    whatsappId: 'whatsapp:11223',
    customerName: 'Pedro Pereira',
    customerPhone: '+15551122334',
    queueId: 'queue_1',
    assignedTo: MOCK_USERS[2].id, // Assistente IA Padrão
    status: 'RESOLVED',
    priority: 'LOW',
    createdAt: new Date(Date.now() - 3600000 * 5), 
    updatedAt: new Date(Date.now() - 3600000 * 1),
    lastActivity: new Date(Date.now() - 3600000 * 1),
    lastMessagePreview: 'Obrigado pela sua ajuda!',
    unreadCount: 0,
    avatarUrl: 'https://placehold.co/100x100/2ECC71/white?text=PP',
    aiAnalysis: { sentimentScore: 0.95, confidenceIndex: 0.98 },
    messages: generateMessages('chat_3', 8),
  },
];

export const MOCK_QUEUES: Queue[] = [
  { id: 'queue_1', name: 'Suporte de Vendas', description: 'Lida com consultas de vendas', isActive: true },
  { id: 'queue_2', name: 'Suporte Técnico', description: 'Lida com problemas técnicos', isActive: true },
  { id: 'queue_3', name: 'Faturamento', description: 'Lida com questões de faturamento', isActive: false },
];

export const MOCK_KB_ARTICLES: KnowledgeBaseArticle[] = [
  { id: 'kb_1', title: 'Como redefinir sua senha', content: 'Passos detalhados para redefinir sua senha...', summary: 'Guia de redefinição de senha', tags: ['senha', 'conta'] },
  { id: 'kb_2', title: 'Entendendo sua fatura', content: 'Explicação dos ciclos de faturamento e cobranças...', summary: 'Informações de faturamento', tags: ['faturamento', 'fatura'] },
  { id: 'kb_3', title: 'Solução de problemas de conexão', content: 'Passos para resolver problemas comuns de conexão...', summary: 'Solução de problemas de conexão', tags: ['técnico', 'conexão'] },
];

export const MOCK_WHISPER_NOTES: WhisperNote[] = [
  { id: 'note_1', chatId: 'chat_1', userId: MOCK_USERS[1].id, userName: MOCK_USERS[1].name, note: 'Cliente parece frustrado, ofereça um desconto.', timestamp: new Date(Date.now() - 60000 * 10) },
  { id: 'note_2', chatId: 'chat_1', userId: MOCK_USERS[1].id, userName: MOCK_USERS[1].name, note: 'Verifique o histórico de interações anteriores para problemas semelhantes.', timestamp: new Date(Date.now() - 60000 * 3) },
];

export const MOCK_METRICS: Metric[] = [
  { id: 'metric_1', label: 'Total de Chats', value: 125, change: '+5%', changeType: 'positive' },
  { id: 'metric_2', label: 'Tempo Médio de Resposta', value: '2m 15s', change: '-10s', changeType: 'positive' },
  { id: 'metric_3', label: 'Taxa de Resolução', value: '85%', change: '+2%', changeType: 'positive' },
  { id: 'metric_4', label: 'Sentimento Médio', value: '0.65', change: '-0.05', changeType: 'negative' },
];

export const MOCK_PERFORMANCE_DATA: PerformanceData = [
  { name: 'Jan', value: 300 },
  { name: 'Fev', value: 450 },
  { name: 'Mar', value: 600 },
  { name: 'Abr', value: 500 },
  { name: 'Mai', value: 700 },
  { name: 'Jun', value: 650 },
];

export const MOCK_AI_INSIGHTS: AiInsight[] = [
    { id: 'insight_1', type: 'PERFORMANCE', title: 'CSAT Alto na Fila de Vendas', content: 'A fila de vendas alcançou uma pontuação CSAT de 95% esta semana. Considere aplicar suas estratégias a outras filas.', priority: 'MEDIUM', createdAt: new Date(Date.now() - 86400000 * 1) },
    { id: 'insight_2', type: 'TRAINING', title: 'Artigo da BC "Política de Reembolso" subutilizado', content: 'Agentes estão frequentemente perguntando sobre políticas de reembolso, mas o artigo da BC raramente é sugerido ou usado. Revise a visibilidade do artigo e o treinamento dos agentes.', priority: 'HIGH', createdAt: new Date(Date.now() - 86400000 * 2) },
    { id: 'insight_3', type: 'PROCESS', title: 'Maiores tempos de resolução nos fins de semana', content: 'Os tempos de resolução de chat aumentam 20% nos fins de semana. Investigue gargalos de pessoal ou processo.', priority: 'HIGH', createdAt: new Date(Date.now() - 86400000 * 3) },
];

export const MOCK_ROLES: Role[] = [
  { id: 'role_admin', name: 'Administrador', permissions: ['manage_users', 'manage_roles', 'view_reports', 'manage_queues', 'manage_ai_settings'], description: 'Acesso total ao sistema.' },
  { id: 'role_supervisor', name: 'Supervisor', permissions: ['view_reports', 'manage_queues', 'whisper_chats', 'view_all_chats'], description: 'Gerencia agentes e filas.' },
  { id: 'role_agent_human', name: 'Agente Humano', permissions: ['handle_chats', 'view_kb'], description: 'Lida com interações de clientes.' },
  { id: 'role_agent_ai', name: 'Agente IA', permissions: ['handle_chats_ai_only'], description: 'Agente de IA automatizado.' },
  { id: 'role_viewer', name: 'Visualizador', permissions: ['view_reports_limited'], description: 'Acesso somente leitura a determinados relatórios.' },
];
