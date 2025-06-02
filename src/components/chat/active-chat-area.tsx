
'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Chat, Message, User, KnowledgeBaseArticle, WhisperNote, Queue, KBItem } from '@/types';
import { MOCK_USERS, MOCK_QUEUES, MOCK_KB_ITEMS, MOCK_WHISPER_NOTES, MOCK_CURRENT_USER } from '@/lib/mock-data';
import MessageBubble from './message-bubble';
import MessageInputArea from './message-input-area';
import WhisperNoteInput from './whisper-note-input';
import KnowledgeBaseSuggestionItem from './knowledge-base-suggestion-item';
import SentimentDisplay from './sentiment-display';
import ChatTransferDialog from './chat-transfer-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AlertTriangle, BookOpen, Bot, CheckCircle, CornerRightUp, Info, Loader2, MessageSquareQuote, MoreVertical, Phone, Send, ShieldCheck, Sparkles, Video, UsersIcon, SlidersHorizontal } from 'lucide-react';
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Slider } from '../ui/slider';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSearchParams } from 'next/navigation';

type ActiveChatAreaProps = {
  chat: Chat | null;
};

// Simulated data for IA Mãe
const SIMULATED_IA_MAE_ANALYSIS = {
  evaluationScore: 82,
  evaluationFeedback: "O agente demonstrou bom conhecimento do produto, mas poderia ser mais proativo em oferecer soluções alternativas. O cliente pareceu satisfeito no final.",
  recommendations: [
    "Sugerir o artigo da BC sobre 'Devoluções' se o cliente mencionar insatisfação com o produto.",
    "Usar uma saudação mais personalizada no início da conversa.",
    "Confirmar a resolução do problema antes de encerrar o chat.",
  ],
};

const ActiveChatArea = ({ chat: initialChat }: ActiveChatAreaProps) => {
  const searchParams = useSearchParams();
  const initialAction = searchParams.get('action');

  const [chat, setChat] = useState<Chat | null>(initialChat);
  const [messages, setMessages] = useState<Message[]>(initialChat?.messages || []);
  const [whisperNotes, setWhisperNotes] = useState<WhisperNote[]>(MOCK_WHISPER_NOTES.filter(note => note.chatId === initialChat?.id));
  const [suggestedArticles, setSuggestedArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [supervisorEvaluationScore, setSupervisorEvaluationScore] = useState(SIMULATED_IA_MAE_ANALYSIS.evaluationScore);
  const [supervisorFeedback, setSupervisorFeedback] = useState('');
  const [activeTab, setActiveTab] = useState(initialAction === 'whisper' ? 'notes' : 'details');

  const isSupervisor = MOCK_CURRENT_USER.userType === 'SUPERVISOR' || MOCK_CURRENT_USER.userType === 'ADMIN';


  useEffect(() => {
    setChat(initialChat);
    setMessages(initialChat?.messages || []);
    setWhisperNotes(MOCK_WHISPER_NOTES.filter(note => note.chatId === initialChat?.id));
    if (initialChat) {
      fetchAiSuggestions(initialChat.messages);
    } else {
      setSuggestedArticles([]);
    }
    // Reset supervisor eval if chat changes
    setSupervisorEvaluationScore(SIMULATED_IA_MAE_ANALYSIS.evaluationScore);
    setSupervisorFeedback('');
    // Set active tab based on query param or default
    setActiveTab(initialAction === 'whisper' && initialChat?.id === searchParams.get('chatId') ? 'notes' : 'details');

  }, [initialChat, initialAction, searchParams]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages, activeTab]);

  const fetchAiSuggestions = async (currentMessages: Message[]) => {
    if (!chat || currentMessages.length === 0) return;
    setIsLoadingAi(true);
    try {
      const chatContent = currentMessages.map(m => `${m.sender}: ${m.content}`).join('\n');
      
      const textBasedKbItemsForGenkit = MOCK_KB_ITEMS.filter(item =>
        item.type === 'file' &&
        (item.mimeType === 'text/markdown' || item.mimeType === 'text/plain' || (item.content && item.content.trim() !== ''))
      ).map(item => ({
        id: item.id,
        title: item.name,
        content: item.content || item.summary || '', 
      }));

      const kbSuggestions = await suggestKnowledgeBaseArticles({
        chatContent,
        knowledgeBaseArticles: textBasedKbItemsForGenkit,
      });
      
      setSuggestedArticles(kbSuggestions.map(s => {
        const originalItem = MOCK_KB_ITEMS.find(kb => kb.id === s.id) as KBItem | undefined;
        return {
          id: s.id,
          title: originalItem?.name || s.title || 'Artigo Desconhecido',
          content: originalItem?.content || '',
          summary: originalItem?.summary,
          relevanceScore: s.relevanceScore,
          tags: originalItem?.tags,
        };
      }).slice(0, 3)); 

      const lastCustomerMessage = [...currentMessages].reverse().find(m => m.sender === 'customer');
      if (lastCustomerMessage) {
        const sentimentResult = await analyzeSentiment({ text: lastCustomerMessage.content });
        setMessages(prevMessages => prevMessages.map(m => 
            m.id === lastCustomerMessage.id ? { ...m, sentimentScore: sentimentResult.sentimentScore } : m
        ));
        if (chat) {
            setChat(prevChat => prevChat ? {...prevChat, aiAnalysis: {sentimentScore: sentimentResult.sentimentScore, confidenceIndex: sentimentResult.confidenceIndex}} : null);
        }
      }

    } catch (error) {
      console.error("AI suggestion error:", error);
      toast({ title: "Erro de IA", description: "Não foi possível buscar sugestões da IA.", variant: "destructive" });
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
      sender: 'agent', 
      senderId: MOCK_CURRENT_USER.id,
      senderName: MOCK_CURRENT_USER.name,
      timestamp: new Date(),
      isFromCustomer: false,
    };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    fetchAiSuggestions(updatedMessages); 
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
    toast({ title: "Nota interna enviada", description: "Sua nota interna foi adicionada." });
  };

  const handleTransferChatSubmit = (targetType: 'queue' | 'agent', targetId: string) => {
    const targetTypePt = targetType === 'queue' ? 'fila' : 'agente';
    toast({
      title: "Transferência de Chat Iniciada (Simulação)",
      description: `Chat transferido para ${targetTypePt} ID: ${targetId}.`,
    });
    // Lógica de atualização do chat (ex: status, assignedTo) aqui em um app real
    if(chat) setChat(prev => prev ? {...prev, status: 'TRANSFERRED', assignedTo: targetType === 'agent' ? targetId : null} : null);
  };
  
  const handleAssumeChat = () => {
    if (!chat) return;
    toast({
      title: "Chat Assumido (Simulação)",
      description: `Supervisor ${MOCK_CURRENT_USER.name} assumiu o chat ID: ${chat.id}.`,
    });
    // Lógica de atualização do chat (ex: assignedTo = MOCK_CURRENT_USER.id) aqui
     if(chat) setChat(prev => prev ? {...prev, assignedTo: MOCK_CURRENT_USER.id, status: 'IN_PROGRESS'} : null);
  };

  const handleResolveChat = () => {
     if (!chat) return;
    toast({
      title: "Chat Resolvido (Simulação)",
      description: `Chat ID: ${chat.id} marcado como resolvido.`,
    });
     if(chat) setChat(prev => prev ? {...prev, status: 'RESOLVED'} : null);
  }

  const handleSaveSupervisorEvaluation = () => {
    if(!chat) return;
    toast({
      title: "Avaliação do Supervisor Salva (Simulação)",
      description: `Avaliação para o chat ${chat.id}: Score ${supervisorEvaluationScore}, Feedback: "${supervisorFeedback || 'N/A'}"`,
    });
  };
  
  const handleSelectKbArticle = (article: KnowledgeBaseArticle) => {
    toast({
      title: `BC Selecionado: ${article.title}`,
      description: "Detalhes do artigo seriam mostrados ou conteúdo colado.",
    });
  };

  if (!chat) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-muted/30 p-8">
        <MessageSquareQuote className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <p className="text-lg text-muted-foreground">Selecione um chat para começar a conversar</p>
        <p className="text-sm text-muted-foreground/80">Suas conversas aparecerão aqui.</p>
      </div>
    );
  }

  const assignedAgent = MOCK_USERS.find(u => u.id === chat.assignedTo);

  return (
    <div className="flex h-full max-h-screen">
      <div className="flex flex-1 flex-col bg-background">
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
                {chat.status === 'IN_PROGRESS' && assignedAgent ? `Conversando com ${assignedAgent.name}` : chat.status}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
             {chat.aiAnalysis && (
                <SentimentDisplay score={chat.aiAnalysis.sentimentScore} confidence={chat.aiAnalysis.confidenceIndex} simple />
             )}
            {isSupervisor && (
              <>
                <ChatTransferDialog 
                    queues={MOCK_QUEUES} 
                    agents={MOCK_USERS.filter(u => u.userType === "AGENT_HUMAN")} 
                    onTransfer={handleTransferChatSubmit} 
                />
                <Button variant="outline" size="sm" onClick={handleAssumeChat} title="Assumir Chat">
                    <CornerRightUp className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Assumir</span>
                </Button>
                 <Button variant="outline" size="sm" onClick={handleResolveChat} title="Resolver Chat" className="text-green-600 hover:text-green-700 border-green-600 hover:border-green-700">
                    <CheckCircle className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Resolver</span>
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex"><Phone className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="hidden sm:inline-flex"><Video className="h-5 w-5" /></Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Ver Informações de Contato</DropdownMenuItem>
                <DropdownMenuItem>Bloquear Usuário</DropdownMenuItem>
                {!isSupervisor && <DropdownMenuSeparator />}
                 {!isSupervisor && (
                    <DropdownMenuItem>
                        <ChatTransferDialog 
                            queues={MOCK_QUEUES} 
                            agents={MOCK_USERS.filter(u => u.userType === "AGENT_HUMAN")} 
                            onTransfer={handleTransferChatSubmit} 
                        />
                    </DropdownMenuItem>
                 )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive">Encerrar Chat (Forçado)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <ScrollArea className="flex-1 p-3 md:p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} senderUser={MOCK_USERS.find(u => u.id === msg.senderId)} />
            ))}
            {isLoadingAi && <div className="flex justify-center py-2"><Loader2 className="h-5 w-5 animate-spin text-primary"/></div>}
          </div>
        </ScrollArea>

        <MessageInputArea onSendMessage={handleSendMessage} disabled={chat.status === 'RESOLVED' || chat.status === 'CLOSED'} />
      </div>
      
      {(MOCK_CURRENT_USER.userType === 'SUPERVISOR' || MOCK_CURRENT_USER.userType === 'AGENT_HUMAN') && (
        <aside className="hidden lg:flex w-80 flex-col border-l bg-muted/20">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
              <TabsTrigger value="details" className="text-xs px-1"><Info className="h-4 w-4"/> Detalhes</TabsTrigger>
              <TabsTrigger value="notes" className="text-xs px-1"><MessageSquareQuote className="h-4 w-4"/> Notas</TabsTrigger>
              {isSupervisor ? (
                <TabsTrigger value="ia_eval" className="text-xs px-1"><Sparkles className="h-4 w-4"/> Análise IA</TabsTrigger>
              ) : (
                <TabsTrigger value="kb" className="text-xs px-1"><BookOpen className="h-4 w-4"/> BC</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="details" className="flex-1 overflow-y-auto p-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <Card>
                    <CardHeader><CardTitle className="text-base">Detalhes do Cliente</CardTitle></CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p><strong>Nome:</strong> {chat.customerName}</p>
                      <p><strong>Telefone:</strong> {chat.customerPhone}</p>
                      <p><strong>Fila:</strong> {MOCK_QUEUES.find(q => q.id === chat.queueId)?.name || 'N/D'}</p>
                      <p><strong>Prioridade:</strong> <span className={`font-semibold ${chat.priority === 'HIGH' || chat.priority === 'URGENT' ? 'text-destructive' : ''}`}>{chat.priority}</span></p>
                       <p><strong>Status:</strong> {chat.status}</p>
                       <p><strong>Agente:</strong> {assignedAgent?.name || "Não atribuído"}</p>
                    </CardContent>
                  </Card>
                   {chat.aiAnalysis && (
                    <Card>
                      <CardHeader><CardTitle className="text-base">Sentimento (IA)</CardTitle></CardHeader>
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
                {whisperNotes.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma nota interna ainda.</p>}
                {whisperNotes.map(note => (
                  <div key={note.id} className="text-xs p-2 rounded bg-yellow-100 border border-yellow-200 text-yellow-800">
                    <p className="font-semibold">{note.userName} ({format(new Date(note.timestamp), 'Pp', { locale: ptBR })})</p> {/* Formato mais curto */}
                    <p>{note.note}</p>
                  </div>
                ))}
              </ScrollArea>
              {(isSupervisor || MOCK_CURRENT_USER.id === chat.assignedTo) && ( // Supervisor ou agente atribuído pode sussurrar
                <WhisperNoteInput onSendWhisperNote={handleSendWhisperNote} />
              )}
            </TabsContent>
            
            {isSupervisor && (
              <TabsContent value="ia_eval" className="flex-1 overflow-y-auto p-0">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center"><Sparkles className="h-4 w-4 mr-2 text-primary"/> Avaliação da IA Mãe</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm space-y-2">
                        <p><strong>Score IA:</strong> <span className="font-bold text-primary">{SIMULATED_IA_MAE_ANALYSIS.evaluationScore}/100</span></p>
                        <p className="text-muted-foreground">{SIMULATED_IA_MAE_ANALYSIS.evaluationFeedback}</p>
                        <h4 className="font-semibold mt-3 text-foreground">Recomendações da IA:</h4>
                        <ul className="list-disc list-inside text-muted-foreground space-y-1">
                          {SIMULATED_IA_MAE_ANALYSIS.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                        </ul>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center"><SlidersHorizontal className="h-4 w-4 mr-2 text-accent"/> Avaliação Manual do Supervisor</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label htmlFor="supervisor-score" className="text-sm">Score Supervisor: <span className="font-bold text-accent">{supervisorEvaluationScore}/100</span></Label>
                          <Slider
                            id="supervisor-score"
                            min={0} max={100} step={1}
                            defaultValue={[supervisorEvaluationScore]}
                            onValueChange={(value) => setSupervisorEvaluationScore(value[0])}
                            className="my-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="supervisor-feedback" className="text-sm">Feedback Adicional:</Label>
                          <Textarea
                            id="supervisor-feedback"
                            placeholder="Seu feedback sobre o atendimento..."
                            value={supervisorFeedback}
                            onChange={(e) => setSupervisorFeedback(e.target.value)}
                            className="mt-1 min-h-[80px]"
                          />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button size="sm" onClick={handleSaveSupervisorEvaluation} className="w-full bg-accent hover:bg-accent/90">
                          <Send className="mr-2 h-4 w-4"/> Salvar Avaliação Manual
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </ScrollArea>
              </TabsContent>
            )}

            {!isSupervisor && (
              <TabsContent value="kb" className="flex-1 overflow-y-auto p-0">
                <ScrollArea className="h-full p-4 space-y-3">
                  {isLoadingAi && !suggestedArticles.length && <div className="flex justify-center py-2"><Loader2 className="h-5 w-5 animate-spin text-primary"/></div>}
                  {!isLoadingAi && suggestedArticles.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum artigo relevante encontrado.</p>}
                  {suggestedArticles.map(article => (
                    <KnowledgeBaseSuggestionItem key={article.id} article={article} onSelectArticle={handleSelectKbArticle} />
                  ))}
                </ScrollArea>
              </TabsContent>
            )}
          </Tabs>
        </aside>
      )}
    </div>
  );
};

export default ActiveChatArea;
