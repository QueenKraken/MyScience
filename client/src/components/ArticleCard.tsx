import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookmarkPlus, ExternalLink } from "lucide-react";

interface ArticleCardProps {
  title: string;
  authors: string[];
  journal: string;
  date: string;
  abstract: string;
  tags?: string[];
  onSave?: () => void;
  onView?: () => void;
}

export default function ArticleCard({
  title,
  authors,
  journal,
  date,
  abstract,
  tags = [],
  onSave,
  onView,
}: ArticleCardProps) {
  return (
    <Card className="p-6 hover-lift animate-fade-in shadow-sm" data-testid="card-article" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="space-y-5">
        <div>
          <h3 className="font-heading text-xl font-semibold leading-relaxed mb-3" data-testid="text-article-title">
            {title}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span data-testid="text-authors" className="line-clamp-1">{authors.join(", ")}</span>
            <span>•</span>
            <span data-testid="text-journal" className="font-medium text-foreground/70">{journal}</span>
            <span>•</span>
            <span data-testid="text-date">{date}</span>
          </div>
        </div>

        <p className="text-base leading-relaxed line-clamp-3 text-foreground/80" data-testid="text-abstract">
          {abstract}
        </p>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <Badge key={idx} variant="secondary" data-testid={`badge-tag-${idx}`}>
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-3">
          <Button 
            variant="default" 
            onClick={onView}
            data-testid="button-view-article"
            className="flex-1 sm:flex-none"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Article
          </Button>
          <Button 
            variant="outline" 
            onClick={onSave}
            data-testid="button-save-article"
            className="flex-1 sm:flex-none"
          >
            <BookmarkPlus className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
    </Card>
  );
}
