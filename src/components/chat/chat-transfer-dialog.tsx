
'use client';

import { useState } from 'react';
import type { Queue, User } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Share2 } from 'lucide-react';

type ChatTransferDialogProps = {
  queues: Queue[];
  agents: User[]; 
  onTransfer: (targetType: 'queue' | 'agent', targetId: string) => void;
};

const ChatTransferDialog = ({ queues, agents, onTransfer }: ChatTransferDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [transferTo, setTransferTo] = useState<'queue' | 'agent'>('queue');
  const [selectedQueue, setSelectedQueue] = useState<string>('');
  const [selectedAgent, setSelectedAgent] = useState<string>('');

  const handleTransfer = () => {
    if (transferTo === 'queue' && selectedQueue) {
      onTransfer('queue', selectedQueue);
    } else if (transferTo === 'agent' && selectedAgent) {
      onTransfer('agent', selectedAgent);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Transferir Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transferir Chat</DialogTitle>
          <DialogDescription>
            Selecione uma fila ou agente para transferir este chat.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="transfer-type" className="text-right">
              Transferir Para
            </Label>
            <Select value={transferTo} onValueChange={(value) => setTransferTo(value as 'queue' | 'agent')}>
              <SelectTrigger id="transfer-type" className="col-span-3">
                <SelectValue placeholder="Selecionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="queue">Fila</SelectItem>
                <SelectItem value="agent">Agente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {transferTo === 'queue' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="queue-select" className="text-right">
                Fila
              </Label>
              <Select value={selectedQueue} onValueChange={setSelectedQueue}>
                <SelectTrigger id="queue-select" className="col-span-3">
                  <SelectValue placeholder="Selecione uma fila" />
                </SelectTrigger>
                <SelectContent>
                  {queues.filter(q => q.isActive).map((queue) => (
                    <SelectItem key={queue.id} value={queue.id}>
                      {queue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {transferTo === 'agent' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="agent-select" className="text-right">
                Agente
              </Label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger id="agent-select" className="col-span-3">
                  <SelectValue placeholder="Selecione um agente" />
                </SelectTrigger>
                <SelectContent>
                  {agents.filter(a => a.userType === 'AGENT_HUMAN').map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button 
            onClick={handleTransfer} 
            disabled={transferTo === 'queue' ? !selectedQueue : !selectedAgent}
            className="bg-primary hover:bg-primary/90"
          >
            Transferir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChatTransferDialog;
