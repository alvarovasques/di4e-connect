'use client';

import type { Chat } from '@/types';
import ChatListItem from './chat-list-item';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';

type ChatListProps = {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
};

const ChatList = ({ chats, activeChatId, onSelectChat }: ChatListProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChats = chats.filter(chat => 
    chat.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (chat.lastMessagePreview && chat.lastMessagePreview.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex h-full flex-col border-r bg-background">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search chats..." 
            className="pl-8 w-full rounded-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <nav className="space-y-1 p-2">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === activeChatId}
                onClick={() => onSelectChat(chat.id)}
              />
            ))
          ) : (
            <p className="p-4 text-center text-sm text-muted-foreground">No chats found.</p>
          )}
        </nav>
      </ScrollArea>
    </div>
  );
};

export default ChatList;
