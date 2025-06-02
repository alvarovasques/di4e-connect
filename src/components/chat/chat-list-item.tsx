'use client';

import type { Chat } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';

type ChatListItemProps = {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
};

const ChatListItem = ({ chat, isActive, onClick }: ChatListItemProps) => {
  const fallbackName = chat.customerName ? chat.customerName.substring(0, 2).toUpperCase() : '??';
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 p-3 text-left transition-colors duration-150 rounded-lg",
        isActive ? "bg-primary/10" : "hover:bg-muted/50",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <Avatar className="h-10 w-10 border border-border">
        <AvatarImage src={chat.avatarUrl} alt={chat.customerName} data-ai-hint="person avatar" />
        <AvatarFallback className={cn(isActive ? "bg-primary text-primary-foreground" : "bg-muted")}>{fallbackName}</AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className={cn("truncate font-semibold text-sm", isActive ? "text-primary" : "text-foreground")}>{chat.customerName}</h3>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNowStrict(new Date(chat.lastActivity), { addSuffix: true })}
          </span>
        </div>
        <p className={cn("truncate text-xs", isActive ? "text-primary/80" : "text-muted-foreground")}>
          {chat.lastMessagePreview}
        </p>
      </div>
      {chat.unreadCount && chat.unreadCount > 0 && (
        <Badge variant="default" className="flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs bg-accent text-accent-foreground">
          {chat.unreadCount}
        </Badge>
      )}
    </button>
  );
};

export default ChatListItem;
