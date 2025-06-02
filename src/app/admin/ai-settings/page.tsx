
import AiAgentTable from '@/components/admin/ai-agent-table';
import { MOCK_USERS } from '@/lib/mock-data'; // MOCK_USERS still contains AGENT_AI types

export default function AiAgentsManagementPage() {
  // Pass all users; the AiAgentTable component will filter for 'AGENT_AI'
  const aiAgents = MOCK_USERS.filter(user => user.userType === 'AGENT_AI');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline text-foreground">Gerenciamento de Agentes IA</h1>
      <AiAgentTable agents={aiAgents} />
    </div>
  );
}
