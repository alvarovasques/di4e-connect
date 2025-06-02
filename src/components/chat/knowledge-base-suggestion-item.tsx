'use client';

import type { KnowledgeBaseArticle } from '@/types';
import { Button } from '@/components/ui/button';
import { FileText, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type KnowledgeBaseSuggestionItemProps = {
  article: KnowledgeBaseArticle;
  onSelectArticle: (article: KnowledgeBaseArticle) => void;
};

const KnowledgeBaseSuggestionItem = ({ article, onSelectArticle }: KnowledgeBaseSuggestionItemProps) => {
  const { toast } = useToast();

  const handleCopySummary = () => {
    navigator.clipboard.writeText(article.summary || article.content.substring(0, 200));
    toast({
      title: "Copied to clipboard",
      description: `Summary of "${article.title}" copied.`,
    });
  };

  return (
    <div className="p-3 border rounded-md bg-card hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <h5 className="font-semibold text-sm text-foreground mb-1 flex items-center">
          <FileText className="h-4 w-4 mr-2 text-primary shrink-0" />
          {article.title}
        </h5>
        {article.relevanceScore && (
          <span className="text-xs text-primary font-medium">
            Relevance: {(article.relevanceScore * 100).toFixed(0)}%
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
        {article.summary || article.content.substring(0,150) + "..."}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="xs" onClick={() => onSelectArticle(article)} className="text-xs">
          View Details
        </Button>
        <Button variant="ghost" size="xs" onClick={handleCopySummary} className="text-xs">
          <Copy className="h-3 w-3 mr-1" /> Copy Summary
        </Button>
      </div>
    </div>
  );
};

export default KnowledgeBaseSuggestionItem;
