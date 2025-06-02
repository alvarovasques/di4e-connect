
'use client';

import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Sparkles, SendHorizonal, Loader2, CornerDownLeft, HelpCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { queryOracle, OracleQueryInput, OracleQueryOutput } from '@/ai/flows/oracle-query-flow';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { MOCK_KB_ITEMS } from '@/lib/mock-data';
import type { KBItem } from '@/types';

interface OracleMessage {
  id: string;
  text: string;
  sender: 'user' | 'oracle';
  timestamp: Date;
}

const FALLBACK_PROMPT_SUGGESTIONS = [
  "Qual é a política de reembolso da empresa?",
  "Como funciona o processo de escalonamento de chamados?",
  "Resuma o código de conduta.",
  "Quais são os principais benefícios do Produto A?",
  "Preciso de ajuda com problemas de conexão, o que devo fazer?",
];

export default function OraclePage() {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<OracleMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dynamicPromptSuggestions, setDynamicPromptSuggestions] = useState<string[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: 'oracle-init',
        text: 'Olá! Sou o Oráculo IA. Posso te ajudar a encontrar informações na Base de Conhecimento ou a formular prompts. Como posso te ajudar hoje?',
        sender: 'oracle',
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = async (e?: FormEvent<HTMLFormElement>, suggestion?: string) => {
    if (e) e.preventDefault();
    const currentInput = suggestion || userInput;
    if (currentInput.trim() === '') return;

    const userMessage: OracleMessage = {
      id: `user-${Date.now()}`,
      text: currentInput,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    setDynamicPromptSuggestions([]); // Limpa sugestões antigas

    try {
      const inputForFlow: OracleQueryInput = { userInput: currentInput };
      const result: OracleQueryOutput = await queryOracle(inputForFlow);
      
      const oracleMessage: OracleMessage = {
        id: `oracle-${Date.now()}`,
        text: result.oracleResponse,
        sender: 'oracle',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, oracleMessage]);

      if (result.suggestedPrompts && result.suggestedPrompts.length > 0) {
        setDynamicPromptSuggestions(result.suggestedPrompts);
      }

    } catch (error) {
      console.error('Erro ao consultar o Oráculo:', error);
      const errorMessage: OracleMessage = {
        id: `oracle-error-${Date.now()}`,
        text: 'Desculpe, ocorreu um erro ao tentar processar sua solicitação. Tente novamente mais tarde.',
        sender: 'oracle',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setUserInput(suggestion); 
    handleSubmit(undefined, suggestion);
  };
  
  const sampleKbItems = MOCK_KB_ITEMS.filter(item => item.type === 'file' && item.content).slice(0,3);
  const currentPromptSuggestions = dynamicPromptSuggestions.length > 0 ? dynamicPromptSuggestions : FALLBACK_PROMPT_SUGGESTIONS;

  return (
    <div className="flex h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)]">
      <div className="flex-1 flex flex-col bg-background p-4">
        <header className="mb-4">
          <h1 className="text-3xl font-bold font-headline text-foreground flex items-center">
            <Sparkles className="mr-3 h-8 w-8 text-primary" />
            Oráculo IA
          </h1>
          <p className="text-muted-foreground">
            Consulte a Base de Conhecimento e obtenha ajuda para formular prompts.
          </p>
        </header>

        <ScrollArea className="flex-1 mb-4 pr-2" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={cn(
                  'flex items-end gap-2',
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.sender === 'oracle' && (
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback className="bg-primary/20 text-primary text-sm">
                      <Sparkles className="h-4 w-4"/>
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-lg rounded-lg px-4 py-2 shadow-md',
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-card text-card-foreground rounded-bl-none'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  <p className="text-xs text-right opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                 {msg.sender === 'user' && (
                  <Avatar className="h-8 w-8 border">
                    <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                      TU
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start items-center gap-2">
                 <Avatar className="h-8 w-8 border">
                    <AvatarFallback className="bg-primary/20 text-primary text-sm">
                      <Sparkles className="h-4 w-4"/>
                    </AvatarFallback>
                  </Avatar>
                <div className="bg-card text-card-foreground rounded-lg px-4 py-2 shadow-md inline-flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Pensando...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t pt-4">
          <Textarea
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            placeholder="Pergunte ao Oráculo ou peça sugestões de prompt..."
            className="flex-1 resize-none min-h-[40px]"
            rows={1}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || userInput.trim() === ''} className="bg-primary hover:bg-primary/90">
            <SendHorizonal className="h-5 w-5" />
            <span className="sr-only">Enviar</span>
          </Button>
        </form>
      </div>

      <aside className="w-80 hidden lg:flex flex-col border-l bg-muted/30 p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <HelpCircle className="mr-2 h-5 w-5 text-primary" />
              Sugestões de Prompt
            </CardTitle>
            <CardDescription>Clique para enviar ou use como inspiração.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {currentPromptSuggestions.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="w-full justify-start text-left h-auto py-1.5"
                onClick={() => handleSuggestionClick(prompt)}
                disabled={isLoading}
              >
                <CornerDownLeft className="mr-2 h-3 w-3" />
                {prompt}
              </Button>
            ))}
          </CardContent>
        </Card>
        <Card>
           <CardHeader>
            <CardTitle className="text-lg flex items-center">
                <BookOpen className="mr-2 h-5 w-5 text-primary" />
                Base de Conhecimento
            </CardTitle>
            <CardDescription>O Oráculo utiliza estes e outros documentos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {sampleKbItems.length > 0 ? (
                sampleKbItems.map(item => (
                    <div key={item.id} className="p-2 border rounded-md bg-background/50 text-xs">
                        <p className="font-semibold truncate" title={item.name}>{item.name}</p>
                        <p className="text-muted-foreground line-clamp-2" title={item.summary || item.content}>
                            {item.summary || item.content?.substring(0,100) + "..."}
                        </p>
                    </div>
                ))
            ) : (
                <p className="text-muted-foreground">Nenhum exemplo da Base de Conhecimento para mostrar.</p>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

