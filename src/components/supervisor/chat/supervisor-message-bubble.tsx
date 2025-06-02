
'use client';

import type { Message, User } from '@/types';
import { MOCK_CURRENT_USER } from '@/lib/mock-data'; 
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import SentimentDisplay from '@/components/chat/sentiment-display'; // Re-usable
import { MessageSquareQuote, Ear } from 'lucide-react'; 

type SupervisorMessageBubbleProps = {
  message: Message;
  senderUser?: User; 
  assignedAgentId?: string | null; 
};

const SupervisorMessageBubble = ({ message, senderUser, assignedAgentId }: SupervisorMessageBubbleProps) => {
  
  if (message.type === 'whisper') {
    const isCurrentUserSupervisorOrAdmin = MOCK_CURRENT_USER.userType === 'SUPERVISOR' || MOCK_CURRENT_USER.userType === 'ADMIN';
    const isCurrentUserAssignedAgent = MOCK_CURRENT_USER.id === assignedAgentId;
    const isCurrentUserTheWhisperSender = MOCK_CURRENT_USER.id === message.senderId;

    // Whisper visible to supervisor/admin, the assigned agent, or the sender of the whisper
    if (!isCurrentUserSupervisorOrAdmin && !isCurrentUserAssignedAgent && !isCurrentUserTheWhisperSender) {
      return null; 
    }
  }

  const isUserMessage = message.sender !== 'customer'; // Agent, AI, Supervisor, System
  const isWhisper = message.type === 'whisper';

  // Whispers align left. User messages (agent/supervisor to customer) align right. Customer messages align left.
  const alignClass = isUserMessage && !isWhisper ? 'items-end' : 'items-start'; 

  let bubbleClass = '';
  if (isWhisper) {
    bubbleClass = 'bg-yellow-100 border border-yellow-300 text-yellow-900 rounded-lg'; 
  } else if (isUserMessage) { // Messages from agent/supervisor to customer
    bubbleClass = 'bg-primary text-primary-foreground rounded-br-none';
  } else { // Customer messages
    bubbleClass = 'bg-muted text-foreground rounded-bl-none';
  }
  
  const senderNameDisplay = message.senderName || (isUserMessage ? 'Agente/Sistema' : 'Cliente');
  // Customer avatar is handled by the main chat object, not per message here.
  // For agent/supervisor messages, we use senderUser.avatarUrl.
  const avatarUrl = isUserMessage ? senderUser?.avatarUrl : undefined; 

  const FallbackAvatarContent = () => {
    if (isWhisper) return <Ear className="h-4 w-4 text-yellow-700" />;
    if (isUserMessage && senderUser) return senderUser.name.substring(0, 1).toUpperCase();
    if (!isUserMessage && message.senderName) return message.senderName.substring(0,1).toUpperCase(); // Customer
    return "S"; // System or unknown
  };

  return (
    <div className={cn("flex flex-col gap-1 py-2", alignClass)}>
      <div className={cn("flex items-end gap-2", (isUserMessage && !isWhisper) ? "flex-row-reverse" : "flex-row")}>
        {(!isUserMessage || isWhisper) && ( 
           <Avatar className="h-8 w-8 border">
            {/* For customer, avatar comes from chat.avatarUrl. For whispers/agent, from senderUser. */}
            <AvatarImage src={isWhisper ? senderUser?.avatarUrl : (isUserMessage ? senderUser?.avatarUrl : undefined)} data-ai-hint="person avatar" />
            <AvatarFallback className={cn(
                "text-xs", 
                isWhisper ? "bg-yellow-200" : (isUserMessage ? "bg-primary/20" : "bg-muted-foreground/20")
            )}>
              <FallbackAvatarContent />
            </AvatarFallback>
          </Avatar>
        )}
        <Card className={cn("max-w-xs md:max-w-md lg:max-w-lg p-0 shadow-md", bubbleClass)}>
          <CardContent className="p-3">
            {isWhisper && (
                <p className="text-xs font-semibold mb-0.5 text-yellow-800">
                    {message.senderName || "Supervisor"} (Sussurro para Agente):
                </p>
            )}
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </CardContent>
        </Card>
      </div>
      <div className={cn("text-xs text-muted-foreground/80 px-1", (isUserMessage && !isWhisper) ? "text-right" : "text-left ml-10")}>
        <span>{senderNameDisplay}</span> &middot; <span>{format(new Date(message.timestamp), 'p', { locale: ptBR })}</span>
        {message.sender === 'customer' && message.sentimentScore !== undefined && (
           <SentimentDisplay score={message.sentimentScore} confidence={1} simple small />
        )}
      </div>
    </div>
  );
};

export default SupervisorMessageBubble;
