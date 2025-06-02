
export type User = {
  id: string;
  name: string;
  email: string;
  userType: 'ADMIN' | 'SUPERVISOR' | 'AGENT_HUMAN' | 'AGENT_AI' | 'VIEWER';
  avatarUrl?: string;
  llmPrompt?: string; // Prompt do sistema para agentes IA
  aiModelName?: string; // Nome do modelo de IA (ex: gemini-pro)
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

export type Role = {
  id: string;
  name: string;
  permissions: string[];
  description?: string;
};

export type AiModel = {
  id: string;
  name: string; // e.g., "gemini-1.5-flash", "googleai/gemini-2.0-flash-exp"
  token: string; // API Key - handle with extreme care in a real app
  provider: string; // e.g., "Google AI", "OpenAI"
  description?: string;
};
