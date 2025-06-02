
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SupervisorActiveChatArea from '@/components/supervisor/chat/supervisor-active-chat-area';
import { MOCK_CHATS } from '@/lib/mock-data';
import type { Chat } from '@/types';
import { Loader2 } from 'lucide-react';

export default function SupervisorChatPage() {
  const params = useParams();
  const chatId = params.chatId as string;

  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (chatId) {
      const foundChat = MOCK_CHATS.find(c => c.id === chatId) || null;
      setChat(foundChat);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [chatId]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <p className="text-xl text-muted-foreground">Chat não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] w-full overflow-hidden">
      <SupervisorActiveChatArea chat={chat} />
    </div>
  );
}
