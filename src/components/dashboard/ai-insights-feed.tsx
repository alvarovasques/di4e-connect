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
    case 'SATISFACTION': return <Zap className="h-4 w-4" />; // Re-using Zap for now
    default: return <Lightbulb className="h-4 w-4" />;
  }
};

const getPriorityBadgeVariant = (priority: AiInsight['priority']): 'default' | 'secondary' | 'destructive' => {
  switch (priority) {
    case 'HIGH': return 'destructive';
    case 'MEDIUM': return 'default'; // 'default' uses primary color, which might be good for medium
    case 'LOW': return 'secondary';
    default: return 'secondary';
  }
};

const AiInsightsFeed = ({ insights }: AiInsightsFeedProps) => {
  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-xl">AI Insights & Alerts</CardTitle>
        <CardDescription>Actionable recommendations from our AI engine.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4">
          {insights.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No insights available at the moment.</p>
          ) : (
            <div className="space-y-4">
              {insights.map((insight) => (
                <div key={insight.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-primary">{getInsightIcon(insight.type)}</span>
                      <h4 className="font-semibold text-md text-foreground">{insight.title}</h4>
                    </div>
                    <Badge variant={getPriorityBadgeVariant(insight.priority)}>{insight.priority}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{insight.content}</p>
                  <p className="text-xs text-muted-foreground/70">
                    {new Date(insight.createdAt).toLocaleDateString()} - {insight.type}
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
