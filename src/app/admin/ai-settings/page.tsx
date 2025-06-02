
import AiAgentTable from '@/components/admin/ai-agent-table';
import AiModelTable from '@/components/admin/ai-model-table';
import { MOCK_USERS, MOCK_AI_MODELS } from '@/lib/mock-data';
import { Separator } from '@/components/ui/separator';

export default function AiSettingsPage() {
  const aiAgents = MOCK_USERS.filter(user => user.userType === 'AGENT_AI');
  // MOCK_AI_MODELS will be passed directly to AiModelTable

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline text-foreground mb-2">Gerenciamento de Agentes IA</h1>
        <p className="text-muted-foreground">Configure e gerencie os Agentes de Inteligência Artificial que interagem com seus clientes.</p>
      </div>
      <AiAgentTable agents={aiAgents} />
      
      <Separator className="my-8" />

      <div>
        <h2 className="text-2xl font-bold font-headline text-foreground mb-2">Modelos de IA Configurados</h2>
        <p className="text-muted-foreground">Adicione e gerencie os modelos de linguagem (LLMs) e seus tokens de API para uso pelos Agentes IA.</p>
        <p className="text-xs text-destructive mt-1">
          <strong>Aviso de Segurança:</strong> Em um ambiente de produção, os tokens de API nunca devem ser armazenados ou expostos no frontend.
          Eles devem ser gerenciados de forma segura no backend.
        </p>
      </div>
      <AiModelTable models={MOCK_AI_MODELS} />
    </div>
  );
}
