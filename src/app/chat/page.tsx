'use client';

import { useState } from 'react';
import ChatList from '@/components/chat/chat-list';
import ActiveChatArea from '@/components/chat/active-chat-area';
import { MOCK_CHATS } from '@/lib/mock-data';
import type { Chat } from '@/types';

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [activeChatId, setActiveChatId] = useState<string | null>(MOCK_CHATS[0]?.id || null);

  const activeChat = chats.find(chat => chat.id === activeChatId) || null;

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    // Mark chat as read (example)
    setChats(prevChats => prevChats.map(c => c.id === chatId ? {...c, unreadCount: 0} : c));
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] w-full overflow-hidden"> {/* 4rem is approx header height */}
      <div className="w-full max-w-xs shrink-0 md:w-80 lg:w-96"> {/* Chat list panel */}
        <ChatList
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={handleSelectChat}
        />
      </div>
      <div className="flex-1"> {/* Active chat area */}
        <ActiveChatArea chat={activeChat} />
      </div>
    </div>
  );
}
