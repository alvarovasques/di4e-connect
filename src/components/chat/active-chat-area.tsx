
'use client';

import React, { useEffect, useRef, useState, FormEvent } from 'react';
import type { Chat, Message, User, KnowledgeBaseArticle, Queue, KBItem, MessageType, OracleQueryInput, OracleQueryOutput } from '@/types';
// import { MOCK_USERS, MOCK_QUEUES, MOCK_KB_ITEMS, MOCK_CURRENT_USER } from '@/lib/mock-data'; // Usar server-memory-store
import { MOCK_USERS, MOCK_QUEUES, MOCK_KB_ITEMS, MOCK_CURRENT_USER } from '@/lib/server-memory-store';
import MessageBubble from './message-bubble';
import MessageInputArea from './message-input-area';
import KnowledgeBaseSuggestionItem from './knowledge-base-suggestion-item';
import SentimentDisplay from './sentiment-display';
import ChatTransferDialog from './chat-transfer-dialog';
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
import { suggestKnowledgeBaseArticles } from '@/ai/flows/knowledge-base-suggestions';
import { queryOracle } from '@/ai/flows/oracle-query-flow';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Slider } from '../ui/slider';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  getChatDetailsServerAction, 
  sendChatMessageServerAction,
  assignChatToServerAction,
  updateChatStatusServerAction
} from '@/app/actions/chatActions';

type ActiveChatAreaProps = {
  chat: Chat | null; // O chat inicial passado como prop
};

interface OracleUIMessage {
  id: string;
  text: string;
  sender: 'user' | 'oracle';
  timestamp: Date;
}

const SIMULATED_IA_MAE_ANALYSIS = {
  evaluationScore: 82,
  evaluationFeedback: "O agente demonstrou bom conhecimento do produto, mas poderia ser mais proativo em oferecer soluções alternativas. O cliente pareceu satisfeito no final.",
  recommendations: [
    "Sugerir o artigo da BC sobre 'Devoluções' se o cliente mencionar insatisfação com o produto.",
    "Usar uma saudação mais personalizada no início da conversa.",
    "Confirmar a resolução do problema antes de encerrar o chat.",
  ],
};

const DEFAULT_ORACLE_PROMPT_SUGGESTIONS = [
  "Como responder a um cliente irritado?",
  "Peça uma breve explicação sobre o Produto X.",
  "Sugira 3 formas de encerrar a conversa educadamente.",
];


const ActiveChatArea = ({ chat: initialChatProp }: ActiveChatAreaProps) => {
  const searchParams = useSearchParams();
  const initialAction = searchParams.get('action');

  const [currentChat, setCurrentChat] = useState<Chat | null>(initialChatProp);
  const [messages, setMessages] = useState<Message[]>(initialChatProp?.messages || []);
  const [suggestedArticles, setSuggestedArticles] = useState<KnowledgeBaseArticle[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isLoadingChatDetails, setIsLoadingChatDetails] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const oracleScrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const [supervisorEvaluationScore, setSupervisorEvaluationScore] = useState(SIMULATED_IA_MAE_ANALYSIS.evaluationScore);
  const [supervisorFeedback, setSupervisorFeedback] = useState('');
  
  const currentUser = MOCK_CURRENT_USER;
  const isSupervisor = currentUser.userType === 'SUPERVISOR' || currentUser.userType === 'ADMIN';
  const isAgent = currentUser.userType === 'AGENT_HUMAN';
  const isCurrentUserAssigned = currentChat?.assignedTo === currentUser.id;

  const [oracleUserInput, setOracleUserInput] = useState('');
  const [oracleMessages, setOracleMessages] = useState<OracleUIMessage[]>([]);
  const [isOracleLoading, setIsOracleLoading] = useState(false);
  const [oracleSuggestions, setOracleSuggestions] = useState<string[]>(DEFAULT_ORACLE_PROMPT_SUGGESTIONS);

  const canCurrentUserWhisper = isSupervisor || (isAgent && isCurrentUserAssigned);

  const [activeTab, setActiveTab] = useState(() => {
    if (isSupervisor) {
      return initialAction === 'whisper' ? 'notes' : 'ia_eval';
    }
    return initialAction === 'whisper' ? 'notes' : 'details';
  });


  useEffect(() => {
    const loadChatDetails = async (chatId: string) => {
      setIsLoadingChatDetails(true);
      try {
        const chatDetails = await getChatDetailsServerAction(chatId);
        setCurrentChat(chatDetails);
        setMessages(chatDetails?.messages || []);
        
        if (chatDetails) {
          if (!isSupervisor) { 
              fetchAiSuggestions(chatDetails.messages);
          } else { 
            const lastCustomerMessage = [...chatDetails.messages].reverse().find(m => m.sender === 'customer' && m.type !== 'whisper');
            if (lastCustomerMessage && lastCustomerMessage.sentimentScore === undefined) {
                fetchSentiment(lastCustomerMessage, chatId); // Pass chatId
            } else if (lastCustomerMessage && lastCustomerMessage.sentimentScore !== undefined && !chatDetails.aiAnalysis) {
                setCurrentChat(prevChat => prevChat ? {...prevChat, aiAnalysis: {sentimentScore: lastCustomerMessage.sentimentScore!, confidenceIndex: 1 }} : null);
            }
          }
        } else {
          setSuggestedArticles([]);
        }
      } catch (error) {
        console.error("Error loading chat details:", error);
        toast({ title: "Erro ao carregar chat", description: "Não foi possível buscar os detalhes do chat.", variant: "destructive" });
      }
      setIsLoadingChatDetails(false);
    };

    if (initialChatProp?.id) {
      loadChatDetails(initialChatProp.id);
    } else {
      setCurrentChat(null);
      setMessages([]);
      setSuggestedArticles([]);
    }
    // Redefinir estados relacionados ao Oracle e Supervisor
    setOracleMessages([]); 
    setOracleUserInput('');
    setOracleSuggestions(DEFAULT_ORACLE_PROMPT_SUGGESTIONS);
    setSupervisorEvaluationScore(SIMULATED_IA_MAE_ANALYSIS.evaluationScore);
    setSupervisorFeedback('');
    
    let newActiveTab = isSupervisor ? 'ia_eval' : 'details';
    if (initialAction === 'whisper' && canCurrentUserWhisper) {
        newActiveTab = 'notes';
    }
    setActiveTab(newActiveTab);

  }, [initialChatProp, isSupervisor, isAgent, initialAction, canCurrentUserWhisper]); 

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages, activeTab]);

  useEffect(() => {
    if (oracleScrollAreaRef.current) {
      const scrollViewport = oracleScrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [oracleMessages]);

  const fetchSentiment = async (messageToAnalyze: Message, chatIdForUpdate: string) => {
    if (!currentChat) return; // Use currentChat from state
    setIsLoadingAi(true);
    try {
      const sentimentResult = await analyzeSentiment({ text: messageToAnalyze.content });
      setMessages(prevMessages => prevMessages.map(m => 
          m.id === messageToAnalyze.id ? { ...m, sentimentScore: sentimentResult.sentimentScore } : m
      ));
      // Atualizar o estado do currentChat com a análise de sentimento
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

  const fetchAiSuggestions = async (currentMessages: Message[]) => {
    if (!currentChat || currentMessages.length === 0) return;
    setIsLoadingAi(true);
    try {
      const chatContent = currentMessages.filter(m => m.type !== 'whisper').map(m => `${m.sender}: ${m.content}`).join('\n');
      
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

    } catch (error) {
      console.error("AI suggestion error:", error);
    }
    setIsLoadingAi(false);
  };
  
  const handleSendMessage = async (content: string, type: MessageType = 'text') => {
    if (!currentChat) return;
    const newMessage = await sendChatMessageServerAction(currentChat.id, content, currentUser.id, type);
    if (newMessage) {
      setMessages(prevMessages => [...prevMessages, newMessage]);
      if (!isSupervisor && type === 'text') { // Só buscar sugestões para mensagens de texto normais do agente
        fetchAiSuggestions([...messages, newMessage]); 
      }
      // Atualizar o lastMessagePreview no chat principal
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
      toast({ title: "Sussurro enviado", description: "Sua nota interna foi enviada." });
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
  
  const handleSupervisorAssumeChat = async () => {
    if (!currentChat || !isSupervisor) return;
    const updatedChat = await assignChatToServerAction(currentChat.id, currentUser.id);
    if (updatedChat) {
      setCurrentChat(updatedChat); // Atualiza com o status e assignedTo do servidor
      toast({
        title: "Chat Assumido (Supervisor)",
        description: `Supervisor ${currentUser.name} assumiu o chat ID: ${currentChat.id}.`,
      });
    }
  };

  const handleAgentAssumeChat = async () => {
    if (!currentChat || !isAgent) return;
    const updatedChat = await assignChatToServerAction(currentChat.id, currentUser.id);
     if (updatedChat) {
      setCurrentChat(updatedChat);
      // Talvez mudar status para IN_PROGRESS se for assumido com sucesso
      // Esta lógica pode ser movida para a Server Action também.
      const finalChat = await updateChatStatusServerAction(currentChat.id, 'IN_PROGRESS');
      if (finalChat) setCurrentChat(finalChat);
      toast({
        title: "Chat Assumido",
        description: `Você assumiu o chat com ${currentChat.customerName}.`,
      });
    }
  };

  const handleAgentStartChat = async () => {
    if (!currentChat || !isAgent) return;
    const updatedChat = await updateChatStatusServerAction(currentChat.id, 'IN_PROGRESS');
    if (updatedChat) {
      setCurrentChat(updatedChat);
      toast({
        title: "Chat Iniciado",
        description: `Você iniciou o atendimento com ${currentChat.customerName}.`,
      });
    }
  };

  const handleResolveChat = async () => {
     if (!currentChat) return;
    const updatedChat = await updateChatStatusServerAction(currentChat.id, 'RESOLVED');
    if (updatedChat) {
      setCurrentChat(updatedChat);
      toast({
        title: "Chat Resolvido",
        description: `Chat ID: ${currentChat.id} marcado como resolvido.`,
      });
    }
  }

  const handleSaveSupervisorEvaluation = () => {
    if(!currentChat || !isSupervisor) return;
    toast({
      title: "Avaliação do Supervisor Salva (Simulação)",
      description: `Avaliação para o chat ${currentChat.id}: Score ${supervisorEvaluationScore}, Feedback: "${supervisorFeedback || 'N/A'}"`,
    });
  };
  
  const handleSelectKbArticle = (article: KnowledgeBaseArticle) => {
    const articlePreview = article.summary || article.content.substring(0, 100) + "...";
    if (navigator.clipboard) {
        navigator.clipboard.writeText(articlePreview);
        toast({
            title: `Resumo de "${article.title}" copiado!`,
            description: "Cole no chat se desejar.",
        });
    } else {
        toast({
            title: `Artigo Selecionado: ${article.title}`,
            description: "Conteúdo do artigo seria usado aqui.",
        });
    }
  };

  const handleOracleQuerySubmit = async (e?: FormEvent<HTMLFormElement>, suggestion?: string) => {
    if (e) e.preventDefault();
    const currentInput = suggestion || oracleUserInput;
    if (currentInput.trim() === '' || !currentChat) return;

    const userOracleMessage: OracleUIMessage = {
      id: `oracle-user-${Date.now()}`,
      text: currentInput,
      sender: 'user',
      timestamp: new Date(),
    };
    setOracleMessages(prev => [...prev, userOracleMessage]);
    setOracleUserInput('');
    setIsOracleLoading(true);
    setOracleSuggestions([]);

    try {
      const accessibleKbIds = MOCK_KB_ITEMS
        .filter(item => item.type === 'file' && (item.mimeType === 'text/markdown' || item.mimeType === 'text/plain' || (item.content && item.content.trim() !== '')))
        .map(item => item.id);

      const inputForFlow: OracleQueryInput = { userInput: currentInput, selectedKbIds: accessibleKbIds };
      const result: OracleQueryOutput = await queryOracle(inputForFlow);
      
      const oracleResponseMessage: OracleUIMessage = {
        id: `oracle-response-${Date.now()}`,
        text: result.oracleResponse,
        sender: 'oracle',
        timestamp: new Date(),
      };
      setOracleMessages(prev => [...prev, oracleResponseMessage]);

      if (result.suggestedPrompts && result.suggestedPrompts.length > 0) {
        setOracleSuggestions(result.suggestedPrompts);
      } else {
        setOracleSuggestions(DEFAULT_ORACLE_PROMPT_SUGGESTIONS);
      }

    } catch (error) {
      console.error('Erro ao consultar o Oráculo no chat:', error);
      const errorMessage: OracleUIMessage = {
        id: `oracle-error-${Date.now()}`,
        text: 'Desculpe, ocorreu um erro ao tentar processar sua solicitação ao Oráculo.',
        sender: 'oracle',
        timestamp: new Date(),
      };
      setOracleMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsOracleLoading(false);
    }
  };

  const handleOracleSuggestionClick = (suggestion: string) => {
    setOracleUserInput(suggestion); 
    handleOracleQuerySubmit(undefined, suggestion);
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
        <p className="text-lg text-muted-foreground">Selecione um chat para começar a conversar</p>
        <p className="text-sm text-muted-foreground/80">Suas conversas aparecerão aqui.</p>
      </div>
    );
  }

  const assignedAgentDetails = MOCK_USERS.find(u => u.id === currentChat.assignedTo);
  
  const agentCanAssumeWaitingChat = isAgent && currentChat.status === 'WAITING' && (!currentChat.assignedTo || currentChat.assignedTo !== currentUser.id) && currentUser.assignedQueueIds?.includes(currentChat.queueId);
  const agentCanStartAssignedWaitingChat = isAgent && currentChat.status === 'WAITING' && isCurrentUserAssigned;
  const agentCanManageInProgressChat = isAgent && currentChat.status === 'IN_PROGRESS' && isCurrentUserAssigned;


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
                {currentChat.status === 'IN_PROGRESS' && assignedAgentDetails ? `Conversando com ${assignedAgentDetails.name}` : currentChat.status}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
             {!isSupervisor && currentChat.aiAnalysis && ( // Agente não vê sentimento global no header
                <SentimentDisplay score={currentChat.aiAnalysis.sentimentScore} confidence={currentChat.aiAnalysis.confidenceIndex} simple />
             )}

            {agentCanAssumeWaitingChat && (
                 <Button variant="outline" size="sm" onClick={handleAgentAssumeChat} title="Assumir Chat">
                    <CornerRightUp className="h-4 w-4 md:mr-1" /><span className="hidden md:inline">Assumir</span>
                </Button>
            )}
            {agentCanStartAssignedWaitingChat && (
                <Button variant="outline" size="sm" onClick={handleAgentStartChat} title="Iniciar Chat">
                    <Play className="h-4 w-4 md:mr-1" /><span className="hidden md:inline">Iniciar</span>
                </Button>
            )}
            {agentCanManageInProgressChat && (
              <>
                <ChatTransferDialog 
                    queues={MOCK_QUEUES.filter(q => q.isActive)} 
                    agents={MOCK_USERS.filter(u => u.userType === "AGENT_HUMAN" && u.id !== currentUser.id)} 
                    onTransfer={handleTransferChatSubmit} 
                />
                <Button variant="outline" size="sm" onClick={handleResolveChat} title="Resolver Chat" className="text-green-600 hover:text-green-700 border-green-600 hover:border-green-700">
                    <CheckCircle className="h-4 w-4 md:mr-1" /><span className="hidden md:inline">Resolver</span>
                </Button>
              </>
            )}

            {isSupervisor && ( // Lógica para supervisor permanece aqui, mas o componente principal é SupervisorActiveChatArea
              <>
                <ChatTransferDialog 
                    queues={MOCK_QUEUES.filter(q => q.isActive)} 
                    agents={MOCK_USERS.filter(u => u.userType === "AGENT_HUMAN")} 
                    onTransfer={handleTransferChatSubmit} 
                />
                {!isCurrentUserAssigned && (
                     <Button variant="outline" size="sm" onClick={handleSupervisorAssumeChat} title="Assumir Chat">
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
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                senderUser={MOCK_USERS.find(u => u.id === msg.senderId)}
                assignedAgentId={currentChat.assignedTo}
              />
            ))}
            {isLoadingAi && !isSupervisor && <div className="flex justify-center py-2"><Loader2 className="h-5 w-5 animate-spin text-primary"/></div>}
          </div>
        </ScrollArea>

        <MessageInputArea 
            onSendMessage={handleSendMessage} 
            onSendWhisper={handleSendWhisper}
            disabled={currentChat.status === 'RESOLVED' || currentChat.status === 'CLOSED' || (isAgent && currentChat.status === 'WAITING' && !isCurrentUserAssigned)}
            canWhisper={canCurrentUserWhisper}
        />
      </div>
      
      <aside className="hidden lg:flex w-80 flex-col border-l bg-muted/20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
           <TabsList className={cn("grid w-full rounded-none border-b", isSupervisor ? "grid-cols-3" : "grid-cols-4")}>
             {isSupervisor ? (
                <>
                    <TabsTrigger value="details" className="text-xs px-1 py-2.5"><Info className="h-3 w-3 sm:h-4 sm:w-4 mr-1"/><span className="hidden sm:inline">Detalhes</span></TabsTrigger>
                    <TabsTrigger value="notes" className="text-xs px-1 py-2.5"><MessageSquareQuote className="h-3 w-3 sm:h-4 sm:w-4 mr-1"/><span className="hidden sm:inline">Notas</span></TabsTrigger>
                    <TabsTrigger value="ia_eval" className="text-xs px-1 py-2.5"><Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1"/><span className="hidden sm:inline">Análise IA</span></TabsTrigger>
                </>
             ) : ( // Agente
                <>
                    <TabsTrigger value="details" className="text-xs px-1 py-2.5"><Info className="h-3 w-3 sm:h-4 sm:w-4 mr-1"/><span className="hidden sm:inline">Detalhes</span></TabsTrigger>
                    <TabsTrigger value="notes" className="text-xs px-1 py-2.5"><MessageSquareQuote className="h-3 w-3 sm:h-4 sm:w-4 mr-1"/><span className="hidden sm:inline">Notas</span></TabsTrigger>
                    <TabsTrigger value="kb" className="text-xs px-1 py-2.5"><BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-1"/><span className="hidden sm:inline">BC</span></TabsTrigger>
                    <TabsTrigger value="oracle" className="text-xs px-1 py-2.5"><Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1"/><span className="hidden sm:inline">Oráculo</span></TabsTrigger>
                </>
             )}
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
                     <p><strong>Agente:</strong> {assignedAgentDetails?.name || "Não atribuído"}</p>
                  </CardContent>
                </Card>
                 {isSupervisor && currentChat.aiAnalysis && ( 
                  <Card>
                    <CardHeader><CardTitle className="text-base">Sentimento (IA)</CardTitle></CardHeader>
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
                    Notas internas (sussurros) são exibidas inline na conversa. Use esta área para anotações gerais sobre o atendimento.
                  </p>
                  <Textarea placeholder="Suas anotações privadas sobre este chat..." className="mt-2 min-h-[100px]" />
                  <Button variant="outline" size="sm" className="mt-2 w-full">Salvar Anotação</Button>
                </div>
              </ScrollArea>
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
            <>
              <TabsContent value="kb" className="flex-1 overflow-y-auto p-0">
                <ScrollArea className="h-full p-4 space-y-3">
                  {isLoadingAi && !suggestedArticles.length && <div className="flex justify-center py-2"><Loader2 className="h-5 w-5 animate-spin text-primary"/></div>}
                  {!isLoadingAi && suggestedArticles.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum artigo relevante encontrado.</p>}
                  {suggestedArticles.map(article => (
                    <KnowledgeBaseSuggestionItem key={article.id} article={article} onSelectArticle={handleSelectKbArticle} />
                  ))}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="oracle" className="flex-1 flex flex-col overflow-hidden p-0">
                <div className="p-4 border-b">
                   <h3 className="text-sm font-medium text-foreground flex items-center"><Sparkles className="h-4 w-4 mr-2 text-primary" />Oráculo IA</h3>
                   <p className="text-xs text-muted-foreground">Peça ajuda para responder ou encontrar informações.</p>
                </div>
                <ScrollArea className="flex-1 p-4 space-y-3" ref={oracleScrollAreaRef}>
                    {oracleMessages.map(msg => (
                      <div
                        key={msg.id}
                        className={cn(
                          'flex items-end gap-2',
                          msg.sender === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        {msg.sender === 'oracle' && (
                          <Avatar className="h-7 w-7 border-2 border-primary/30">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              <Sparkles className="h-3 w-3"/>
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={cn(
                            'max-w-xs rounded-md px-3 py-1.5 shadow-sm text-xs',
                            msg.sender === 'user'
                              ? 'bg-secondary text-secondary-foreground rounded-br-none'
                              : 'bg-card text-card-foreground rounded-bl-none border'
                          )}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                           <p className="text-xs text-right opacity-60 mt-0.5">
                            {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isOracleLoading && (
                        <div className="flex justify-start items-center gap-2">
                            <Avatar className="h-7 w-7 border-2 border-primary/30"><AvatarFallback className="bg-primary/10 text-primary text-xs"><Sparkles className="h-3 w-3"/></AvatarFallback></Avatar>
                            <div className="bg-card text-card-foreground rounded-md px-3 py-1.5 shadow-sm inline-flex items-center text-xs border">
                                <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                                <span>Pensando...</span>
                            </div>
                        </div>
                    )}
                     {oracleMessages.length === 0 && !isOracleLoading && (
                        <p className="text-xs text-muted-foreground text-center py-2">Faça uma pergunta ao Oráculo.</p>
                     )}
                </ScrollArea>
                 {oracleSuggestions.length > 0 && !isOracleLoading && (
                    <div className="p-3 border-t">
                        <p className="text-xs text-muted-foreground mb-1.5">Sugestões:</p>
                        <div className="space-y-1.5">
                        {oracleSuggestions.slice(0,2).map((s, i) => (
                            <Button key={i} variant="outline" size="xs" className="w-full justify-start text-left h-auto py-1 text-xs" onClick={() => handleOracleSuggestionClick(s)}>
                                <HelpCircle className="mr-1.5 h-3 w-3"/>{s}
                            </Button>
                        ))}
                        </div>
                    </div>
                 )}
                <form onSubmit={handleOracleQuerySubmit} className="p-3 border-t flex items-center gap-2 bg-background">
                    <Textarea
                        value={oracleUserInput}
                        onChange={e => setOracleUserInput(e.target.value)}
                        placeholder="Pergunte ao Oráculo..."
                        className="flex-1 resize-none min-h-[36px] text-xs"
                        rows={1}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleOracleQuerySubmit(e);
                          }
                        }}
                        disabled={isOracleLoading}
                    />
                    <Button type="submit" size="iconSm" variant="ghost" disabled={isOracleLoading || oracleUserInput.trim() === ''} className="bg-primary hover:bg-primary/90 h-9 w-9">
                        <SendHorizonal className="h-4 w-4 text-primary-foreground" />
                    </Button>
                </form>
              </TabsContent>
            </>
          )}
        </Tabs>
      </aside>
      
    </div>
  );
};

export default ActiveChatArea;
    
