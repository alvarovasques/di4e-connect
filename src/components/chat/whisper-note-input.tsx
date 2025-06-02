'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquareQuote } from 'lucide-react';

type WhisperNoteInputProps = {
  onSendWhisperNote: (note: string) => void;
  disabled?: boolean;
};

const WhisperNoteInput = ({ onSendWhisperNote, disabled }: WhisperNoteInputProps) => {
  const [note, setNote] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (note.trim()) {
      onSendWhisperNote(note.trim());
      setNote('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t">
      <label htmlFor="whisper-note" className="text-xs font-medium text-muted-foreground mb-1 block">
        Whisper Note (Internal)
      </label>
      <Textarea
        id="whisper-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Type an internal note for the agent..."
        className="mb-2 text-sm min-h-[60px] focus-visible:ring-accent"
        rows={2}
        disabled={disabled}
      />
      <Button type="submit" size="sm" disabled={disabled || !note.trim()} className="w-full bg-accent hover:bg-accent/90">
        <MessageSquareQuote className="mr-2 h-4 w-4" />
        Send Whisper
      </Button>
    </form>
  );
};

export default WhisperNoteInput;
