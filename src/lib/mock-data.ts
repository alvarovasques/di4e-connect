
import type { User, Chat, Message, Queue, KnowledgeBaseArticle, KBItem, WhisperNote, Metric, PerformanceData, AiInsight, Role, AiModel, PermissionId, KBModelType, ChatStatusColumn, KanbanColumnConfig } from '@/types';
import { ALL_PERMISSIONS } from '@/types'; 

export const MOCK_USERS: User[] = [
  { id: 'user_1', name: 'Alice Silva', email: 'alice@example.com', userType: 'AGENT_HUMAN', avatarUrl: 'https://placehold.co/100x100/E6A4B4/white?text=AS', roleId: 'role_agent_human', teamId: 'team_suporte_geral', assignedQueueIds: ['queue_1', 'queue_2'] },
  { id: 'user_2', name: 'Roberto Johnson', email: 'roberto@example.com', userType: 'SUPERVISOR', avatarUrl: 'https://placehold.co/100x100/A4E6B4/white?text=RJ', roleId: 'role_supervisor', teamId: 'team_suporte_geral', assignedQueueIds: ['queue_1', 'queue_2', 'queue_3'] },
  {
    id: 'user_3',
    name: 'Assistente IA Padrão',
    email: 'ia@example.com',
    userType: 'AGENT_AI',
    avatarUrl: 'https://placehold.co/100x100/A4B4E6/white?text=IA',
    llmPrompt: 'Você é um assistente de atendimento ao cliente amigável e eficiente. Responda às perguntas dos clientes de forma clara e concisa. Se não souber a resposta, diga que vai verificar e peça um momento.',
    aiModelName: 'gemini-1.5-flash',
    roleId: 'role_agent_ai', 
    assignedQueueIds: ['queue_1'] 
  },
  { id: 'user_4', name: 'Carlos Brown', email: 'carlos@example.com', userType: 'ADMIN', avatarUrl: 'https://placehold.co/100x100/E6DCA4/white?text=CB', roleId: 'role_admin', teamId: 'team_devops' },
  { id: 'user_5', name: 'Viviane Lima', email: 'viviane@example.com', userType: 'VIEWER', avatarUrl: 'https://placehold.co/100x100/B4A4E6/white?text=VL', roleId: 'role_viewer' },
];

export const MOCK_CURRENT_USER: User = MOCK_USERS[1]; // Alterado para Roberto (Supervisor) para testar a página de filas


const generateMessages = (chatId: string, count: number): Message[] => {
  const messages: Message[] = [];
  const senders: Array<'customer' | 'agent'> = ['customer', 'agent'];
  const agent = MOCK_USERS[0]; 
  for (let i = 0; i < count; i++) {
    const senderType = senders[i % 2];
    messages.push({
      id: `msg_${chatId}_${i}`,
      chatId,
      content: `Esta é a mensagem ${i + 1} para o chat ${chatId}. ${'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(Math.random() * 3 + 1)}`,
      type: 'text',
      sender: senderType,
      senderId: senderType === 'agent' ? agent.id : `cust_${chatId.split('_')[1]}`, // Simula um ID de cliente
      senderName: senderType === 'agent' ? agent.name : `Cliente ${chatId.split('_')[1]}`,
      timestamp: new Date(Date.now() - (count - i) * 60000 * 5),
      isFromCustomer: senderType === 'customer',
      sentimentScore: senderType === 'customer' ? (Math.random() * 2 - 1) : undefined,
    });
  }
  return messages;
};

const DEFAULT_KANBAN_COLUMNS: KanbanColumnConfig[] = [
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
    queueId: 'queue_1', // Suporte de Vendas
    assignedTo: MOCK_USERS[0].id, // Alice
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
    queueId: 'queue_2', // Suporte Técnico
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
    queueId: 'queue_1', // Suporte de Vendas
    assignedTo: MOCK_USERS[2].id, // Assistente IA
    status: 'IN_PROGRESS', // Mudado para IN_PROGRESS para aparecer no Kanban
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
  {
    id: 'chat_4',
    whatsappId: 'whatsapp:44556',
    customerName: 'Ana Costa',
    customerPhone: '+15554455667',
    queueId: 'queue_2', // Suporte Técnico
    assignedTo: MOCK_USERS[0].id, // Alice
    status: 'WAITING',
    priority: 'URGENT',
    createdAt: new Date(Date.now() - 3600000 * 0.5),
    updatedAt: new Date(Date.now() - 60000 * 5),
    lastActivity: new Date(Date.now() - 60000 * 5),
    lastMessagePreview: 'Meu sistema está completamente parado!',
    unreadCount: 1,
    avatarUrl: 'https://placehold.co/100x100/E74C3C/white?text=AC',
    aiAnalysis: { sentimentScore: -0.9, confidenceIndex: 0.92 },
    messages: generateMessages('chat_4', 3),
  },
  {
    id: 'chat_5',
    whatsappId: 'whatsapp:77889',
    customerName: 'Lucas Mendes',
    customerPhone: '+15557788990',
    queueId: 'queue_1', // Suporte de Vendas
    assignedTo: null,
    status: 'WAITING',
    priority: 'MEDIUM',
    createdAt: new Date(Date.now() - 3600000 * 3),
    updatedAt: new Date(Date.now() - 60000 * 30),
    lastActivity: new Date(Date.now() - 60000 * 30),
    lastMessagePreview: 'Gostaria de saber mais sobre o plano premium.',
    unreadCount: 0,
    avatarUrl: 'https://placehold.co/100x100/9B59B6/white?text=LM',
    aiAnalysis: { sentimentScore: 0.1, confidenceIndex: 0.6 },
    messages: generateMessages('chat_5', 2),
  },
];

export const MOCK_QUEUES: Queue[] = [
  { id: 'queue_1', name: 'Suporte de Vendas', description: 'Lida com consultas de vendas', isActive: true, kanbanColumns: DEFAULT_KANBAN_COLUMNS },
  { id: 'queue_2', name: 'Suporte Técnico', description: 'Lida com problemas técnicos', isActive: true, kanbanColumns: DEFAULT_KANBAN_COLUMNS },
  { id: 'queue_3', name: 'Faturamento', description: 'Lida com questões de faturamento', isActive: true, kanbanColumns: DEFAULT_KANBAN_COLUMNS }, 
];


export const MOCK_KB_ITEMS: KBItem[] = [
  // ModelType: General
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
  {
    id: 'file_general_codigo_conduta', parentId: 'folder_general_1', name: 'Código de Conduta.pdf', type: 'file', modelType: 'general', ownerId: 'system',
    mimeType: 'application/pdf', fileUrl: '/docs/codigo_conduta.pdf', size: 512000, content: 'Este é o conteúdo simulado do PDF do Código de Conduta. Ele descreve os padrões éticos e profissionais esperados de todos os funcionários.',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(), lastUpdatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    accessSettings: { general: 'public_to_model' }, tags: ['conduta', 'interno'], summary: 'Documento PDF com o código de conduta da empresa.'
  },
  // ModelType: Queue (Suporte de Vendas - queue_1)
  {
    id: 'folder_queue_vendas_scripts', name: 'Scripts de Vendas (Fila Vendas)', type: 'folder', modelType: 'queue', queueId: 'queue_1', ownerId: MOCK_USERS[1].id, // Roberto (Supervisor)
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), lastUpdatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    accessSettings: { general: 'public_to_model' }, tags: ['vendas', 'scripts'],
  },
  {
    id: 'file_queue_vendas_script_produto_A', parentId: 'folder_queue_vendas_scripts', name: 'Script Produto A.txt', type: 'file', modelType: 'queue', queueId: 'queue_1', ownerId: MOCK_USERS[1].id,
    mimeType: 'text/plain', content: 'Olá! Interesse no Produto A? Ele oferece X, Y, Z como principais benefícios e pode resolver [problema do cliente]. Gostaria de saber mais?', size: 500,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), lastUpdatedAt: new Date().toISOString(),
    accessSettings: { general: 'public_to_model' }, tags: ['produto a', 'script'], summary: 'Script de vendas para o Produto A, focando nos benefícios e solução de problemas.'
  },
    // ModelType: Queue (Suporte Técnico - queue_2)
  {
    id: 'folder_queue_tecnico_solucoes', name: 'Soluções Comuns (Fila Técnico)', type: 'folder', modelType: 'queue', queueId: 'queue_2', ownerId: MOCK_USERS[1].id, // Roberto (Supervisor)
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), lastUpdatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    accessSettings: { general: 'public_to_model' }, tags: ['técnico', 'soluções'],
  },
  {
    id: 'file_queue_tecnico_redefinir_senha', parentId: 'folder_queue_tecnico_solucoes', name: 'Como Redefinir Senha.md', type: 'file', modelType: 'queue', queueId: 'queue_2', ownerId: MOCK_USERS[1].id,
    mimeType: 'text/markdown', content: '# Como Redefinir Senha\n\n1. Vá para a página de login.\n2. Clique em "Esqueci minha senha".\n3. Siga as instruções no email.', size: 700,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), lastUpdatedAt: new Date().toISOString(),
    accessSettings: { general: 'public_to_model' }, tags: ['senha', 'redefinição', 'tutorial'], summary: 'Passos para ajudar clientes a redefinir suas senhas.'
  },
  // ModelType: Team (Suporte Geral - team_suporte_geral)
  {
    id: 'folder_team_suporte_procedimentos', name: 'Procedimentos Internos (Equipe Suporte Geral)', type: 'folder', modelType: 'team', teamId: 'team_suporte_geral', ownerId: MOCK_USERS[1].id,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), lastUpdatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    accessSettings: { general: 'public_to_model' }, tags: ['procedimentos', 'suporte'],
  },
  {
    id: 'file_team_suporte_escalonamento', parentId: 'folder_team_suporte_procedimentos', name: 'Procedimento de Escalonamento.docx', type: 'file', modelType: 'team', teamId: 'team_suporte_geral', ownerId: MOCK_USERS[1].id,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', fileUrl: '/docs/escalonamento.docx', size: 120000, content: 'Simulação de conteúdo do DOCX sobre escalonamento. Se um problema não puder ser resolvido em 15 minutos, encaminhe para o Supervisor Roberto Johnson.',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(), lastUpdatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    accessSettings: { general: 'public_to_model' }, tags: ['escalonamento', 'suporte'], summary: 'Documento Word com os passos para escalonamento de chamados.'
  },
  // ModelType: Personal (Alice - user_1)
  {
    id: 'folder_personal_alice_rascunhos', name: 'Meus Rascunhos (Alice)', type: 'folder', modelType: 'personal', ownerId: MOCK_USERS[0].id,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), lastUpdatedAt: new Date().toISOString(),
    accessSettings: { general: 'owner_only' }, tags: ['pessoal', 'rascunhos'],
  },
  {
    id: 'file_personal_alice_notas_reuniao', parentId: 'folder_personal_alice_rascunhos', name: 'Notas da Reunião Cliente X.md', type: 'file', modelType: 'personal', ownerId: MOCK_USERS[0].id,
    mimeType: 'text/markdown', content: '## Reunião Cliente X\n- Discutido A sobre o problema de faturamento.\n- Pendente B: Verificar com o financeiro sobre a cobrança duplicada.\n- Cliente parecia satisfeito com a explicação inicial.', size: 200,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), lastUpdatedAt: new Date().toISOString(),
    accessSettings: { general: 'owner_only' }, tags: ['reunião', 'cliente x'], summary: 'Notas pessoais da reunião com o Cliente X, focando em faturamento.'
  },
  // Item Geral sem pasta pai (root level)
  {
    id: 'file_general_faq_produtos', name: 'FAQ Geral de Produtos.pdf', type: 'file', modelType: 'general', ownerId: 'system', parentId: null,
    mimeType: 'application/pdf', fileUrl: '/docs/faq_produtos.pdf', size: 204800, content: 'Conteúdo simulado do PDF de FAQ. Perguntas Frequentes: 1. Como faço para...? Resposta: ... 2. O produto Y é compatível com...? Resposta: ...',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(), lastUpdatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    accessSettings: { general: 'public_to_model' }, tags: ['faq', 'produtos'], summary: 'FAQ geral sobre os produtos da empresa.'
  },
  { 
    id: 'kb_genkit_1_from_items', 
    name: 'Como redefinir sua senha (ITEM)', // Nome do arquivo para consistência
    type: 'file', modelType: 'general', ownerId: 'system', parentId: null,
    mimeType: 'text/markdown', 
    content: 'Para redefinir sua senha, acesse a página de login e clique em "Esqueci minha senha". Siga as instruções enviadas para o seu e-mail. Certifique-se de verificar sua pasta de spam.', 
    summary: 'Guia passo a passo para o processo de redefinição de senha da conta de usuário.', 
    tags: ['senha', 'conta', 'redefinição'],
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(), lastUpdatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    accessSettings: { general: 'public_to_model' }
  },
  { 
    id: 'kb_genkit_2_from_items', 
    name: 'Entendendo sua fatura (ITEM)', 
    type: 'file', modelType: 'general', ownerId: 'system', parentId: null,
    mimeType: 'text/markdown', 
    content: 'Sua fatura mensal detalha todos os serviços utilizados e suas respectivas cobranças. O ciclo de faturamento geralmente começa no dia 1 de cada mês. Para dúvidas, entre em contato com o suporte.', 
    summary: 'Explicação dos componentes da fatura, ciclos de faturamento e como obter ajuda.', 
    tags: ['faturamento', 'fatura', 'cobrança'],
    createdAt: new Date(Date.now() - 86400000 * 18).toISOString(), lastUpdatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    accessSettings: { general: 'public_to_model' }
  },
  { 
    id: 'kb_genkit_3_from_items', 
    name: 'Solução de problemas de conexão (ITEM)', 
    type: 'file', modelType: 'general', ownerId: 'system', parentId: null,
    mimeType: 'text/markdown', 
    content: 'Se estiver com problemas de conexão, tente reiniciar seu modem e roteador. Verifique também se os cabos estão conectados corretamente. Se o problema persistir, nosso suporte técnico pode ajudar.', 
    summary: 'Passos básicos para diagnosticar e resolver problemas comuns de conexão com a internet.', 
    tags: ['técnico', 'conexão', 'internet', 'solução de problemas'],
    createdAt: new Date(Date.now() - 86400000 * 16).toISOString(), lastUpdatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    accessSettings: { general: 'public_to_model' }
  },
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
      'manage_users', 'manage_roles', 'manage_ai_agents', // Adicionado manage_roles e manage_ai_agents para Supervisor também
    ], 
    description: 'Gerencia agentes e filas, visualiza relatórios, gerencia KB e usuários (exceto admins), cargos e agentes IA.' 
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

    

    