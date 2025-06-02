
'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { Chat, Message, User, KnowledgeBaseArticle, Queue, KBItem, MessageType } from '@/types';
import { MOCK_USERS, MOCK_QUEUES, MOCK_KB_ITEMS, MOCK_CURRENT_USER } from '@/lib/mock-data';
import SupervisorMessageBubble from './supervisor-message-bubble';
import SupervisorMessageInputArea from './supervisor-message-input-area';
import SentimentDisplay from '@/components/chat/sentiment-display'; 
import ChatTransferDialog from '@/components/chat/chat-transfer-dialog'; 
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AlertTriangle, BookOpen, Bot, CheckCircle, CornerRightUp, Info, Loader2, MessageSquareQuote, MoreVertical, Send, ShieldCheck, Sparkles, UsersIcon, SlidersHorizontal, Ear } from 'lucide-react';
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type SupervisorActiveChatAreaProps = {
  chat: Chat | null;
};

const SIMULATED_IA_MAE_ANALYSIS = {
  evaluationScore: 82,
  evaluationFeedback: "O agente demonstrou bom conhecimento do produto, mas poderia ser mais proativo em oferecer soluções alternativas. O cliente pareceu satisfeito no final.",
  recommendations: [
    "Sugerir o artigo da BC sobre 'Devoluções' se o cliente mencionar insatisfação com o produto.",
    "Usar uma saudação mais personalizada no início da conversa.",
    "Confirmar a resolução do problema antes de encerrar o chat.",
  ],
};

const SupervisorActiveChatArea = ({ chat: initialChat }: SupervisorActiveChatAreaProps) => {
  const [chat, setChat] = useState<Chat | null>(initialChat);
  const [messages, setMessages] = useState<Message[]>(initialChat?.messages || []);
  const [isLoadingAi, setIsLoadingAi] = useState(false); 
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [supervisorEvaluationScore, setSupervisorEvaluationScore] = useState(SIMULATED_IA_MAE_ANALYSIS.evaluationScore);
  const [supervisorFeedback, setSupervisorFeedback] = useState('');
  const [activeTab, setActiveTab] = useState('ia_eval'); 

  const isSupervisorOrAdmin = MOCK_CURRENT_USER.userType === 'SUPERVISOR' || MOCK_CURRENT_USER.userType === 'ADMIN';
  const canCurrentUserWhisper = isSupervisorOrAdmin || MOCK_CURRENT_USER.id === chat?.assignedTo;


  useEffect(() => {
    setChat(initialChat);
    setMessages(initialChat?.messages || []);
    
    if (initialChat) {
      const lastCustomerMessage = [...initialChat.messages].reverse().find(m => m.sender === 'customer' && m.type !== 'whisper');
      if (lastCustomerMessage && lastCustomerMessage.sentimentScore === undefined) {
        fetchSentiment(lastCustomerMessage);
      } else if (lastCustomerMessage && lastCustomerMessage.sentimentScore !== undefined && chat && !chat.aiAnalysis) {
         setChat(prevChat => prevChat ? {...prevChat, aiAnalysis: {sentimentScore: lastCustomerMessage.sentimentScore!, confidenceIndex: 1 }} : null);
      }
    }
    setSupervisorEvaluationScore(SIMULATED_IA_MAE_ANALYSIS.evaluationScore);
    setSupervisorFeedback('');
    setActiveTab('ia_eval'); 

  }, [initialChat]); 

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages, activeTab]);

  const fetchSentiment = async (messageToAnalyze: Message) => {
    if (!chat) return;
    setIsLoadingAi(true);
    try {
      const sentimentResult = await analyzeSentiment({ text: messageToAnalyze.content });
      setMessages(prevMessages => prevMessages.map(m => 
          m.id === messageToAnalyze.id ? { ...m, sentimentScore: sentimentResult.sentimentScore } : m
      ));
      if (chat) {
          setChat(prevChat => prevChat ? {...prevChat, aiAnalysis: {sentimentScore: sentimentResult.sentimentScore, confidenceIndex: sentimentResult.confidenceIndex}} : null);
      }
    } catch (error) {
      console.error("AI sentiment analysis error:", error);
      toast({ title: "Erro de IA", description: "Não foi possível buscar análise de sentimento.", variant: "destructive" });
    }
    setIsLoadingAi(false);
  };
  
  const handleSendMessage = (content: string, type: MessageType = 'text') => {
    if (!chat || MOCK_CURRENT_USER.id !== chat.assignedTo) {
        toast({title: "Ação não permitida", description: "Assuma o chat para enviar mensagens como agente.", variant: "destructive"});
        return;
    }

    const newMessage: Message = {
      id: `msg_${chat.id}_${Date.now()}`,
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
  };

  const handleSendWhisper = (content: string) => {
    if (!chat || !canCurrentUserWhisper) return;
    const newWhisperMessage: Message = {
      id: `whisper_${chat.id}_${Date.now()}`,
      chatId: chat.id,
      content,
      type: 'whisper',
      sender: 'supervisor', 
      senderId: MOCK_CURRENT_USER.id,
      senderName: `${MOCK_CURRENT_USER.name}`, 
      timestamp: new Date(),
      isFromCustomer: false,
      targetAgentId: chat.assignedTo || undefined, 
    };
    setMessages(prevMessages => [...prevMessages, newWhisperMessage]);
    toast({ title: "Sussurro enviado", description: "Sua nota interna foi enviada para o agente." });
  };


  const handleTransferChatSubmit = (targetType: 'queue' | 'agent', targetId: string) => {
    const targetTypePt = targetType === 'queue' ? 'fila' : 'agente';
    toast({
      title: "Transferência de Chat Iniciada (Simulação)",
      description: `Chat transferido para ${targetTypePt} ID: ${targetId}.`,
    });
    if(chat) setChat(prev => prev ? {...prev, status: 'TRANSFERRED', assignedTo: targetType === 'agent' ? targetId : null} : null);
  };
  
  const handleAssumeChat = () => {
    if (!chat) return;
    setChat(prev => prev ? {...prev, assignedTo: MOCK_CURRENT_USER.id, status: 'IN_PROGRESS'} : null);
    toast({
      title: "Chat Assumido",
      description: `Supervisor ${MOCK_CURRENT_USER.name} assumiu o chat ID: ${chat.id}. Agora você pode responder como agente.`,
    });
  };

  const handleResolveChat = () => {
     if (!chat) return;
    setChat(prev => prev ? {...prev, status: 'RESOLVED'} : null);
    toast({
      title: "Chat Resolvido (Simulação)",
      description: `Chat ID: ${chat.id} marcado como resolvido.`,
    });
  }

  const handleSaveSupervisorEvaluation = () => {
    if(!chat) return;
    toast({
      title: "Avaliação do Supervisor Salva (Simulação)",
      description: `Avaliação para o chat ${chat.id}: Score ${supervisorEvaluationScore}, Feedback: "${supervisorFeedback || 'N/A'}"`,
    });
  };
  

  if (!chat) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-muted/30 p-8">
        <MessageSquareQuote className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <p className="text-lg text-muted-foreground">Nenhum chat selecionado ou chat não encontrado.</p>
      </div>
    );
  }

  const assignedAgent = MOCK_USERS.find(u => u.id === chat.assignedTo);
  const isCurrentUserAssigned = MOCK_CURRENT_USER.id === chat.assignedTo;

  return (
    <div className="flex h-full max-h-screen">
      <div className="flex flex-1 flex-col bg-background">
        <header className="flex items-center justify-between border-b p-3 gap-2 md:p-4">
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
            <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border flex-shrink-0">
              <AvatarImage src={chat.avatarUrl} alt={chat.customerName} data-ai-hint="person avatar"/>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {chat.customerName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <h2 className="font-semibold text-foreground truncate">{chat.customerName}</h2>
              <p className="text-xs text-muted-foreground truncate">
                {chat.status === 'IN_PROGRESS' && assignedAgent ? `Conversando com ${assignedAgent.name}` : chat.status}
                {isCurrentUserAssigned && MOCK_CURRENT_USER.userType === 'SUPERVISOR' && " (Você está atribuído)"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
             {chat.aiAnalysis && (
                <SentimentDisplay score={chat.aiAnalysis.sentimentScore} confidence={chat.aiAnalysis.confidenceIndex} simple />
             )}
            {isSupervisorOrAdmin && (
              <>
                <ChatTransferDialog 
                    queues={MOCK_QUEUES.filter(q => q.isActive)} 
                    agents={MOCK_USERS.filter(u => u.userType === "AGENT_HUMAN")} 
                    onTransfer={handleTransferChatSubmit} 
                />
                {!isCurrentUserAssigned && (
                  <Button variant="outline" size="sm" onClick={handleAssumeChat} title="Assumir Chat">
                      <CornerRightUp className="h-4 w-4 md:mr-1" /><span className="hidden md:inline">Assumir</span>
                  </Button>
                )}
                 <Button variant="outline" size="sm" onClick={handleResolveChat} title="Resolver Chat" className="text-green-600 hover:text-green-700 border-green-600 hover:border-green-700">
                    <CheckCircle className="h-4 w-4 md:mr-1" /><span className="hidden md:inline">Resolver</span>
                </Button>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9"><MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Ver Informações de Contato</DropdownMenuItem>
                <DropdownMenuItem>Bloquear Usuário</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive">Encerrar Chat (Forçado)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <ScrollArea className="flex-1 p-3 md:p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <SupervisorMessageBubble 
                key={msg.id} 
                message={msg} 
                senderUser={MOCK_USERS.find(u => u.id === msg.senderId)}
                assignedAgentId={chat.assignedTo}
              />
            ))}
            {isLoadingAi && <div className="flex justify-center py-2"><Loader2 className="h-5 w-5 animate-spin text-primary"/></div>}
          </div>
        </ScrollArea>

        <SupervisorMessageInputArea 
            onSendMessage={handleSendMessage} 
            onSendWhisper={handleSendWhisper}
            disabled={chat.status === 'RESOLVED' || chat.status === 'CLOSED' || (!isCurrentUserAssigned && isSupervisorOrAdmin)}
            canWhisper={canCurrentUserWhisper}
            isAssigned={isCurrentUserAssigned}
        />
      </div>
      
      {isSupervisorOrAdmin && (
        <aside className="hidden lg:flex w-80 flex-col border-l bg-muted/20">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
              <TabsTrigger value="details" className="text-xs px-1 py-2.5"><Info className="h-3 w-3 sm:h-4 sm:w-4 mr-1"/><span className="hidden sm:inline">Detalhes</span></TabsTrigger>
              <TabsTrigger value="notes" className="text-xs px-1 py-2.5"><MessageSquareQuote className="h-3 w-3 sm:h-4 sm:w-4 mr-1"/><span className="hidden sm:inline">Notas</span></TabsTrigger>
              <TabsTrigger value="ia_eval" className="text-xs px-1 py-2.5"><Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1"/><span className="hidden sm:inline">Análise IA</span></TabsTrigger>
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
                      <CardHeader><CardTitle className="text-base">Sentimento (Cliente)</CardTitle></CardHeader>
                      <CardContent>
                        <SentimentDisplay score={chat.aiAnalysis.sentimentScore} confidence={chat.aiAnalysis.confidenceIndex} />
                      </CardContent>
                    </Card>
                   )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="notes" className="flex-1 overflow-y-auto p-0">
                 <ScrollArea className="h-full">
                    <div className="p-4">
                        <p className="text-sm text-muted-foreground text-center py-4">
                        Notas internas (sussurros) são exibidas inline na conversa. Esta área pode ser usada para outras anotações do supervisor.
                        </p>
                         <Textarea placeholder="Suas anotações privadas sobre este chat..." className="mt-2 min-h-[100px]" />
                         <Button variant="outline" size="sm" className="mt-2 w-full">Salvar Anotação</Button>
                    </div>
                 </ScrollArea>
            </TabsContent>
            
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
          </Tabs>
        </aside>
      )}
    </div>
  );
};

export default SupervisorActiveChatArea;
