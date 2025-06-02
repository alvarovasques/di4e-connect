
'use client';

import type { Message, User } from '@/types';
import { MOCK_CURRENT_USER } from '@/lib/mock-data'; // Import MOCK_CURRENT_USER to check role
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import SentimentDisplay from './sentiment-display';
import { MessageSquareQuote, Ear } from 'lucide-react'; // Added Ear for whisper icon

type MessageBubbleProps = {
  message: Message;
  senderUser?: User; // User object for agent/supervisor
  assignedAgentId?: string | null; // ID of the agent assigned to the chat
};

const MessageBubble = ({ message, senderUser, assignedAgentId }: MessageBubbleProps) => {
  
  // Visibility check for whisper messages
  if (message.type === 'whisper') {
    const isCurrentUserSupervisor = MOCK_CURRENT_USER.userType === 'SUPERVISOR' || MOCK_CURRENT_USER.userType === 'ADMIN';
    const isCurrentUserAssignedAgent = MOCK_CURRENT_USER.id === assignedAgentId;
    const isCurrentUserTheWhisperSender = MOCK_CURRENT_USER.id === message.senderId;

    if (!isCurrentUserSupervisor && !isCurrentUserAssignedAgent && !isCurrentUserTheWhisperSender) {
      return null; // Don't render whisper for others
    }
  }

  const isUser = message.sender !== 'customer';
  const isWhisper = message.type === 'whisper';

  const alignClass = isUser && !isWhisper ? 'items-end' : 'items-start'; // Whispers align left like system messages

  let bubbleClass = '';
  if (isWhisper) {
    bubbleClass = 'bg-yellow-100 border border-yellow-300 text-yellow-900 rounded-lg'; // Whisper specific style
  } else if (isUser) {
    bubbleClass = 'bg-primary text-primary-foreground rounded-br-none';
  } else {
    bubbleClass = 'bg-muted text-foreground rounded-bl-none';
  }
  
  const senderNameDisplay = message.senderName || (isUser ? 'Agente' : 'Cliente');
  const avatarUrl = isUser ? senderUser?.avatarUrl : undefined; // Customer avatar is handled by chat object

  const FallbackAvatarContent = () => {
    if (isWhisper) return <Ear className="h-4 w-4 text-yellow-700" />;
    if (isUser && senderUser) return senderUser.name.substring(0, 1).toUpperCase();
    if (!isUser) return senderNameDisplay.substring(0,1).toUpperCase(); // Customer
    return "S"; // System or unknown
  };


  return (
    <div className={cn("flex flex-col gap-1 py-2", alignClass)}>
      <div className={cn("flex items-end gap-2", (isUser && !isWhisper) ? "flex-row-reverse" : "flex-row")}>
        {(!isUser || isWhisper) && ( // Show avatar for customer messages and whispers
           <Avatar className="h-8 w-8 border">
            <AvatarImage src={isWhisper ? senderUser?.avatarUrl : avatarUrl} data-ai-hint="person avatar" />
            <AvatarFallback className={cn(
                "text-xs", 
                isWhisper ? "bg-yellow-200" : "bg-muted-foreground/20"
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
      <div className={cn("text-xs text-muted-foreground/80 px-1", (isUser && !isWhisper) ? "text-right" : "text-left ml-10")}>
        <span>{senderNameDisplay}</span> &middot; <span>{format(new Date(message.timestamp), 'p', { locale: ptBR })}</span>
        {message.sender === 'customer' && message.sentimentScore !== undefined && (
           <SentimentDisplay score={message.sentimentScore} confidence={1} simple small />
        )}
      </div>
    </div>
  );
};

export default MessageBubble;

