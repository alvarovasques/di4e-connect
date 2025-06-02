
'use client';

import React, { useEffect, useRef, useState, FormEvent } from 'react';
import type { Chat, Message, User, KnowledgeBaseArticle, Queue, KBItem, MessageType, OracleQueryInput, OracleQueryOutput } from '@/types';
// import { MOCK_USERS, MOCK_QUEUES, MOCK_KB_ITEMS, MOCK_CURRENT_USER } from '@/lib/mock-data'; // Usar server-memory-store
import { MOCK_USERS, MOCK_QUEUES, MOCK_KB_ITEMS, MOCK_CURRENT_USER } from '@/lib/server-memory-store';
import SupervisorMessageBubble from './supervisor-message-bubble';
import SupervisorMessageInputArea from './supervisor-message-input-area';
import SentimentDisplay from '@/components/chat/sentiment-display'; 
import ChatTransferDialog from '@/components/chat/chat-transfer-dialog'; 
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AlertTriangle, BookOpen, Bot, CheckCircle, CornerRightUp, Info, Loader2, MessageSquareQuote, MoreVertical, Send, ShieldCheck, Sparkles, UsersIcon, SlidersHorizontal, Ear, Play, SendHorizonal, HelpCircle } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { 
  getChatDetailsServerAction, 
  sendChatMessageServerAction,
  assignChatToServerAction,
  updateChatStatusServerAction
} from '@/app/actions/chatActions';

type SupervisorActiveChatAreaProps = {
  chat: Chat | null; // O chat inicial passado como prop
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

const SupervisorActiveChatArea = ({ chat: initialChatProp }: SupervisorActiveChatAreaProps) => {
  const [currentChat, setCurrentChat] = useState<Chat | null>(initialChatProp);
  const [messages, setMessages] = useState<Message[]>(initialChatProp?.messages || []);
  const [isLoadingAi, setIsLoadingAi] = useState(false); 
  const [isLoadingChatDetails, setIsLoadingChatDetails] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [supervisorEvaluationScore, setSupervisorEvaluationScore] = useState(SIMULATED_IA_MAE_ANALYSIS.evaluationScore);
  const [supervisorFeedback, setSupervisorFeedback] = useState('');
  const [activeTab, setActiveTab] = useState('ia_eval'); 

  const currentUser = MOCK_CURRENT_USER;
  const isSupervisorOrAdmin = currentUser.userType === 'SUPERVISOR' || currentUser.userType === 'ADMIN';
  const canCurrentUserWhisper = isSupervisorOrAdmin || currentUser.id === currentChat?.assignedTo;
  const isCurrentUserAssigned = currentUser.id === currentChat?.assignedTo;


  useEffect(() => {
    const loadChatDetails = async (chatId: string) => {
      setIsLoadingChatDetails(true);
      try {
        const chatDetails = await getChatDetailsServerAction(chatId);
        setCurrentChat(chatDetails);
        setMessages(chatDetails?.messages || []);
        
        if (chatDetails) {
            const lastCustomerMessage = [...chatDetails.messages].reverse().find(m => m.sender === 'customer' && m.type !== 'whisper');
            if (lastCustomerMessage && lastCustomerMessage.sentimentScore === undefined) {
                fetchSentiment(lastCustomerMessage, chatId); // Pass chatId
            } else if (lastCustomerMessage && lastCustomerMessage.sentimentScore !== undefined && !chatDetails.aiAnalysis) {
                setCurrentChat(prevChat => prevChat ? {...prevChat, aiAnalysis: {sentimentScore: lastCustomerMessage.sentimentScore!, confidenceIndex: 1 }} : null);
            }
        }
      } catch (error) {
        console.error("Error loading chat details for supervisor:", error);
        toast({ title: "Erro ao carregar chat", description: "Não foi possível buscar os detalhes do chat.", variant: "destructive" });
      }
      setIsLoadingChatDetails(false);
    };

    if (initialChatProp?.id) {
      loadChatDetails(initialChatProp.id);
    } else {
      setCurrentChat(null);
      setMessages([]);
    }
    setSupervisorEvaluationScore(SIMULATED_IA_MAE_ANALYSIS.evaluationScore);
    setSupervisorFeedback('');
    setActiveTab('ia_eval'); 

  }, [initialChatProp]); 

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages, activeTab]);

  const fetchSentiment = async (messageToAnalyze: Message, chatIdForUpdate: string) => {
    if (!currentChat) return;
    setIsLoadingAi(true);
    try {
      const sentimentResult = await analyzeSentiment({ text: messageToAnalyze.content });
      setMessages(prevMessages => prevMessages.map(m => 
          m.id === messageToAnalyze.id ? { ...m, sentimentScore: sentimentResult.sentimentScore } : m
      ));
      setCurrentChat(prevChat => {
        if (prevChat && prevChat.id === chatIdForUpdate) {
          return {...prevChat, aiAnalysis: {sentimentScore: sentimentResult.sentimentScore, confidenceIndex: sentimentResult.confidenceIndex}};
        }
        return prevChat;
      });
    } catch (error) {
      console.error("AI sentiment analysis error:", error);
      toast({ title: "Erro de IA", description: "Não foi possível buscar análise de sentimento.", variant: "destructive" });
    }
    setIsLoadingAi(false);
  };
  
  const handleSendMessage = async (content: string, type: MessageType = 'text') => {
    if (!currentChat || !isCurrentUserAssigned) { // Supervisor só envia se estiver atribuído
        toast({title: "Ação não permitida", description: "Assuma o chat para enviar mensagens como agente.", variant: "destructive"});
        return;
    }

    const newMessage = await sendChatMessageServerAction(currentChat.id, content, currentUser.id, type);
    if (newMessage) {
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setCurrentChat(prev => prev ? {...prev, lastMessagePreview: newMessage.content.substring(0,50)+"..." , lastActivity: new Date(newMessage.timestamp) } : null);
    } else {
      toast({ title: "Erro ao enviar mensagem", variant: "destructive" });
    }
  };

  const handleSendWhisper = async (content: string) => {
    if (!currentChat || !canCurrentUserWhisper) return;
     const whisperMessage = await sendChatMessageServerAction(currentChat.id, content, currentUser.id, 'whisper');
    if (whisperMessage) {
      setMessages(prevMessages => [...prevMessages, whisperMessage]);
      toast({ title: "Sussurro enviado", description: "Sua nota interna foi enviada para o agente." });
    } else {
       toast({ title: "Erro ao enviar sussurro", variant: "destructive" });
    }
  };


  const handleTransferChatSubmit = (targetType: 'queue' | 'agent', targetId: string) => {
    // TODO: Implementar Server Action para transferência de chat
    const targetTypePt = targetType === 'queue' ? 'fila' : 'agente';
    toast({
      title: "Transferência de Chat Iniciada (Simulação)",
      description: `Chat transferido para ${targetTypePt} ID: ${targetId}.`,
    });
    if(currentChat) setCurrentChat(prev => prev ? {...prev, status: 'TRANSFERRED', assignedTo: targetType === 'agent' ? targetId : null} : null);
  };
  
  const handleAssumeChat = async () => {
    if (!currentChat) return;
    const updatedChat = await assignChatToServerAction(currentChat.id, currentUser.id);
    if (updatedChat) {
      // Ao assumir, o status também deve ir para IN_PROGRESS
      const finalChat = await updateChatStatusServerAction(currentChat.id, 'IN_PROGRESS');
      setCurrentChat(finalChat || updatedChat);
      toast({
        title: "Chat Assumido",
        description: `Supervisor ${currentUser.name} assumiu o chat ID: ${currentChat.id}. Agora você pode responder como agente.`,
      });
    }
  };

  const handleResolveChat = async () => {
     if (!currentChat) return;
    const updatedChat = await updateChatStatusServerAction(currentChat.id, 'RESOLVED');
    if(updatedChat) {
        setCurrentChat(updatedChat);
        toast({
        title: "Chat Resolvido",
        description: `Chat ID: ${currentChat.id} marcado como resolvido.`,
        });
    }
  }

  const handleSaveSupervisorEvaluation = () => {
    if(!currentChat) return;
    toast({
      title: "Avaliação do Supervisor Salva (Simulação)",
      description: `Avaliação para o chat ${currentChat.id}: Score ${supervisorEvaluationScore}, Feedback: "${supervisorFeedback || 'N/A'}"`,
    });
  };
  
  if (isLoadingChatDetails && !currentChat) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-muted/30 p-8">
        <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Carregando detalhes do chat...</p>
      </div>
    );
  }

  if (!currentChat) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-muted/30 p-8">
        <MessageSquareQuote className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <p className="text-lg text-muted-foreground">Nenhum chat selecionado ou chat não encontrado.</p>
      </div>
    );
  }

  const assignedAgent = MOCK_USERS.find(u => u.id === currentChat.assignedTo);

  return (
    <div className="flex h-full max-h-screen">
      <div className="flex flex-1 flex-col bg-background">
        <header className="flex items-center justify-between border-b p-3 gap-2 md:p-4">
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
            <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border flex-shrink-0">
              <AvatarImage src={currentChat.avatarUrl} alt={currentChat.customerName} data-ai-hint="person avatar"/>
              <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                {currentChat.customerName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <h2 className="font-semibold text-foreground truncate text-sm sm:text-base">{currentChat.customerName}</h2>
              <p className="text-xs text-muted-foreground truncate">
                {currentChat.status === 'IN_PROGRESS' && assignedAgent ? `Conversando com ${assignedAgent.name}` : currentChat.status}
                {isCurrentUserAssigned && currentUser.userType === 'SUPERVISOR' && " (Você está atribuído)"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
             {currentChat.aiAnalysis && (
                <SentimentDisplay score={currentChat.aiAnalysis.sentimentScore} confidence={currentChat.aiAnalysis.confidenceIndex} simple />
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
            {isLoadingChatDetails && messages.length === 0 && (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary"/></div>
            )}
            {messages.map((msg) => (
              <SupervisorMessageBubble 
                key={msg.id} 
                message={msg} 
                senderUser={MOCK_USERS.find(u => u.id === msg.senderId)}
                assignedAgentId={currentChat.assignedTo}
              />
            ))}
            {isLoadingAi && <div className="flex justify-center py-2"><Loader2 className="h-5 w-5 animate-spin text-primary"/></div>}
          </div>
        </ScrollArea>

        <SupervisorMessageInputArea 
            onSendMessage={handleSendMessage} 
            onSendWhisper={handleSendWhisper}
            disabled={currentChat.status === 'RESOLVED' || currentChat.status === 'CLOSED'} // Supervisor pode sempre sussurrar, mas só enviar msg se assumido
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
                      <p><strong>Nome:</strong> {currentChat.customerName}</p>
                      <p><strong>Telefone:</strong> {currentChat.customerPhone}</p>
                      <p><strong>Fila:</strong> {MOCK_QUEUES.find(q => q.id === currentChat.queueId)?.name || 'N/D'}</p>
                      <p><strong>Prioridade:</strong> <span className={`font-semibold ${currentChat.priority === 'HIGH' || currentChat.priority === 'URGENT' ? 'text-destructive' : ''}`}>{currentChat.priority}</span></p>
                       <p><strong>Status:</strong> {currentChat.status}</p>
                       <p><strong>Agente:</strong> {assignedAgent?.name || "Não atribuído"}</p>
                    </CardContent>
                  </Card>
                   {currentChat.aiAnalysis && (
                    <Card>
                      <CardHeader><CardTitle className="text-base">Sentimento (Cliente)</CardTitle></CardHeader>
                      <CardContent>
                        <SentimentDisplay score={currentChat.aiAnalysis.sentimentScore} confidence={currentChat.aiAnalysis.confidenceIndex} />
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
