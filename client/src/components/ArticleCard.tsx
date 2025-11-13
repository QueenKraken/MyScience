import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BookmarkPlus, ExternalLink, Share2, FileText, Bookmark, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
      // Invalidate gamification progress to show updated XP
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/gamification/user-badges"] });
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
    <Card 
      className="
        group relative overflow-hidden
        md:snap-start md:flex-shrink-0 md:w-80
        transition-all duration-300 ease-out
        hover:shadow-xl hover:scale-[1.02]
        animate-fade-in
      " 
      data-testid="card-article"
    >
      {/* Visual Thumbnail - Netflix-style large imagery */}
      <div className="relative aspect-video bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 overflow-hidden">
        {/* Placeholder visual - in production, this would be article thumbnail */}
        <div className="absolute inset-0 flex items-center justify-center">
          <FileText className="w-16 h-16 text-muted-foreground/20" />
        </div>
        
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Quick Save Button - appears on hover */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon"
                variant="secondary"
                onClick={(e) => {
                  e.preventDefault();
                  onSave?.();
                }}
                data-testid="button-quick-save"
                className="shadow-lg backdrop-blur-sm"
              >
                {isSaved ? (
                  <Bookmark className="w-4 h-4 fill-current" />
                ) : (
                  <BookmarkPlus className="w-4 h-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isSaved ? "Saved" : "Save for later"}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Like count badge - visible on hover */}
        {likes > 0 && (
          <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Badge variant="secondary" className="shadow-lg backdrop-blur-sm gap-1">
              <Heart className="w-3 h-3 fill-current" />
              <span>{likes}</span>
            </Badge>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-4">
        {/* Title-first hierarchy - larger, bolder */}
        <div>
          <Link href={`/articles/${articleId}`} data-testid="link-article-detail">
            <h3 className="font-heading text-xl font-bold leading-tight mb-2 hover:text-primary transition-colors cursor-pointer line-clamp-2" data-testid="text-article-title">
              {title}
            </h3>
          </Link>
          
          {/* Compact metadata */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span data-testid="text-journal" className="font-medium text-foreground/70 line-clamp-1">{journal}</span>
            <span>•</span>
            <span data-testid="text-date">{date}</span>
          </div>
          
          {/* Authors - secondary info */}
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1" data-testid="text-authors">
            {authors.join(", ")}
          </p>
        </div>

        {/* Abstract preview - Netflix-style brief preview */}
        <p 
          className="text-sm leading-relaxed text-muted-foreground line-clamp-2"
          data-testid="text-abstract"
        >
          {abstract}
        </p>

        {/* Subject tags - compact pills */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs" data-testid={`badge-tag-${idx}`}>
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Action Bar - Netflix-style compact actions */}
        <div className="flex items-center gap-1.5 pt-3 border-t border-border/50">
          {/* Like button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLike}
                disabled={likeMutation.isPending || unlikeMutation.isPending}
                data-testid="button-like-article"
              >
                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current text-accent' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{hasLiked ? "Unlike" : "Like"}</p>
            </TooltipContent>
          </Tooltip>

          {/* Share button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleShare}
                data-testid="button-share-article"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Share</p>
            </TooltipContent>
          </Tooltip>

          {/* Cite button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleCite}
                data-testid="button-cite-article"
              >
                <FileText className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cite</p>
            </TooltipContent>
          </Tooltip>

          <div className="flex-1" />

          {/* Primary CTA - Read button */}
          {externalUrl ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <a 
                  href={externalUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  data-testid="button-view-article"
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover-elevate min-h-9 h-9 w-9"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>Read article</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="default" 
                  size="icon"
                  onClick={onView}
                  data-testid="button-view-article"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Read article</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </Card>
  );
}
