import type { User, Chat, Message, Queue, KnowledgeBaseArticle, WhisperNote, Metric, PerformanceData, AiInsight, Role } from '@/types';

export const MOCK_USERS: User[] = [
  { id: 'user_1', name: 'Alice Smith', email: 'alice@example.com', userType: 'AGENT_HUMAN', avatarUrl: 'https://placehold.co/100x100/E6A4B4/white?text=AS' },
  { id: 'user_2', name: 'Bob Johnson', email: 'bob@example.com', userType: 'SUPERVISOR', avatarUrl: 'https://placehold.co/100x100/A4E6B4/white?text=BJ' },
  { id: 'user_3', name: 'AI Assistant', email: 'ai@example.com', userType: 'AGENT_AI', avatarUrl: 'https://placehold.co/100x100/A4B4E6/white?text=AI' },
  { id: 'user_4', name: 'Charlie Brown', email: 'charlie@example.com', userType: 'ADMIN', avatarUrl: 'https://placehold.co/100x100/E6DCA4/white?text=CB' },
];

export const MOCK_CURRENT_USER: User = MOCK_USERS[1]; // Bob Johnson (Supervisor)

const generateMessages = (chatId: string, count: number): Message[] => {
  const messages: Message[] = [];
  const senders: Array<'customer' | 'agent'> = ['customer', 'agent'];
  const agent = MOCK_USERS[0]; // Alice Smith
  for (let i = 0; i < count; i++) {
    const senderType = senders[i % 2];
    messages.push({
      id: `msg_${chatId}_${i}`,
      chatId,
      content: `This is message ${i + 1} for chat ${chatId}. ${'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(Math.random() * 3 + 1)}`,
      type: 'text',
      sender: senderType,
      senderId: senderType === 'agent' ? agent.id : undefined,
      senderName: senderType === 'agent' ? agent.name : 'Customer',
      timestamp: new Date(Date.now() - (count - i) * 60000 * 5), // 5 minutes apart
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
    customerName: 'John Doe',
    customerPhone: '+15551234567',
    queueId: 'queue_1',
    assignedTo: MOCK_USERS[0].id,
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    createdAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
    updatedAt: new Date(),
    lastActivity: new Date(Date.now() - 60000 * 5), // 5 mins ago
    lastMessagePreview: 'Okay, I will try that now.',
    unreadCount: 0,
    avatarUrl: 'https://placehold.co/100x100/F39C12/white?text=JD',
    aiAnalysis: { sentimentScore: 0.8, confidenceIndex: 0.9 },
    messages: generateMessages('chat_1', 10),
  },
  {
    id: 'chat_2',
    whatsappId: 'whatsapp:67890',
    customerName: 'Jane Roe',
    customerPhone: '+15559876543',
    queueId: 'queue_2',
    assignedTo: null,
    status: 'WAITING',
    priority: 'MEDIUM',
    createdAt: new Date(Date.now() - 3600000 * 1), // 1 hour ago
    updatedAt: new Date(Date.now() - 60000 * 15), // 15 mins ago
    lastActivity: new Date(Date.now() - 60000 * 15),
    lastMessagePreview: 'I need help with my billing.',
    unreadCount: 2,
    avatarUrl: 'https://placehold.co/100x100/5DADE2/white?text=JR',
    aiAnalysis: { sentimentScore: -0.2, confidenceIndex: 0.7 },
    messages: generateMessages('chat_2', 5),
  },
  {
    id: 'chat_3',
    whatsappId: 'whatsapp:11223',
    customerName: 'Peter Pan',
    customerPhone: '+15551122334',
    queueId: 'queue_1',
    assignedTo: MOCK_USERS[2].id, // AI Assistant
    status: 'RESOLVED',
    priority: 'LOW',
    createdAt: new Date(Date.now() - 3600000 * 5), // 5 hours ago
    updatedAt: new Date(Date.now() - 3600000 * 1),
    lastActivity: new Date(Date.now() - 3600000 * 1),
    lastMessagePreview: 'Thank you for your help!',
    unreadCount: 0,
    avatarUrl: 'https://placehold.co/100x100/2ECC71/white?text=PP',
    aiAnalysis: { sentimentScore: 0.95, confidenceIndex: 0.98 },
    messages: generateMessages('chat_3', 8),
  },
];

export const MOCK_QUEUES: Queue[] = [
  { id: 'queue_1', name: 'Sales Support', description: 'Handles sales inquiries', isActive: true },
  { id: 'queue_2', name: 'Technical Support', description: 'Handles technical issues', isActive: true },
  { id: 'queue_3', name: 'Billing', description: 'Handles billing questions', isActive: false },
];

export const MOCK_KB_ARTICLES: KnowledgeBaseArticle[] = [
  { id: 'kb_1', title: 'How to reset your password', content: 'Detailed steps to reset your password...', summary: 'Password reset guide', tags: ['password', 'account'] },
  { id: 'kb_2', title: 'Understanding your bill', content: 'Explanation of billing cycles and charges...', summary: 'Billing information', tags: ['billing', 'invoice'] },
  { id: 'kb_3', title: 'Troubleshooting connection issues', content: 'Steps to resolve common connection problems...', summary: 'Connection troubleshooting', tags: ['technical', 'connection'] },
];

export const MOCK_WHISPER_NOTES: WhisperNote[] = [
  { id: 'note_1', chatId: 'chat_1', userId: MOCK_USERS[1].id, userName: MOCK_USERS[1].name, note: 'Customer seems frustrated, offer a discount.', timestamp: new Date(Date.now() - 60000 * 10) },
  { id: 'note_2', chatId: 'chat_1', userId: MOCK_USERS[1].id, userName: MOCK_USERS[1].name, note: 'Check previous interaction history for similar issues.', timestamp: new Date(Date.now() - 60000 * 3) },
];

export const MOCK_METRICS: Metric[] = [
  { id: 'metric_1', label: 'Total Chats', value: 125, change: '+5%', changeType: 'positive' },
  { id: 'metric_2', label: 'Avg. Response Time', value: '2m 15s', change: '-10s', changeType: 'positive' },
  { id: 'metric_3', label: 'Resolution Rate', value: '85%', change: '+2%', changeType: 'positive' },
  { id: 'metric_4', label: 'Avg. Sentiment', value: '0.65', change: '-0.05', changeType: 'negative' },
];

export const MOCK_PERFORMANCE_DATA: PerformanceData = [
  { name: 'Jan', value: 300 },
  { name: 'Feb', value: 450 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 500 },
  { name: 'May', value: 700 },
  { name: 'Jun', value: 650 },
];

export const MOCK_AI_INSIGHTS: AiInsight[] = [
    { id: 'insight_1', type: 'PERFORMANCE', title: 'High CSAT in Sales Queue', content: 'The sales queue achieved a 95% CSAT score this week. Consider applying their strategies to other queues.', priority: 'MEDIUM', createdAt: new Date(Date.now() - 86400000 * 1) },
    { id: 'insight_2', type: 'TRAINING', title: 'KB Article "Refund Policy" underused', content: 'Agents are frequently asking about refund policies, but the KB article is rarely suggested or used. Review article visibility and agent training.', priority: 'HIGH', createdAt: new Date(Date.now() - 86400000 * 2) },
    { id: 'insight_3', type: 'PROCESS', title: 'Longer resolution times on weekends', content: 'Chat resolution times increase by 20% on weekends. Investigate staffing or process bottlenecks.', priority: 'HIGH', createdAt: new Date(Date.now() - 86400000 * 3) },
];

export const MOCK_ROLES: Role[] = [
  { id: 'role_admin', name: 'Administrator', permissions: ['manage_users', 'manage_roles', 'view_reports', 'manage_queues', 'manage_ai_settings'], description: 'Full system access.' },
  { id: 'role_supervisor', name: 'Supervisor', permissions: ['view_reports', 'manage_queues', 'whisper_chats', 'view_all_chats'], description: 'Manages agents and queues.' },
  { id: 'role_agent_human', name: 'Human Agent', permissions: ['handle_chats', 'view_kb'], description: 'Handles customer interactions.' },
  { id: 'role_agent_ai', name: 'AI Agent', permissions: ['handle_chats_ai_only'], description: 'Automated AI agent.' },
  { id: 'role_viewer', name: 'Viewer', permissions: ['view_reports_limited'], description: 'Read-only access to certain reports.' },
];
