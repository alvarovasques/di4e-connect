
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Link2, Save, Wifi, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WhatsappChannelsPage() {
  const [evolutionApiUrl, setEvolutionApiUrl] = useState('');
  const [evolutionApiToken, setEvolutionApiToken] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connected' | 'pending'>('disconnected');
  const { toast } = useToast();

  useEffect(() => {
    // Em um app real, buscaria as configurações salvas.
    // E geraria o webhookUrl com base no domínio atual.
    if (typeof window !== 'undefined') {
      setWebhookUrl(`${window.location.origin}/api/evolution/webhook`);
    } else {
      setWebhookUrl('https://SUA_APP_URL/api/evolution/webhook'); // Fallback para SSR
    }
    // Simular carregamento de dados salvos
    setEvolutionApiUrl(localStorage.getItem('evolutionApiUrl') || '');
    setEvolutionApiToken(localStorage.getItem('evolutionApiToken') || '');
  }, []);

  const handleSaveChanges = () => {
    // Em um app real, salvaria no backend.
    localStorage.setItem('evolutionApiUrl', evolutionApiUrl);
    localStorage.setItem('evolutionApiToken', evolutionApiToken);
    toast({
      title: "Configurações Salvas",
      description: "Suas configurações do canal WhatsApp foram salvas localmente (simulação).",
    });
    // Simular verificação de conexão
    setConnectionStatus('pending');
    setTimeout(() => {
      if (evolutionApiUrl && evolutionApiToken) {
        // Simular lógica de teste de conexão aqui
        setConnectionStatus('connected');
         toast({
          title: "Conexão Testada",
          description: "Conexão com a API Evolution parece estar OK (simulação).",
        });
      } else {
        setConnectionStatus('disconnected');
         toast({
          title: "Falha na Conexão",
          description: "URL da API ou Token ausentes.",
          variant: "destructive",
        });
      }
    }, 2000);
  };

  const handleCopyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "Webhook URL Copiado!",
      description: "O URL do webhook foi copiado para a área de transferência.",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline text-foreground mb-2 flex items-center">
          <Link2 className="mr-3 h-8 w-8 text-primary" />
          Configuração de Canais WhatsApp (Evolution API)
        </h1>
        <p className="text-muted-foreground">
          Configure a integração com sua instância da Evolution API para receber e enviar mensagens do WhatsApp.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Detalhes da Conexão com Evolution API</CardTitle>
          <CardDescription>
            Insira as informações da sua instância da Evolution API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="evolution-api-url">URL da Instância Evolution API</Label>
            <Input
              id="evolution-api-url"
              placeholder="https://sua-evolution-api.com"
              value={evolutionApiUrl}
              onChange={(e) => setEvolutionApiUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Exemplo: Se sua API está em localhost:8080, use o URL exposto publicamente (ex: via ngrok para testes locais).
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="evolution-api-token">Token da API Global (apikey)</Label>
            <Input
              id="evolution-api-token"
              type="password"
              placeholder="Seu token da API da Evolution"
              value={evolutionApiToken}
              onChange={(e) => setEvolutionApiToken(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Este é o token global definido na sua configuração da Evolution API.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Configuração do Webhook</CardTitle>
          <CardDescription>
            Use este URL para configurar o webhook global na sua instância da Evolution API para receber eventos de mensagens.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Seu Webhook URL</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="webhook-url"
                type="text"
                value={webhookUrl}
                readOnly
                className="bg-muted"
              />
              <Button variant="outline" size="icon" onClick={handleCopyWebhookUrl} title="Copiar URL">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Copie este URL e cole no campo "Webhook Global" nas configurações da sua instância Evolution API.
              Este endpoint precisa estar acessível publicamente.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p><strong>Próximos Passos (Evolution API):</strong></p>
            <ul className="list-disc list-inside pl-4 text-xs">
              <li>Acesse sua instância da Evolution API.</li>
              <li>Vá para Configurações (Settings).</li>
              <li>Encontre a seção de Webhook Global (ou similar).</li>
              <li>Cole o URL acima no campo apropriado.</li>
              <li>Selecione os eventos que deseja receber (especialmente "messages.upsert", "connection.update").</li>
              <li>Salve as configurações na Evolution API.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm">
          {connectionStatus === 'connected' && <Wifi className="h-5 w-5 text-green-500" />}
          {connectionStatus === 'disconnected' && <WifiOff className="h-5 w-5 text-destructive" />}
          {connectionStatus === 'pending' && <Save className="h-5 w-5 animate-spin text-muted-foreground" />}
          <span className={
            connectionStatus === 'connected' ? 'text-green-600' :
            connectionStatus === 'disconnected' ? 'text-destructive' : 'text-muted-foreground'
          }>
            Status da Conexão: {
              connectionStatus === 'connected' ? 'Conectado (Simulado)' :
              connectionStatus === 'disconnected' ? 'Desconectado' : 'Verificando...'
            }
          </span>
        </div>
        <Button onClick={handleSaveChanges} className="bg-primary hover:bg-primary/90" disabled={connectionStatus === 'pending'}>
          <Save className="mr-2 h-4 w-4" />
          {connectionStatus === 'pending' ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
}
