
import MetricCard from '@/components/dashboard/metric-card';
import PerformanceChart from '@/components/dashboard/performance-chart';
import AiInsightsFeed from '@/components/dashboard/ai-insights-feed';
import { MOCK_METRICS, MOCK_PERFORMANCE_DATA, MOCK_AI_INSIGHTS } from '@/lib/mock-data';
import { Activity, MessageSquare, Users, BarChartBig } from 'lucide-react';

export default function DashboardPage() {
  const icons = [Activity, MessageSquare, Users, BarChartBig];
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline text-foreground">Painel</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {MOCK_METRICS.map((metric, index) => (
          <MetricCard key={metric.id} metric={metric} icon={icons[index % icons.length]} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <PerformanceChart 
            data={MOCK_PERFORMANCE_DATA} 
            title="Volume de Chats ao Longo do Tempo"
            description="Interações de chat mensais em todas as filas."
            type="line"
          />
        </div>
        <div className="lg:col-span-3 h-full">
           <AiInsightsFeed insights={MOCK_AI_INSIGHTS} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
         <PerformanceChart 
            data={MOCK_PERFORMANCE_DATA.map(d => ({...d, value: Math.random() * 100 | 0}))} 
            title="Visão Geral do Desempenho do Agente"
            description="Taxa média de resolução por grupo de agentes."
            type="bar"
          />
          <PerformanceChart 
            data={MOCK_PERFORMANCE_DATA.map(d => ({...d, value: Math.random() * 5 | 0}))} 
            title="Satisfação do Cliente (CSAT)"
            description="Tendências médias das pontuações CSAT."
            type="line"
          />
      </div>
    </div>
  );
}
