import type { Metric } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type MetricCardProps = {
  metric: Metric;
  icon: React.ElementType;
};

const MetricCard = ({ metric, icon: Icon }: MetricCardProps) => {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
        <Icon className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{metric.value}</div>
        {metric.change && (
          <p className={cn(
            "text-xs mt-1 flex items-center",
            metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
          )}>
            {metric.changeType === 'positive' ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
            {metric.change} from last period
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
