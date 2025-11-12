import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, BookmarkPlus, BookmarkCheck, Share2, Quote, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AppHeader from "@/components/AppHeader";
import { CommentSection } from "@/components/CommentSection";

interface SavedArticle {
  id: string;
  userId: string;
  title: string;
  authors: string[];
  journal: string;
  publicationDate: string;
  abstract: string;
  tags: string[] | null;
  externalUrl: string | null;
  savedAt: string;
}

export default function ArticleDetailPage() {
  const { articleId } = useParams<{ articleId: string }>();
  
  if (!articleId) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Invalid article ID</p>
          </Card>
        </main>
      </div>
    );
  }
  
  const articleDetailKey = [`/api/saved-articles/${articleId}`] as const;
  
  const { data: article, isLoading, isError, error } = useQuery<SavedArticle>({
    queryKey: articleDetailKey,
  });

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/home">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Feed
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : isError ? (
          <Card className="p-8 text-center" data-testid="error-article-fetch">
            <p className="text-destructive font-medium mb-2">Failed to load article</p>
            <p className="text-muted-foreground text-sm">
              {error instanceof Error ? error.message : "An error occurred while fetching the article"}
            </p>
          </Card>
        ) : article ? (
          <div className="space-y-8">
            <Card className="p-8">
              <div className="space-y-6">
                <div>
                  <h1 className="font-heading text-3xl font-bold leading-tight mb-4" data-testid="text-article-title">
                    {article.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-6">
                    <span data-testid="text-authors" className="font-medium">
                      {article.authors.join(", ")}
                    </span>
                    <span>•</span>
                    <span data-testid="text-journal" className="font-medium text-foreground/70">
                      {article.journal}
                    </span>
                    <span>•</span>
                    <span data-testid="text-date">{article.publicationDate}</span>
                  </div>

                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {article.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" data-testid={`badge-tag-${idx}`}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-border/50 pt-6">
                  <h2 className="font-semibold text-lg mb-3">Abstract</h2>
                  <p className="text-base leading-relaxed text-foreground/80" data-testid="text-abstract">
                    {article.abstract}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                  <Button variant="outline" size="sm" data-testid="button-save-article">
                    <BookmarkPlus className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-share">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-cite">
                    <Quote className="w-4 h-4 mr-2" />
                    Cite
                  </Button>
                  {article.externalUrl && (
                    <Button variant="outline" size="sm" asChild data-testid="link-external">
                      <a href={article.externalUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Article
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            <CommentSection articleId={articleId!} />
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Article not found</p>
          </Card>
        )}
      </main>
    </div>
  );
}
