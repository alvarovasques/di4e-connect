
'use client';

import type { AiInsight } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Zap, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type AiInsightsFeedProps = {
  insights: AiInsight[];
};

const getInsightIcon = (type: AiInsight['type']) => {
  switch (type) {
    case 'PERFORMANCE': return <Zap className="h-4 w-4" />;
    case 'TRAINING': return <Lightbulb className="h-4 w-4" />;
    case 'PROCESS': return <AlertTriangle className="h-4 w-4" />;
    case 'SATISFACTION': return <Zap className="h-4 w-4" />; 
    default: return <Lightbulb className="h-4 w-4" />;
  }
};

const getPriorityBadgeVariant = (priority: AiInsight['priority']): 'default' | 'secondary' | 'destructive' => {
  switch (priority) {
    case 'HIGH': return 'destructive';
    case 'MEDIUM': return 'default'; 
    case 'LOW': return 'secondary';
    default: return 'secondary';
  }
};

const translateInsightType = (type: AiInsight['type']): string => {
  switch (type) {
    case 'PERFORMANCE': return 'DESEMPENHO';
    case 'TRAINING': return 'TREINAMENTO';
    case 'PROCESS': return 'PROCESSO';
    case 'SATISFACTION': return 'SATISFAÇÃO';
    default: return type;
  }
};

const translatePriority = (priority: AiInsight['priority']): string => {
  switch (priority) {
    case 'HIGH': return 'ALTA';
    case 'MEDIUM': return 'MÉDIA';
    case 'LOW': return 'BAIXA';
    default: return priority;
  }
};


const AiInsightsFeed = ({ insights }: AiInsightsFeedProps) => {
  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Insights e Alertas de IA</CardTitle>
        <CardDescription>Recomendações acionáveis do nosso motor de IA.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4">
          {insights.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhum insight disponível no momento.</p>
          ) : (
            <div className="space-y-4">
              {insights.map((insight) => (
                <div key={insight.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-primary">{getInsightIcon(insight.type)}</span>
                      <h4 className="font-semibold text-md text-foreground">{insight.title}</h4>
                    </div>
                    <Badge variant={getPriorityBadgeVariant(insight.priority)}>{translatePriority(insight.priority)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{insight.content}</p>
                  <p className="text-xs text-muted-foreground/70">
                    {new Date(insight.createdAt).toLocaleDateString('pt-BR')} - {translateInsightType(insight.type)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AiInsightsFeed;
