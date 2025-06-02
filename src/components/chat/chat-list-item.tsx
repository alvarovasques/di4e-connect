
'use client';

import type { Chat } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle } from 'lucide-react'; 

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
        "flex w-full items-start gap-2 sm:gap-3 p-2 sm:p-3 text-left transition-colors duration-150 rounded-lg relative", 
        isActive ? "bg-primary/10" : "hover:bg-muted/50",
        chat.slaBreached && chat.status === 'WAITING' && "border-l-2 sm:border-l-4 border-destructive", // Ajuste na borda para mobile
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border border-border flex-shrink-0 mt-0.5">
        <AvatarImage src={chat.avatarUrl} alt={chat.customerName} data-ai-hint="person avatar" />
        <AvatarFallback className={cn("text-xs sm:text-sm", isActive ? "bg-primary text-primary-foreground" : "bg-muted")}>{fallbackName}</AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden min-w-0"> {/* min-w-0 para ajudar no truncate em flex */}
        <div className="flex items-center justify-between gap-1">
          <h3 className={cn("truncate font-semibold text-sm flex items-center", isActive ? "text-primary" : "text-foreground")}>
            {chat.customerName}
            {chat.slaBreached && chat.status === 'WAITING' && (
              <AlertTriangle className="ml-1 h-3 w-3 sm:h-4 sm:w-4 text-destructive flex-shrink-0" title="SLA Violado" />
            )}
          </h3>
          <span className="text-xs text-muted-foreground shrink-0 ml-1">
            {formatDistanceToNowStrict(new Date(chat.lastActivity), { addSuffix: true, locale: ptBR })}
          </span>
        </div>
        <p className={cn("truncate text-xs", isActive ? "text-primary/80" : "text-muted-foreground")}>
          {chat.lastMessagePreview}
        </p>
      </div>
      {chat.unreadCount && chat.unreadCount > 0 && (
        <Badge variant="default" className="flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full p-0 text-xs bg-accent text-accent-foreground ml-auto shrink-0 self-center">
          {chat.unreadCount}
        </Badge>
      )}
    </button>
  );
};

export default ChatListItem;
