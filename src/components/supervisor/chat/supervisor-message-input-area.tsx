
'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, SendHorizonal, Mic, Ear } from 'lucide-react'; 
import { cn } from '@/lib/utils';

type SupervisorMessageInputAreaProps = {
  onSendMessage: (content: string, type: 'text') => void;
  onSendWhisper: (content: string) => void; 
  disabled?: boolean;
  canWhisper?: boolean;
  isAssigned?: boolean; // Is the current supervisor assigned to this chat?
};

const SupervisorMessageInputArea = ({ onSendMessage, onSendWhisper, disabled, canWhisper, isAssigned }: SupervisorMessageInputAreaProps) => {
  const [message, setMessage] = useState('');
  const [isWhisperMode, setIsWhisperMode] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      if (isWhisperMode && canWhisper) {
        onSendWhisper(message.trim());
      } else if (isAssigned) { // Only send normal messages if supervisor is assigned
        onSendMessage(message.trim(), 'text');
      } else {
        // Optionally, provide feedback that supervisor needs to assume chat
        console.warn("Supervisor must assume chat to send direct messages.");
        return; 
      }
      setMessage('');
    }
  };

  const toggleWhisperMode = () => {
    if (canWhisper) {
      setIsWhisperMode(!isWhisperMode);
    }
  };

  let placeholderText = "Assuma o chat para enviar mensagens ao cliente.";
  if (isWhisperMode && canWhisper) {
    placeholderText = "Digite seu sussurro para o agente...";
  } else if (isAssigned) {
    placeholderText = "Digite sua mensagem para o cliente...";
  }


  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 border-t bg-background p-3 md:p-4"
    >
      {canWhisper && (
        <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={toggleWhisperMode}
            className={cn(
                "shrink-0",
                isWhisperMode ? "bg-yellow-200 hover:bg-yellow-300 text-yellow-700" : "text-muted-foreground"
            )}
            title={isWhisperMode ? "Mudar para mensagem normal" : "Mudar para sussurro"}
            aria-pressed={isWhisperMode}
            disabled={disabled && !isWhisperMode} // Allow whisper even if main input is disabled (e.g. not assumed)
        >
            <Ear className="h-5 w-5" />
            <span className="sr-only">{isWhisperMode ? "Modo Sussurro Ativado" : "Ativar Modo Sussurro"}</span>
        </Button>
      )}
      <Button variant="ghost" size="icon" type="button" disabled={disabled || !isAssigned} className="shrink-0">
        <Paperclip className="h-5 w-5 text-muted-foreground" />
        <span className="sr-only">Anexar arquivo</span>
      </Button>
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholderText}
        className={cn(
            "flex-1 resize-none border-border focus-visible:ring-primary min-h-[40px]",
            isWhisperMode && canWhisper && "focus-visible:ring-yellow-500 border-yellow-400"
        )}
        rows={1}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        disabled={disabled || (!isWhisperMode && !isAssigned)} // Disable if main input disabled OR (not whisper mode AND not assigned)
        aria-label="Entrada de mensagem"
      />
      <Button variant="ghost" size="icon" type="button" disabled={disabled || !isAssigned} className="shrink-0">
        <Mic className="h-5 w-5 text-muted-foreground" />
        <span className="sr-only">Gravar áudio</span>
      </Button>
      <Button 
        type="submit" 
        size="icon" 
        disabled={disabled || !message.trim() || (!isWhisperMode && !isAssigned)} 
        className={cn(
            "shrink-0",
            isWhisperMode && canWhisper ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-primary hover:bg-primary/90"
        )}
       >
        <SendHorizonal className="h-5 w-5" />
        <span className="sr-only">Enviar mensagem</span>
      </Button>
    </form>
  );
};

export default SupervisorMessageInputArea;
