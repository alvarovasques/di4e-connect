'use client';

import type { Message } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import SentimentDisplay from './sentiment-display';

type MessageBubbleProps = {
  message: Message;
  senderUser?: { name: string; avatarUrl?: string }; // For agent/AI
};

const MessageBubble = ({ message, senderUser }: MessageBubbleProps) => {
  const isUser = message.sender !== 'customer';
  const alignClass = isUser ? 'items-end' : 'items-start';
  const bubbleClass = isUser
    ? 'bg-primary text-primary-foreground rounded-br-none'
    : 'bg-muted text-foreground rounded-bl-none';
  
  const senderName = isUser ? (senderUser?.name || message.senderName || 'Agent') : (message.senderName || 'Customer');
  const avatarUrl = isUser ? senderUser?.avatarUrl : undefined; // Assuming customer doesn't have avatar in bubble

  return (
    <div className={cn("flex flex-col gap-1 py-2", alignClass)}>
      <div className={cn("flex items-end gap-2", isUser ? "flex-row-reverse" : "flex-row")}>
        {!isUser && (
           <Avatar className="h-8 w-8 border">
            <AvatarImage src={avatarUrl} data-ai-hint="person avatar" />
            <AvatarFallback className="text-xs bg-muted-foreground/20">
              {senderName.substring(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        <Card className={cn("max-w-xs md:max-w-md lg:max-w-lg p-0 shadow-md", bubbleClass)}>
          <CardContent className="p-3">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </CardContent>
        </Card>
      </div>
      <div className={cn("text-xs text-muted-foreground/80 px-1", isUser ? "text-right" : "text-left ml-10")}>
        <span>{senderName}</span> &middot; <span>{format(new Date(message.timestamp), 'p')}</span>
        {message.sender === 'customer' && message.sentimentScore !== undefined && (
           <SentimentDisplay score={message.sentimentScore} confidence={1} simple small />
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
