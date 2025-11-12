import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BookmarkPlus, ExternalLink, Share2, FileText, Bookmark, ChevronDown, ChevronUp, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

interface ArticleCardProps {
  articleId: string;
  title: string;
  authors: string[];
  journal: string;
  date: string;
  abstract: string;
  tags?: string[];
  externalUrl?: string;
  isSaved?: boolean;
  onSave?: () => void;
  onView?: () => void;
}

export default function ArticleCard({
  articleId,
  title,
  authors,
  journal,
  date,
  abstract,
  tags = [],
  externalUrl,
  isSaved = false,
  onSave,
  onView,
}: ArticleCardProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if abstract is long enough to need expansion
  const needsExpansion = abstract.length > 200;

  // Fetch like status and count
  const { data: likeStatus } = useQuery<{ hasLiked: boolean }>({
    queryKey: [`/api/social/article-likes/check/${articleId}`],
    enabled: !!user,
  });

  const { data: likeCount } = useQuery<{ count: number }>({
    queryKey: [`/api/social/article-likes/count/${articleId}`],
    enabled: !!user,
  });

  const hasLiked = likeStatus?.hasLiked ?? false;
  const likes = likeCount?.count ?? 0;

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/social/article-likes', { articleId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/social/article-likes/check/${articleId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/social/article-likes/count/${articleId}`] });
    },
    onError: (error: any) => {
      if (error.message.includes('Already liked')) {
        return;
      }
      toast({
        title: "Failed to like article",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  // Unlike mutation
  const unlikeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('DELETE', `/api/social/article-likes/${articleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/social/article-likes/check/${articleId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/social/article-likes/count/${articleId}`] });
    },
    onError: () => {
      toast({
        title: "Failed to unlike article",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    if (hasLiked) {
      unlikeMutation.mutate();
    } else {
      likeMutation.mutate();
    }
  };

  const handleShare = () => {
    if (navigator.share && externalUrl) {
      navigator.share({
        title: title,
        text: abstract,
        url: externalUrl,
      }).catch(() => {
        // Fallback to clipboard if share fails
        navigator.clipboard.writeText(externalUrl);
        toast({
          title: "Link copied",
          description: "Article link copied to clipboard",
        });
      });
    } else if (externalUrl) {
      // Fallback for browsers without Web Share API
      navigator.clipboard.writeText(externalUrl);
      toast({
        title: "Link copied",
        description: "Article link copied to clipboard",
      });
    }
  };

  const handleCite = () => {
    const citation = `${authors.join(", ")} (${date}). ${title}. ${journal}.`;
    navigator.clipboard.writeText(citation);
    toast({
      title: "Citation copied",
      description: "APA-style citation copied to clipboard",
    });
  };

  return (
    <Card className="p-6 hover-lift animate-fade-in shadow-sm" data-testid="card-article" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="space-y-5">
        <div>
          <Link href={`/articles/${articleId}`} data-testid="link-article-detail">
            <h3 className="font-heading text-xl font-semibold leading-relaxed mb-3 hover:text-primary transition-colors cursor-pointer" data-testid="text-article-title">
              {title}
            </h3>
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span data-testid="text-authors" className="line-clamp-1">{authors.join(", ")}</span>
            <span>•</span>
            <span data-testid="text-journal" className="font-medium text-foreground/70">{journal}</span>
            <span>•</span>
            <span data-testid="text-date">{date}</span>
          </div>
        </div>

        <div>
          <p 
            className={`text-base leading-relaxed text-foreground/80 transition-all duration-300 ${!isExpanded && needsExpansion ? 'line-clamp-3' : ''}`}
            data-testid="text-abstract"
          >
            {abstract}
          </p>
          {needsExpansion && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-sm text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 font-medium"
              data-testid="button-expand-abstract"
            >
              {isExpanded ? (
                <>
                  <span>Show less</span>
                  <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  <span>Read more</span>
                  <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          )}
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <Badge key={idx} variant="secondary" data-testid={`badge-tag-${idx}`}>
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Inline Actions - Spotify style with Notion tooltips */}
        <div className="flex items-center gap-2 pt-3 border-t border-border/50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLike}
                disabled={likeMutation.isPending || unlikeMutation.isPending}
                data-testid="button-like-article"
                className="gap-2"
              >
                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current text-accent-1' : ''}`} />
                {likes > 0 && <span className="text-sm">{likes}</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{hasLiked ? "Unlike" : "Like this article"}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onSave}
                data-testid="button-save-article"
                className="gap-2"
              >
                {isSaved ? (
                  <Bookmark className="w-4 h-4 fill-current" />
                ) : (
                  <BookmarkPlus className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{isSaved ? "Saved" : "Save"}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isSaved ? "Remove from saved" : "Save for later"}</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleShare}
                data-testid="button-share-article"
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share this article</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleCite}
                data-testid="button-cite-article"
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Cite</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy citation</p>
            </TooltipContent>
          </Tooltip>

          <div className="flex-1" />

          {externalUrl ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <a 
                  href={externalUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  data-testid="button-view-article"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover-elevate min-h-8 px-3 py-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">Read</span>
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Read full article</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={onView}
                  data-testid="button-view-article"
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">Read</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Read full article</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </Card>
  );
}
