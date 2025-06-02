'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Chat, Message, User, KnowledgeBaseArticle, WhisperNote, Queue } from '@/types';
import { MOCK_USERS, MOCK_QUEUES, MOCK_KB_ARTICLES, MOCK_WHISPER_NOTES, MOCK_CURRENT_USER } from '@/lib/mock-data';
import MessageBubble from './message-bubble';
import MessageInputArea from './message-input-area';
import WhisperNoteInput from './whisper-note-input';
import KnowledgeBaseSuggestionItem from './knowledge-base-suggestion-item';
import SentimentDisplay from './sentiment-display';
import ChatTransferDialog from './chat-transfer-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AlertTriangle, BookOpen, Bot, Info, Loader2, MessageSquareQuote, MoreVertical, Phone, Video, UsersIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { analyzeSentiment } from '@/ai/flows/sentiment-analysis';
import { suggestKnowledgeBaseArticles } from '@/ai/flows/knowledge-base-suggestions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

type ActiveChatAreaProps = {
  chat: Chat | null;
};

const ActiveChatArea = ({ chat: initialChat }: ActiveChatAreaProps) => {
  const [chat, setChat] = useState<Chat | null>(initialChat);
  const [messages, setMessages] = useState<Message[]>(initialChat?.messages || []);
  const [whisperNotes, setWhisperNotes] = useState<WhisperNote[]>(MOCK_WHISPER_NOTES.filter(note => note.chatId === initialChat?.id));
  const [suggestedArticles, setSuggestedArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setChat(initialChat);
    setMessages(initialChat?.messages || []);
    setWhisperNotes(MOCK_WHISPER_NOTES.filter(note => note.chatId === initialChat?.id));
    if (initialChat) {
      fetchAiSuggestions(initialChat.messages);
    } else {
      setSuggestedArticles([]);
    }
  }, [initialChat]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);

  const fetchAiSuggestions = async (currentMessages: Message[]) => {
    if (!chat || currentMessages.length === 0) return;
    setIsLoadingAi(true);
    try {
      const chatContent = currentMessages.map(m => `${m.sender}: ${m.content}`).join('\n');
      
      // Fetch KB suggestions
      const kbSuggestions = await suggestKnowledgeBaseArticles({
        chatContent,
        knowledgeBaseArticles: MOCK_KB_ARTICLES,
      });
      setSuggestedArticles(kbSuggestions.map(s => ({
        ...MOCK_KB_ARTICLES.find(kb => kb.id === s.id)!,
        relevanceScore: s.relevanceScore,
      })).slice(0, 3)); // Take top 3

      // Analyze sentiment of last customer message
      const lastCustomerMessage = [...currentMessages].reverse().find(m => m.sender === 'customer');
      if (lastCustomerMessage) {
        const sentimentResult = await analyzeSentiment({ text: lastCustomerMessage.content });
        // Update message with sentiment or display globally for chat
        setMessages(prevMessages => prevMessages.map(m => 
            m.id === lastCustomerMessage.id ? { ...m, sentimentScore: sentimentResult.sentimentScore } : m
        ));
        if (chat) {
            setChat(prevChat => prevChat ? {...prevChat, aiAnalysis: {sentimentScore: sentimentResult.sentimentScore, confidenceIndex: sentimentResult.confidenceIndex}} : null);
        }
      }

    } catch (error) {
      console.error("AI suggestion error:", error);
      toast({ title: "AI Error", description: "Could not fetch AI suggestions.", variant: "destructive" });
    }
    setIsLoadingAi(false);
  };
  
  const handleSendMessage = (content: string, type: 'text') => {
    if (!chat) return;
    const newMessage: Message = {
      id: `msg_${chat.id}_${messages.length + 1}`,
      chatId: chat.id,
      content,
      type,
      sender: 'agent', // Assuming current user is an agent
      senderId: MOCK_CURRENT_USER.id,
      senderName: MOCK_CURRENT_USER.name,
      timestamp: new Date(),
      isFromCustomer: false,
    };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    fetchAiSuggestions(updatedMessages); // Re-fetch suggestions on new message
  };

  const handleSendWhisperNote = (note: string) => {
    if (!chat) return;
    const newWhisperNote: WhisperNote = {
      id: `whisper_${whisperNotes.length + 1}`,
      chatId: chat.id,
      userId: MOCK_CURRENT_USER.id,
      userName: MOCK_CURRENT_USER.name,
      note,
      timestamp: new Date(),
    };
    setWhisperNotes([...whisperNotes, newWhisperNote]);
    toast({ title: "Whisper note sent", description: "Your internal note has been added." });
  };

  const handleTransferChat = (targetType: 'queue' | 'agent', targetId: string) => {
    toast({
      title: "Chat Transfer Initiated",
      description: `Chat transfer to ${targetType} ID: ${targetId} has been requested.`,
    });
    // Implement actual transfer logic here
  };
  
  const handleSelectKbArticle = (article: KnowledgeBaseArticle) => {
    toast({
      title: `Selected KB: ${article.title}`,
      description: "Article details would be shown or content pasted.",
    });
  };

  if (!chat) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-muted/30 p-8">
        <MessageSquareQuote className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <p className="text-lg text-muted-foreground">Select a chat to start messaging</p>
        <p className="text-sm text-muted-foreground/80">Your conversations will appear here.</p>
      </div>
    );
  }

  const assignedAgent = MOCK_USERS.find(u => u.id === chat.assignedTo);

  return (
    <div className="flex h-full max-h-screen">
      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col bg-background">
        {/* Chat Header */}
        <header className="flex items-center justify-between border-b p-3 md:p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={chat.avatarUrl} alt={chat.customerName} data-ai-hint="person avatar"/>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {chat.customerName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-foreground">{chat.customerName}</h2>
              <p className="text-xs text-muted-foreground">
                {chat.status === 'IN_PROGRESS' && assignedAgent ? `Chatting with ${assignedAgent.name}` : chat.status}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             {chat.aiAnalysis && (
                <SentimentDisplay score={chat.aiAnalysis.sentimentScore} confidence={chat.aiAnalysis.confidenceIndex} simple />
             )}
            <Button variant="ghost" size="icon"><Phone className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><Video className="h-5 w-5" /></Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Contact Info</DropdownMenuItem>
                <DropdownMenuItem>Block User</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <ChatTransferDialog 
                        queues={MOCK_QUEUES} 
                        agents={MOCK_USERS.filter(u => u.userType === "AGENT_HUMAN")} 
                        onTransfer={handleTransferChat} 
                    />
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive">End Chat</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-3 md:p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} senderUser={MOCK_USERS.find(u => u.id === msg.senderId)} />
            ))}
            {isLoadingAi && <div className="flex justify-center py-2"><Loader2 className="h-5 w-5 animate-spin text-primary"/></div>}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <MessageInputArea onSendMessage={handleSendMessage} disabled={chat.status === 'RESOLVED' || chat.status === 'CLOSED'} />
      </div>
      
      {/* Sidebar for Details, Notes, KB - only for Supervisor/Agent */}
      {(MOCK_CURRENT_USER.userType === 'SUPERVISOR' || MOCK_CURRENT_USER.userType === 'AGENT_HUMAN') && (
        <aside className="hidden lg:flex w-80 flex-col border-l bg-muted/20">
          <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
              <TabsTrigger value="details"><Info className="h-4 w-4"/> Details</TabsTrigger>
              <TabsTrigger value="notes"><MessageSquareQuote className="h-4 w-4"/> Notes</TabsTrigger>
              <TabsTrigger value="kb"><BookOpen className="h-4 w-4"/> KB</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="flex-1 overflow-y-auto p-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Customer Details</CardTitle></CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p><strong>Name:</strong> {chat.customerName}</p>
                      <p><strong>Phone:</strong> {chat.customerPhone}</p>
                      <p><strong>Queue:</strong> {MOCK_QUEUES.find(q => q.id === chat.queueId)?.name || 'N/A'}</p>
                      <p><strong>Priority:</strong> <span className={`font-semibold ${chat.priority === 'HIGH' || chat.priority === 'URGENT' ? 'text-destructive' : ''}`}>{chat.priority}</span></p>
                    </CardContent>
                  </Card>
                   {chat.aiAnalysis && (
                    <Card>
                      <CardHeader><CardTitle className="text-base">AI Analysis</CardTitle></CardHeader>
                      <CardContent>
                        <SentimentDisplay score={chat.aiAnalysis.sentimentScore} confidence={chat.aiAnalysis.confidenceIndex} />
                      </CardContent>
                    </Card>
                   )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="notes" className="flex-1 flex flex-col overflow-hidden">
              <ScrollArea className="flex-1 p-4 space-y-3">
                {whisperNotes.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No internal notes yet.</p>}
                {whisperNotes.map(note => (
                  <div key={note.id} className="text-xs p-2 rounded bg-yellow-100 border border-yellow-200 text-yellow-800">
                    <p className="font-semibold">{note.userName} ({format(new Date(note.timestamp), 'PPp')})</p>
                    <p>{note.note}</p>
                  </div>
                ))}
              </ScrollArea>
              {MOCK_CURRENT_USER.userType === 'SUPERVISOR' && (
                <WhisperNoteInput onSendWhisperNote={handleSendWhisperNote} />
              )}
            </TabsContent>
            
            <TabsContent value="kb" className="flex-1 overflow-y-auto p-0">
               <ScrollArea className="h-full p-4 space-y-3">
                {isLoadingAi && !suggestedArticles.length && <div className="flex justify-center py-2"><Loader2 className="h-5 w-5 animate-spin text-primary"/></div>}
                {!isLoadingAi && suggestedArticles.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No relevant articles found.</p>}
                {suggestedArticles.map(article => (
                  <KnowledgeBaseSuggestionItem key={article.id} article={article} onSelectArticle={handleSelectKbArticle} />
                ))}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </aside>
      )}
    </div>
  );
};

export default ActiveChatArea;
