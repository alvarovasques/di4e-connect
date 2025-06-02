
'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, SendHorizonal, Mic } from 'lucide-react';

type MessageInputAreaProps = {
  onSendMessage: (content: string, type: 'text') => void;
  disabled?: boolean;
};

const MessageInputArea = ({ onSendMessage, disabled }: MessageInputAreaProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim(), 'text');
      setMessage('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 border-t bg-background p-3 md:p-4"
    >
      <Button variant="ghost" size="icon" type="button" disabled={disabled} className="shrink-0">
        <Paperclip className="h-5 w-5 text-muted-foreground" />
        <span className="sr-only">Anexar arquivo</span>
      </Button>
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Digite sua mensagem..."
        className="flex-1 resize-none border-border focus-visible:ring-primary min-h-[40px]"
        rows={1}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        disabled={disabled}
        aria-label="Entrada de mensagem"
      />
      <Button variant="ghost" size="icon" type="button" disabled={disabled} className="shrink-0">
        <Mic className="h-5 w-5 text-muted-foreground" />
        <span className="sr-only">Gravar áudio</span>
      </Button>
      <Button type="submit" size="icon" disabled={disabled || !message.trim()} className="shrink-0 bg-primary hover:bg-primary/90">
        <SendHorizonal className="h-5 w-5" />
        <span className="sr-only">Enviar mensagem</span>
      </Button>
    </form>
  );
};

export default MessageInputArea;
