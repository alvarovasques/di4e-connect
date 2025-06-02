
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ChatList from '@/components/chat/chat-list';
import ActiveChatArea from '@/components/chat/active-chat-area';
import { MOCK_CHATS } from '@/lib/mock-data';
import type { Chat } from '@/types';
import { Loader2 } from 'lucide-react';

function ChatPageContent() {
  const searchParams = useSearchParams();
  const queryChatId = searchParams.get('chatId');

  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  // Initialize activeChatId from query param or first chat
  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    if (queryChatId && MOCK_CHATS.some(c => c.id === queryChatId)) {
      return queryChatId;
    }
    return MOCK_CHATS[0]?.id || null;
  });

  const activeChat = chats.find(chat => chat.id === activeChatId) || null;

  // Effect to update activeChatId if queryChatId changes and is valid
  useEffect(() => {
    if (queryChatId && MOCK_CHATS.some(c => c.id === queryChatId)) {
      setActiveChatId(queryChatId);
      // Optionally mark chat as read when opened via query param
      setChats(prevChats => prevChats.map(c => c.id === queryChatId ? {...c, unreadCount: 0} : c));
    }
  }, [queryChatId]);

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    // Mark chat as read
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

export default function ChatPage() {
  return (
    // Suspense is necessary because useSearchParams can only be used in Client Components
    <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <ChatPageContent />
    </Suspense>
  );
}
