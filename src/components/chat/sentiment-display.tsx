'use client';

import { Smile, Frown, Meh } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type SentimentDisplayProps = {
  score: number;
  confidence?: number;
  simple?: boolean;
  small?: boolean;
};

const SentimentDisplay = ({ score, confidence, simple = false, small = false }: SentimentDisplayProps) => {
  let IconComponent;
  let colorClass;
  let label;

  if (score > 0.3) {
    IconComponent = Smile;
    colorClass = 'text-green-500';
    label = 'Positive';
  } else if (score < -0.3) {
    IconComponent = Frown;
    colorClass = 'text-red-500';
    label = 'Negative';
  } else {
    IconComponent = Meh;
    colorClass = 'text-yellow-500';
    label = 'Neutral';
  }

  const iconSize = small ? "h-3 w-3" : "h-5 w-5";

  if (simple) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={cn(colorClass, "inline-flex items-center ml-1", small ? "text-xs" : "text-sm")}>
              <IconComponent className={iconSize} />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sentiment: {label} ({score.toFixed(2)})</p>
            {confidence && <p>Confidence: {(confidence * 100).toFixed(0)}%</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 p-2 rounded-md bg-background border", small ? "text-xs" : "text-sm")}>
      <IconComponent className={cn(iconSize, colorClass)} />
      <div className="flex flex-col">
        <span className={cn("font-semibold", colorClass)}>{label}</span>
        <span className="text-muted-foreground">Score: {score.toFixed(2)}</span>
        {confidence && <span className="text-muted-foreground">Confidence: {(confidence * 100).toFixed(0)}%</span>}
      </div>
    </div>
  );
};

export default SentimentDisplay;
